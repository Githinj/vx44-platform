import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { inviteSchema } from "@/lib/admin/schemas";

// SEC-271: who can be invited, and where an invite link may lead. The whole flow (email, link,
// password, portal) runs signed in, against a local Supabase stack, in e2e-admin/admin.spec.ts.

const verifyOtp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSessionClient: async () => ({ auth: { verifyOtp } }),
}));

const { GET } = await import("@/app/auth/confirm/route");

const ORG = "aaaaaaaa-0000-4000-8000-000000000001";

function confirm(query: string) {
  return GET(new NextRequest(`http://localhost:3000/auth/confirm?${query}`));
}

beforeEach(() => {
  verifyOtp.mockReset().mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("inviteSchema", () => {
  it("trims and lowercases the email, and stores a blank name as null", () => {
    expect(
      inviteSchema.parse({ org_id: ORG, email: "  Sam@Example.COM ", full_name: "", role: "owner" }),
    ).toEqual({ org_id: ORG, email: "sam@example.com", full_name: null, role: "owner" });
  });

  it.each([
    [{ email: "not an email" }, "validEmail"],
    [{ role: "admin" }, undefined],
  ])("refuses %o", (change, message) => {
    const result = inviteSchema.safeParse({ org_id: ORG, email: "sam@example.com", full_name: "", role: "viewer", ...change });
    expect(result.success).toBe(false);
    if (message) expect(result.error?.issues[0].message).toBe(message);
  });
});

describe("/auth/confirm", () => {
  it("checks an invite token and sends the person to choose a password", async () => {
    const response = await confirm("token_hash=abc123&type=invite");
    expect(verifyOtp).toHaveBeenCalledWith({ type: "invite", token_hash: "abc123" });
    expect(response.headers.get("location")).toBe("http://localhost:3000/portal/set-password");
  });

  it("sends an expired or used link back to sign-in", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired", message: "expired" } });
    const response = await confirm("token_hash=abc123&type=invite");
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it.each(["type=invite", "token_hash=abc123&type=signup", "token_hash=abc123&type=invite&next=https://evil.example"])(
    "never follows a destination from the link: %s",
    async (query) => {
      const response = await confirm(query);
      const location = response.headers.get("location");
      expect(location === "http://localhost:3000/login" || location === "http://localhost:3000/portal/set-password").toBe(true);
    },
  );
});
