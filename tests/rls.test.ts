import { readFileSync } from "node:fs";
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const MIGRATIONS = [
  "supabase/migrations/20261031000000_phase1_schema.sql",
  "supabase/migrations/20261031120000_admin_back_office.sql",
];

const ORG_A = "aaaaaaaa-0000-4000-8000-000000000001";
const ORG_B = "bbbbbbbb-0000-4000-8000-000000000002";
const CLIENT_A = "aaaaaaaa-1111-4000-8000-000000000001";
const CLIENT_B = "bbbbbbbb-1111-4000-8000-000000000002";
const ADMIN = "cccccccc-1111-4000-8000-000000000003";
const PLAN = "dddddddd-0000-4000-8000-000000000004";

type Claims = { sub: string; aal: "aal1" | "aal2" };
type Run = (tx: Transaction) => Promise<void>;

let db: PGlite;

// Runs as an API role with the given JWT claims, then rolls back so tests stay independent.
async function as(role: string, claims: Claims | null, run: Run) {
  await db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(claims ?? {}),
    ]);
    await tx.exec(`set local role ${role}`);
    await run(tx);
    await tx.rollback();
  });
}

const clientA: Claims = { sub: CLIENT_A, aal: "aal1" };
const adminMfa: Claims = { sub: ADMIN, aal: "aal2" };

