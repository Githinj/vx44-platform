import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/app/en";
import { statusEmailFor } from "@/lib/admin/status-email";
import { buildStatusEmail } from "@/lib/email";

// SEC-272: emailing a client's owners when their status reaches approved, installed or active.

const ORG = "aaaaaaaa-0000-4000-8000-000000000001";

let before: { name: string; status: string } | null;
let owners: { profiles: { email: string } | null }[];
let updates: unknown[];

// A stand-in for the admin's Supabase client: just the queries updateClientStatus makes.
function query(table: string) {
  const result = () =>
    table === "memberships" ? { data: owners, error: null } : { data: null, error: null };
  const chain = {
    select: () => chain,
    eq: () => chain,
    overrideTypes: () => chain,
    update: (values: unknown) => (updates.push(values), chain),
    maybeSingle: async () => ({ data: before, error: null }),
    then: (resolve: (value: unknown) => void) => resolve(result()),
  };
  return chain;
}

vi.mock("@/lib/auth", () => ({ requireAdmin: async () => ({ supabase: { from: query } }) }));
vi.mock("@/i18n/app-text", () => ({ getAppText: async () => ({ locale: "en", t: en, format: "en-US" }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { updateClientStatus } = await import("@/app/(app)/admin/actions");

let fetchMock: ReturnType<typeof vi.fn>;

function form(status: string) {
  const data = new FormData();
  data.set("id", ORG);
  data.set("status", status);
  return data;
}

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
  vi.stubEnv("SENDGRID_API_KEY", "sendgrid-key");
  vi.stubEnv("SENDGRID_FROM_EMAIL", "hello@vx44ai.com");
  vi.stubEnv("ADMIN_EMAILS", "one@vx44ai.com");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "turnstile-secret");
  vi.stubEnv("RATE_LIMIT_SALT", "0123456789abcdef");
  vi.stubEnv("SITE_URL", "https://vx44ai.com");

  before = { name: "Lee Tyres", status: "compatibility_check" };
  owners = [{ profiles: { email: "sam@example.com" } }, { profiles: { email: "kim@example.com" } }];
  updates = [];
  fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("statusEmailFor", () => {
  it.each([
    ["compatibility_check", "approved", "approved"],
    ["adapter_shipped", "installed", "installed"],
    ["installed", "active", "active"],
    ["paused", "active", "active"],
    ["lead", "active", "active"],
  ])("emails on %s → %s", (from, to, expected) => {
    expect(statusEmailFor(from, to)).toBe(expected);
  });

  it.each([
    ["approved", "approved"],
    ["approved", "adapter_shipped"],
    ["active", "paused"],
    ["active", "installed"],
    ["installed", "approved"],
  ])("stays quiet on %s → %s", (from, to) => {
    expect(statusEmailFor(from, to)).toBeNull();
  });
});

describe("buildStatusEmail", () => {
  it("names the business, links to the portal and escapes HTML", () => {
    const { subject, html, text } = buildStatusEmail({
      organization: `<b>Lee</b> Tyres`,
      status: "active",
      portalUrl: "https://vx44ai.com/portal",
    });
    expect(subject).toBe("VX44 monitoring is now active");
    expect(html).toContain('href="https://vx44ai.com/portal"');
    expect(html).toContain("&lt;b&gt;Lee&lt;/b&gt; Tyres");
    expect(html).not.toContain("<b>Lee</b>");
    expect(text).toContain("Client portal: https://vx44ai.com/portal");
  });
});

describe("updateClientStatus", () => {
  it("saves the status and emails each owner separately", async () => {
    const state = await updateClientStatus({}, form("approved"));

    expect(updates).toEqual([{ status: "approved" }]);
    expect(state).toEqual({ saved: en.client.statusEmailed });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const mail = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(mail.personalizations).toEqual([
      { to: [{ email: "sam@example.com" }] },
      { to: [{ email: "kim@example.com" }] },
    ]);
    expect(mail.subject).toBe("Your VX44 setup is approved");
    expect(mail.content[1].value).toContain("Lee Tyres");
    expect(mail.content[1].value).toContain("https://vx44ai.com/portal");
  });

  it("sends nothing when the status doesn't move forward into an emailed one", async () => {
    before = { name: "Lee Tyres", status: "approved" };
    expect(await updateClientStatus({}, form("approved"))).toEqual({ saved: en.common.saved });
    expect(await updateClientStatus({}, form("adapter_shipped"))).toEqual({ saved: en.common.saved });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(updates).toHaveLength(2);
  });

  it("says so when there's no owner to email", async () => {
    owners = [];
    expect(await updateClientStatus({}, form("approved"))).toEqual({ saved: en.client.statusNoOwner });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the new status and tells the admin when the email fails", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const state = await updateClientStatus({}, form("installed"));
    expect(updates).toEqual([{ status: "installed" }]);
    expect(state).toEqual({ error: en.errors.statusEmailFailed });
  });
});
