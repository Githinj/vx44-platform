import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/app/en";

// inviteClientUser and accounts that already exist (security review on SEC-240). Inviting an
// address that already has an account links that account to the client with no email. That's
// safe only for an account a VX44 invite created and its owner accepted. Any other account, such
// as a self sign-up with the client's address, must be refused, or whoever made it would get the
// client's portal. The whole flow runs against a real stack in e2e-admin/admin.spec.ts.

const ORG = "aaaaaaaa-0000-4000-8000-000000000001";
const NEW_USER = "bbbbbbbb-0000-4000-8000-000000000002";
const EXISTING = "cccccccc-0000-4000-8000-000000000003";

let existing: { id: string; role: string } | null;
const upserts: unknown[] = [];
const inviteUserByEmail = vi.fn();
const getUserById = vi.fn();

// The admin's own client: just the queries inviteClientUser makes.
function from(table: string) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () =>
      table === "organizations" ? { data: { id: ORG }, error: null } : { data: existing, error: null },
    upsert: async (row: unknown) => (upserts.push(row), { error: null }),
  };
  return chain;
}

vi.mock("@/lib/auth", () => ({ requireAdmin: async () => ({ supabase: { from } }) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ auth: { admin: { inviteUserByEmail, getUserById } } }),
}));
vi.mock("@/lib/env", () => ({ getServiceRoleEnv: () => ({}), getServerEnv: () => ({}) }));
vi.mock("@/lib/app-url", () => ({ appUrl: () => "http://localhost:3000" }));
vi.mock("@/i18n/app-text", () => ({ getAppText: async () => ({ locale: "en", t: en, format: "en-US" }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { inviteClientUser } = await import("@/app/(app)/admin/actions");

function invite(email = "priya@example.com") {
  const data = new FormData();
  data.set("org_id", ORG);
  data.set("email", email);
  data.set("full_name", "");
  data.set("role", "owner");
  return inviteClientUser({}, data);
}

const alreadyRegistered = { data: { user: null }, error: { code: "email_exists", message: "already registered" } };

beforeEach(() => {
  existing = null;
  upserts.length = 0;
  inviteUserByEmail.mockReset();
  getUserById.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("inviteClientUser", () => {
  it("invites someone new and gives them access", async () => {
    inviteUserByEmail.mockResolvedValue({ data: { user: { id: NEW_USER } }, error: null });

    const result = await invite();

    expect(result).toEqual({ saved: "Invite sent to priya@example.com." });
    expect(upserts).toEqual([{ user_id: NEW_USER, org_id: ORG, role: "owner" }]);
    expect(getUserById).not.toHaveBeenCalled();
  });

  it("links an account that a VX44 invite created and its owner accepted", async () => {
    existing = { id: EXISTING, role: "client" };
    inviteUserByEmail.mockResolvedValue(alreadyRegistered);
    getUserById.mockResolvedValue({
      data: { user: { id: EXISTING, invited_at: "2026-11-10T09:00:00Z", email_confirmed_at: "2026-11-10T09:05:00Z" } },
      error: null,
    });

    const result = await invite();

    expect(getUserById).toHaveBeenCalledWith(EXISTING);
    expect(result.saved).toContain("priya@example.com");
    expect(upserts).toEqual([{ user_id: EXISTING, org_id: ORG, role: "owner" }]);
  });

  it.each([
    ["a self sign-up, confirmed automatically", { invited_at: null, email_confirmed_at: "2026-11-15T12:00:00Z" }],
    ["a self sign-up, never confirmed", { invited_at: null, email_confirmed_at: null }],
    ["an invite that was never accepted", { invited_at: "2026-11-10T09:00:00Z", email_confirmed_at: null }],
  ])("refuses to link %s", async (_case, account) => {
    existing = { id: EXISTING, role: "client" };
    inviteUserByEmail.mockResolvedValue(alreadyRegistered);
    getUserById.mockResolvedValue({ data: { user: { id: EXISTING, ...account } }, error: null });

    const result = await invite();

    expect(result).toEqual({ error: en.errors.inviteNotOurs });
    expect(upserts).toEqual([]);
  });

  it("refuses when the account can't be looked up", async () => {
    existing = { id: EXISTING, role: "client" };
    inviteUserByEmail.mockResolvedValue(alreadyRegistered);
    getUserById.mockResolvedValue({ data: { user: null }, error: { message: "not found" } });

    expect(await invite()).toEqual({ error: en.errors.inviteNotOurs });
    expect(upserts).toEqual([]);
  });
});
