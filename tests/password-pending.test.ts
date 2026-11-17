import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PASSWORD_PENDING_COOKIE, mustSetPasswordFirst } from "@/lib/password-pending";

// A new invitee chooses a password before using the portal (SEC-280 round 2).

const verifyOtp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSessionClient: async () => ({ auth: { verifyOtp } }),
}));

const { GET } = await import("@/app/auth/confirm/route");

beforeEach(() => {
  verifyOtp.mockReset().mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("mustSetPasswordFirst", () => {
  it.each(["/portal", "/portal/sites", "/portal/account", "/portal/billing"])("sends %s to set-password while it's pending", (path) => {
    expect(mustSetPasswordFirst(path, true)).toBe(true);
  });

  it("leaves the set-password page itself alone, so it can be shown and submitted", () => {
    expect(mustSetPasswordFirst("/portal/set-password", true)).toBe(false);
  });

  it.each(["/admin", "/login", "/portalx", "/"])("doesn't touch %s", (path) => {
    expect(mustSetPasswordFirst(path, true)).toBe(false);
  });

  it("does nothing once the password is set", () => {
    expect(mustSetPasswordFirst("/portal/sites", false)).toBe(false);
  });
});

describe("/auth/confirm", () => {
  it("marks the password as pending when an invite signs someone in", async () => {
    const response = await GET(new NextRequest("https://www.vx44ai.com/auth/confirm?token_hash=abc&type=invite"));
    const cookie = response.cookies.get(PASSWORD_PENDING_COOKIE);
    expect(cookie?.value).toBe("1");
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, path: "/portal", sameSite: "lax" });
  });

  it("sets nothing when the link fails", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired", message: "expired" } });
    const response = await GET(new NextRequest("https://www.vx44ai.com/auth/confirm?token_hash=abc&type=invite"));
    expect(response.cookies.get(PASSWORD_PENDING_COOKIE)).toBeUndefined();
  });
});
