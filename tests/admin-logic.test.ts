import { describe, expect, it } from "vitest";
import en from "@/i18n/app/en";
import es from "@/i18n/app/es";
import { describeActivity, describeChanges } from "@/lib/admin/activity";
import { type ClientRow, clientsToCsv, filterClients } from "@/lib/admin/clients";
import { fetchAll } from "@/lib/admin/fetch-all";
import {
  calculateRevenue,
  countSince,
  countUnreconciled,
  monthStart,
  reconciliationStatus,
  summariseSites,
} from "@/lib/admin/metrics";
import { siteSchema } from "@/lib/admin/schemas";

function client(overrides: Partial<ClientRow> = {}): ClientRow {
  return {
    id: "1",
    name: "Acme",
    primary_contact_name: "Ann",
    email: "ann@acme.test",
    phone: "555",
    billing_address: null,
    city: "Austin",
    state: "TX",
    country: "US",
    status: "active",
    notes: null,
    created_at: "2026-10-01T00:00:00Z",
    subscriptions: [{ status: "active", plans: { name: "Monitored" } }],
    ...overrides,
  };
}

describe("calculateRevenue", () => {
  it("matches a hand calculation and ignores subscriptions that aren't active", () => {
    const result = calculateRevenue([
      // 10 x 19.99 = 199.90 revenue, 10 x 7.50 = 75.00 cost
      { status: "active", cameras_billed: 10, price_per_camera_month: 19.99, provider_cost_per_camera_month: 7.5 },
      // 3 x 29.50 = 88.50 revenue, 3 x 12.25 = 36.75 cost
      { status: "active", cameras_billed: 3, price_per_camera_month: 29.5, provider_cost_per_camera_month: 12.25 },
      { status: "trial", cameras_billed: 100, price_per_camera_month: 50, provider_cost_per_camera_month: 20 },
      { status: "past_due", cameras_billed: 100, price_per_camera_month: 50, provider_cost_per_camera_month: 20 },
      { status: "cancelled", cameras_billed: 100, price_per_camera_month: 50, provider_cost_per_camera_month: 20 },
    ]);
    expect(result).toEqual({ mrr: 288.4, providerCost: 111.75, grossMargin: 176.65 });
  });

  it("handles numeric values returned as strings by the database", () => {
    const result = calculateRevenue([
      {
        status: "active",
        cameras_billed: 2,
        price_per_camera_month: "10.10" as unknown as number,
        provider_cost_per_camera_month: "4.05" as unknown as number,
      },
    ]);
    expect(result).toEqual({ mrr: 20.2, providerCost: 8.1, grossMargin: 12.1 });
  });
});

describe("site totals", () => {
  it("counts a new pending site and leaves out removed ones", () => {
    expect(
      summariseSites([
        { status: "pending", camera_count: 4 },
        { status: "online", camera_count: 6 },
        { status: "offline", camera_count: 2 },
        { status: "removed", camera_count: 50 },
      ]),
    ).toEqual({ activeSites: 3, totalCameras: 12 });
  });
});

describe("reconciliation", () => {
  it("flags a deliberate camera count mismatch, even if it was marked matched", () => {
    expect(reconciliationStatus(8, { provider_camera_count: 6, matched: true })).toBe("mismatch");
  });

  it("needs both agreeing counts and the matched tick", () => {
    expect(reconciliationStatus(8, undefined)).toBe("unchecked");
    expect(reconciliationStatus(8, { provider_camera_count: null, matched: false })).toBe("unchecked");
    expect(reconciliationStatus(8, { provider_camera_count: 8, matched: false })).toBe("unchecked");
    expect(reconciliationStatus(8, { provider_camera_count: 8, matched: true })).toBe("matched");
  });

  it("counts every active site that isn't matched this month", () => {
    const sites = [
      { id: "matched", status: "online", camera_count: 4 },
      { id: "mismatch", status: "online", camera_count: 4 },
      { id: "unchecked", status: "pending", camera_count: 4 },
      { id: "changed-since", status: "online", camera_count: 9 },
      { id: "removed", status: "removed", camera_count: 4 },
    ];
    const records = [
      { site_id: "matched", provider_camera_count: 4, matched: true },
      { site_id: "mismatch", provider_camera_count: 3, matched: false },
      { site_id: "changed-since", provider_camera_count: 4, matched: true },
    ];
    expect(countUnreconciled(sites, records)).toBe(3);
  });

  it("stores months as the first of the month in UTC", () => {
    expect(monthStart(new Date("2026-03-31T23:59:00Z"))).toBe("2026-03-01");
  });
});

