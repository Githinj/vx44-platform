import { readFileSync } from "node:fs";
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const ADMIN = "cccccccc-1111-4000-8000-000000000003";
const CLIENT = "aaaaaaaa-1111-4000-8000-000000000001";
const LEAD = "eeeeeeee-0000-4000-8000-000000000005";

let db: PGlite;

// Runs as `authenticated` with the given JWT claims, then rolls back so tests stay independent.
async function as(sub: string | null, aal: string, run: (tx: Transaction) => Promise<void>) {
  await db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(sub ? { sub, aal } : {}),
    ]);
    await tx.exec(`set local role ${sub ? "authenticated" : "service_role"}`);
    await run(tx);
    await tx.rollback();
  });
}

async function logRows(tx: Transaction) {
  await tx.exec("reset role");
  const result = await tx.query<{
    action: string;
    org_id: string | null;
    actor_id: string | null;
    details: { changes: Record<string, { from: unknown; to: unknown }> };
  }>("select action, org_id, actor_id, details from public.activity_log order by created_at");
  return result.rows;
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync("tests/helpers/supabase-stub.sql", "utf8"));
  await db.exec(readFileSync("supabase/migrations/20261031000000_phase1_schema.sql", "utf8"));
  await db.exec(readFileSync("supabase/migrations/20261031120000_admin_back_office.sql", "utf8"));
  await db.exec(`
    insert into auth.users (id, email) values
      ('${ADMIN}', 'admin@example.com'),
      ('${CLIENT}', 'client@example.com');
    update public.profiles set role = 'admin' where id = '${ADMIN}';
    insert into public.leads (id, full_name, business_name, email, phone, city, state,
        camera_count_estimate, dvr_brand, knows_dvr_password, message)
      values ('${LEAD}', 'Sam Lee', 'Lee Tyres', 'sam@example.com', '555-0100', 'Austin', 'TX', 8,
        'Dahua', 'yes', 'Two sites');
  `);
});

describe("convert_lead", () => {
  it("creates the organization, marks the lead converted and logs both", async () => {
    await as(ADMIN, "aal2", async (tx) => {
      const { rows } = await tx.query<{ id: string }>(`select public.convert_lead('${LEAD}') as id`);
      const orgId = rows[0].id;

      const org = await tx.query<Record<string, string>>(
        `select name, primary_contact_name, email, phone, city, state, status, notes
         from public.organizations where id = '${orgId}'`,
      );
      expect(org.rows[0]).toMatchObject({
        name: "Lee Tyres",
        primary_contact_name: "Sam Lee",
        email: "sam@example.com",
        phone: "555-0100",
        city: "Austin",
        state: "TX",
        status: "compatibility_check",
      });
      expect(org.rows[0].notes).toContain("about 8 cameras");
      expect(org.rows[0].notes).toContain("Two sites");

      const lead = await tx.query<{ status: string; converted_org_id: string }>(
        `select status, converted_org_id from public.leads where id = '${LEAD}'`,
      );
      expect(lead.rows[0]).toEqual({ status: "converted", converted_org_id: orgId });

      const log = await logRows(tx);
      expect(log.map((row) => row.action).sort()).toEqual(["leads.update", "organizations.insert"]);
      expect(log.every((row) => row.org_id === orgId && row.actor_id === ADMIN)).toBe(true);
    });
  });

  it("refuses to convert the same lead twice", async () => {
    await as(ADMIN, "aal2", async (tx) => {
      await tx.query(`select public.convert_lead('${LEAD}')`);
      await expect(tx.query(`select public.convert_lead('${LEAD}')`)).rejects.toThrow(
        "already converted",
      );
    });
  });

  it("is unavailable to admins without MFA and to clients", async () => {
    for (const [sub, aal] of [
      [ADMIN, "aal1"],
      [CLIENT, "aal2"],
    ]) {
      await as(sub, aal, async (tx) => {
        await expect(tx.query(`select public.convert_lead('${LEAD}')`)).rejects.toThrow(
          "Lead not found",
        );
      });
    }
  });

  it("cannot be called by anon", async () => {
    await db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      await expect(tx.query(`select public.convert_lead('${LEAD}')`)).rejects.toThrow(
        "permission denied",
      );
      await tx.rollback();
    });
  });
});

describe("audit trigger", () => {
  it("records what changed, old and new, against the organization", async () => {
    await as(ADMIN, "aal2", async (tx) => {
      const { rows } = await tx.query<{ id: string }>(
        `insert into public.organizations (name) values ('Org') returning id`,
      );
      await tx.query(
        `update public.organizations set status = 'approved' where id = '${rows[0].id}'`,
      );
      const log = await logRows(tx);
      expect(log.at(-1)).toMatchObject({
        action: "organizations.update",
        org_id: rows[0].id,
        actor_id: ADMIN,
        details: { changes: { status: { from: "lead", to: "approved" } } },
      });
    });
  });

  it("skips updates that change nothing", async () => {
    await as(ADMIN, "aal2", async (tx) => {
      const { rows } = await tx.query<{ id: string }>(
        `insert into public.organizations (name) values ('Org') returning id`,
      );
      await tx.query(`update public.organizations set name = 'Org' where id = '${rows[0].id}'`);
      const log = await logRows(tx);
      expect(log.map((row) => row.action)).toEqual(["organizations.insert"]);
    });
  });

  it("attributes reconciliations to the site's organization", async () => {
    await as(ADMIN, "aal2", async (tx) => {
      const org = await tx.query<{ id: string }>(
        `insert into public.organizations (name) values ('Org') returning id`,
      );
      const site = await tx.query<{ id: string }>(
        `insert into public.sites (org_id, name) values ('${org.rows[0].id}', 'Site') returning id`,
      );
      await tx.query(
        `insert into public.reconciliations (month, site_id, our_camera_count)
         values ('2026-10-01', '${site.rows[0].id}', 4)`,
      );
      const log = await logRows(tx);
      expect(log.at(-1)).toMatchObject({
        action: "reconciliations.insert",
        org_id: org.rows[0].id,
      });
    });
  });

  it("does not log service-role writes such as the public lead form", async () => {
    await as(null, "", async (tx) => {
      await tx.query(
        `insert into public.leads (full_name, business_name, email, phone, city, state,
           camera_count_estimate, dvr_brand, knows_dvr_password)
         values ('A', 'B', 'c@example.com', '1', 'D', 'E', 1, 'Dahua', 'no')`,
      );
      expect(await logRows(tx)).toEqual([]);
    });
  });
});

describe("document storage", () => {
  it("creates a private bucket", async () => {
    const { rows } = await db.query<{ public: boolean }>(
      `select public from storage.buckets where id = 'documents'`,
    );
    expect(rows[0].public).toBe(false);
  });

  it("lets only an admin with MFA touch document files", async () => {
    const insert = `insert into storage.objects (bucket_id, name) values ('documents', 'org/file.pdf')`;
    await db.exec("grant usage on schema storage to authenticated");
    await db.exec("grant all on storage.objects to authenticated");

    await as(ADMIN, "aal2", async (tx) => {
      await tx.query(insert);
    });
    for (const [sub, aal] of [
      [ADMIN, "aal1"],
      [CLIENT, "aal2"],
    ]) {
      await as(sub, aal, async (tx) => {
        await expect(tx.query(insert)).rejects.toThrow("row-level security");
      });
    }
  });
});