async function rows(tx: Transaction, sql: string) {
  return (await tx.query<Record<string, unknown>>(sql)).rows;
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync("tests/helpers/supabase-stub.sql", "utf8"));
  for (const migration of MIGRATIONS) {
    await db.exec(readFileSync(migration, "utf8"));
  }
  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${CLIENT_A}', 'a@example.com', '{"role": "admin"}'),
      ('${CLIENT_B}', 'b@example.com', '{}'),
      ('${ADMIN}', 'admin@example.com', '{}');
    update public.profiles set role = 'admin' where id = '${ADMIN}';

    insert into public.organizations (id, name, notes) values
      ('${ORG_A}', 'Org A', 'internal note A'),
      ('${ORG_B}', 'Org B', 'internal note B');
    insert into public.memberships (user_id, org_id, role) values
      ('${CLIENT_A}', '${ORG_A}', 'owner'),
      ('${CLIENT_B}', '${ORG_B}', 'owner');
    insert into public.sites (org_id, name, provider_customer_ref, status) values
      ('${ORG_A}', 'Site A', 'REF-A', 'online'),
      ('${ORG_A}', 'Old site A', 'REF-OLD', 'removed'),
      ('${ORG_B}', 'Site B', 'REF-B', 'online');
    insert into public.plans (id, name, price_per_camera_month, provider_cost_per_camera_month)
      values ('${PLAN}', 'Essentials', 10, 4);
    insert into public.subscriptions (org_id, plan_id, cameras_billed) values
      ('${ORG_A}', '${PLAN}', 4),
      ('${ORG_B}', '${PLAN}', 9);
    insert into public.documents (org_id, title, storage_path) values
      ('${ORG_A}', 'Agreement A', 'a/agreement.pdf'),
      ('${ORG_B}', 'Agreement B', 'b/agreement.pdf');
    insert into public.leads (full_name, business_name, email, phone, city, state,
        camera_count_estimate, dvr_brand, knows_dvr_password)
      values ('Lead', 'Biz', 'lead@example.com', '555-0100', 'Austin', 'TX', 8, 'Dahua', 'yes');
    insert into public.activity_log (org_id, actor_id, action)
      values ('${ORG_A}', '${ADMIN}', 'seed');
  `);
});

describe("schema", () => {
  it("has RLS enabled on every table", async () => {
    const { rows: missing } = await db.query(`
      select n.nspname, c.relname from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r' and n.nspname in ('public', 'private') and not c.relrowsecurity
    `);
    expect(missing).toEqual([]);
  });

  it("creates a client profile for new users and ignores a role in user metadata", async () => {
    const result = await db.query<{ role: string }>(
      `select role from public.profiles where id = '${CLIENT_A}'`,
    );
    expect(result.rows[0].role).toBe("client");
  });
});

describe("anonymous visitors", () => {
  it.each([
    "profiles", "organizations", "memberships", "sites", "plans", "subscriptions",
    "leads", "documents", "activity_log", "reconciliations",
    "client_organizations", "client_sites", "client_plans",
  ])("cannot read %s", async (table) => {
    await expect(
      as("anon", null, async (tx) => void (await rows(tx, `select * from public.${table}`))),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot insert a lead directly, which would bypass Turnstile", async () => {
    await expect(
      as("anon", null, async (tx) => {
        await tx.exec(`insert into public.leads (full_name, business_name, email, phone, city,
          state, camera_count_estimate, dvr_brand, knows_dvr_password)
          values ('x', 'x', 'x@x.com', '1', 'x', 'x', 1, 'Other', 'no')`);
      }),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot call the rate limit function", async () => {
    await expect(
      as("anon", null, async (tx) => {
        await tx.exec(`select public.check_lead_rate_limit('k', 5, 3600)`);
      }),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("client users", () => {
  it("see only their own org through the client views", async () => {
    await as("authenticated", clientA, async (tx) => {
      expect(await rows(tx, `select name from public.client_organizations`)).toEqual([
        { name: "Org A" },
      ]);
      expect(await rows(tx, `select name from public.client_sites`)).toEqual([
        { name: "Site A" },
      ]);
    });
  });

  it("see only their own subscriptions, documents, memberships and profile", async () => {
    await as("authenticated", clientA, async (tx) => {
      expect(await rows(tx, `select cameras_billed from public.subscriptions`)).toEqual([
        { cameras_billed: 4 },
      ]);
      expect(await rows(tx, `select title from public.documents`)).toEqual([
        { title: "Agreement A" },
      ]);
      expect(await rows(tx, `select org_id from public.memberships`)).toEqual([
        { org_id: ORG_A },
      ]);
      expect(await rows(tx, `select id from public.profiles`)).toEqual([{ id: CLIENT_A }]);
    });
  });

  it.each(["organizations", "sites", "plans", "leads", "activity_log", "reconciliations"])(
    "get no rows from admin-only table %s",
    async (table) => {
      await as("authenticated", clientA, async (tx) => {
        expect(await rows(tx, `select * from public.${table}`)).toEqual([]);
      });
    },
  );

  it("never receive internal columns through the client views", async () => {
    await as("authenticated", clientA, async (tx) => {
      const [org] = await rows(tx, `select * from public.client_organizations`);
      const [site] = await rows(tx, `select * from public.client_sites`);
      const [plan] = await rows(tx, `select * from public.client_plans`);
      expect(org).not.toHaveProperty("notes");
      expect(site).not.toHaveProperty("provider_customer_ref");
      expect(site).not.toHaveProperty("cloud_adapter_id");
      expect(plan).not.toHaveProperty("provider_cost_per_camera_month");
      expect(plan).toMatchObject({ name: "Essentials" });
    });
  });

  it("cannot promote themselves to admin", async () => {
    await expect(
      as("authenticated", clientA, async (tx) => {
        await tx.exec(`update public.profiles set role = 'admin' where id = '${CLIENT_A}'`);
      }),
    ).rejects.toThrow(/permission denied/);
  });

  it("can update their own name and phone, but nobody else's", async () => {
    await as("authenticated", clientA, async (tx) => {
      await tx.exec(`update public.profiles set phone = '555-0199'`);
      await tx.exec(`reset role`);
      const { rows: changed } = await tx.query<{ id: string }>(
        `select id from public.profiles where phone = '555-0199'`,
      );
      expect(changed).toEqual([{ id: CLIENT_A }]);
    });
  });

  it("cannot add themselves to another org", async () => {
    await expect(
      as("authenticated", clientA, async (tx) => {
        await tx.exec(`insert into public.memberships (user_id, org_id)
          values ('${CLIENT_A}', '${ORG_B}')`);
      }),
    ).rejects.toThrow(/row-level security/);
  });

  it("cannot change their subscription", async () => {
    await as("authenticated", clientA, async (tx) => {
      const result = await tx.query(`update public.subscriptions set cameras_billed = 0`);
      expect(result.affectedRows).toBe(0);
    });
  });
});

describe("admins", () => {
  it("see everything once MFA is complete", async () => {
    await as("authenticated", adminMfa, async (tx) => {
      expect(await rows(tx, `select id from public.organizations`)).toHaveLength(2);
      expect(await rows(tx, `select id from public.sites`)).toHaveLength(3);
      expect(await rows(tx, `select id from public.leads`)).toHaveLength(1);
      const [plan] = await rows(tx, `select * from public.plans`);
      expect(plan).toHaveProperty("provider_cost_per_camera_month");
    });
  });

  it("see no admin data without MFA", async () => {
    await as("authenticated", { sub: ADMIN, aal: "aal1" }, async (tx) => {
      expect(await rows(tx, `select id from public.organizations`)).toEqual([]);
      expect(await rows(tx, `select id from public.leads`)).toEqual([]);
      expect(await rows(tx, `select id from public.profiles`)).toEqual([{ id: ADMIN }]);
    });
  });

  it("can append to the activity log only as themselves", async () => {
    await as("authenticated", adminMfa, async (tx) => {
      await tx.exec(`insert into public.activity_log (actor_id, action)
        values ('${ADMIN}', 'test')`);
    });
    await expect(
      as("authenticated", adminMfa, async (tx) => {
        await tx.exec(`insert into public.activity_log (actor_id, action)
          values ('${CLIENT_A}', 'forged')`);
      }),
    ).rejects.toThrow(/row-level security/);
  });

  it.each(["update public.activity_log set action = 'x'", "delete from public.activity_log"])(
    "cannot rewrite the activity log: %s",
    async (statement) => {
      await expect(
        as("authenticated", adminMfa, async (tx) => void (await tx.exec(statement))),
      ).rejects.toThrow(/permission denied/);
    },
  );
});

describe("lead form path", () => {
  it("lets the service role insert leads and enforces the rate limit", async () => {
    await as("service_role", null, async (tx) => {
      await tx.exec(`insert into public.leads (full_name, business_name, email, phone, city,
        state, camera_count_estimate, dvr_brand, knows_dvr_password)
        values ('x', 'x', 'x@x.com', '1', 'x', 'x', 1, 'Other', 'no')`);

      const results: unknown[] = [];
      for (let i = 0; i < 3; i += 1) {
        const [row] = await rows(
          tx,
          `select public.check_lead_rate_limit('ip-hash', 2, 3600) as allowed`,
        );
        results.push(row.allowed);
      }
      expect(results).toEqual([true, true, false]);
    });
  });

  it.each([
    ["dvr_brand", `'Sony', 'yes'`],
    ["knows_dvr_password", `'Dahua', 'maybe'`],
  ])("rejects an invalid %s", async (_column, values) => {
    await expect(
      db.exec(`insert into public.leads (full_name, business_name, email, phone, city, state,
        camera_count_estimate, dvr_brand, knows_dvr_password)
        values ('x', 'x', 'x@x.com', '1', 'x', 'x', 1, ${values})`),
    ).rejects.toThrow(/check constraint/);
  });
});