describe("countSince", () => {
  it("counts rows inside the window", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    const leads = [
      { created_at: "2026-10-31T00:00:00Z" },
      { created_at: "2026-10-24T12:00:00Z" },
      { created_at: "2026-10-20T00:00:00Z" },
      { created_at: "2026-09-01T00:00:00Z" },
    ];
    expect(countSince(leads, 7, now)).toBe(2);
    expect(countSince(leads, 30, now)).toBe(3);
  });
});

describe("filterClients", () => {
  const clients = [
    client({ id: "a", name: "Acme" }),
    client({ id: "b", name: "Bolt", city: "Dallas", status: "lead", subscriptions: [] }),
    client({
      id: "c",
      name: "Core",
      city: "Austin",
      subscriptions: [{ status: "cancelled", plans: { name: "Essentials" } }],
    }),
  ];
  const ids = (filters: Parameters<typeof filterClients>[1]) =>
    filterClients(clients, filters).map((row) => row.id);

  it("filters by status, city (ignoring case), plan and search", () => {
    expect(ids({})).toEqual(["a", "b", "c"]);
    expect(ids({ status: "lead" })).toEqual(["b"]);
    expect(ids({ city: "austin" })).toEqual(["a", "c"]);
    expect(ids({ q: "BOL" })).toEqual(["b"]);
  });

  it("doesn't count a cancelled subscription as being on a plan", () => {
    expect(ids({ plan: "Monitored" })).toEqual(["a"]);
    expect(ids({ plan: "Essentials" })).toEqual([]);
  });
});

describe("clientsToCsv", () => {
  it("quotes commas and quotes", () => {
    const csv = clientsToCsv([client({ name: 'Acme, "the" Co' })]);
    expect(csv.split("\r\n")[1]).toContain('"Acme, ""the"" Co"');
  });

  it("stops spreadsheet formulas in values that came from the public form", () => {
    const csv = clientsToCsv([client({ name: '=HYPERLINK("http://evil.test")', phone: "+1555" })]);
    const row = csv.split("\r\n")[1];
    expect(row.startsWith(`"'=HYPERLINK`)).toBe(true);
    expect(row).toContain("'+1555");
  });
});

describe("fetchAll", () => {
  it("keeps reading until a page comes back short", async () => {
    const calls: number[] = [];
    const rows = await fetchAll<number>(async (from) => {
      calls.push(from);
      return { data: new Array(from === 0 ? 1000 : 5).fill(1), error: null };
    });
    expect(rows).toHaveLength(1005);
    expect(calls).toEqual([0, 1000]);
  });

  it("throws rather than returning partial totals", async () => {
    await expect(
      fetchAll(async () => ({ data: null, error: { message: "boom" } })),
    ).rejects.toThrow("boom");
  });
});

describe("activity feed", () => {
  it("describes actions in plain words", () => {
    expect(describeActivity("organizations.update", en.activity)).toBe("Updated client");
    expect(describeActivity("sites.insert", en.activity)).toBe("Added site");
  });

  it("describes actions in the admin's language", () => {
    expect(describeActivity("sites.insert", es.activity)).toBe("Se agregó local");
  });

  it("shows before and after values on updates", () => {
    expect(
      describeChanges(
        {
          action: "organizations.update",
          details: { changes: { status: { from: "lead", to: "approved" } } },
        },
        en.activity,
      ),
    ).toEqual(["status: lead → approved"]);
  });
});

describe("siteSchema", () => {
  const valid = {
    org_id: "aaaaaaaa-0000-4000-8000-000000000001",
    name: "Main",
    address: "",
    city: "",
    state: "",
    country: "",
    dvr_brand: "",
    dvr_model: "",
    dvr_password_known: "",
    camera_count: "4",
    monitoring_hours: "",
    provider_customer_ref: "",
    cloud_adapter_id: "",
    camera_access_url: "",
    installed_at: "",
    status: "pending",
  };

  it("turns blank fields into nulls and counts into numbers", () => {
    const result = siteSchema.parse(valid);
    expect(result).toMatchObject({ address: null, camera_access_url: null, camera_count: 4 });
  });

  it("only allows https camera links", () => {
    const check = (camera_access_url: string) =>
      siteSchema.safeParse({ ...valid, camera_access_url }).success;
    expect(check("https://viewer.example.com/abc")).toBe(true);
    expect(check("http://viewer.example.com/abc")).toBe(false);
    expect(check("javascript:alert(1)")).toBe(false);
  });

  it("rejects negative and fractional camera counts", () => {
    expect(siteSchema.safeParse({ ...valid, camera_count: "-1" }).success).toBe(false);
    expect(siteSchema.safeParse({ ...valid, camera_count: "1.5" }).success).toBe(false);
  });
});
