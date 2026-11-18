import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/app/en";
import { PASSWORD_PENDING_COOKIE, SET_PASSWORD_PATH } from "@/lib/password-pending";

// The "Accept the invite" button on /auth/accept (SEC-241 review). Pressing it (a POST) is what
// spends the invite's one-time token, so a mail scanner opening the link can't. The session, the
// request headers and the cookie store are stubbed.

const { verifyOtp, setCookie, requestHeaders } = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  setCookie: vi.fn(),
  requestHeaders: new Headers(),
}));

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
  cookies: async () => ({ set: setCookie }),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT ${path}`);
  },
}));
vi.mock("@/i18n/app-text", () => ({ getAppText: async () => ({ locale: "en", t: en, format: "en-US" }) }));
vi.mock("@/lib/supabase/server", () => ({
  getAuthEnv: () => ({ url: "https://example.supabase.co", anonKey: "anon" }),
  createSessionClient: async () => ({ auth: { verifyOtp } }),
}));

const { acceptInvite } = await import("@/app/(app)/auth/accept/actions");

const TOKEN = "pkce_0123456789abcdef0123456789abcdef";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
}

beforeEach(() => {
  verifyOtp.mockReset().mockResolvedValue({ error: null });
  setCookie.mockReset();
  requestHeaders.set("x-forwarded-proto", "https");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("acceptInvite", () => {
  it("spends the invite token, marks the password as pending and goes to choose one", async () => {
    await expect(acceptInvite({}, form({ token_hash: TOKEN }))).rejects.toThrow(`NEXT_REDIRECT ${SET_PASSWORD_PATH}`);
    expect(verifyOtp).toHaveBeenCalledWith({ type: "invite", token_hash: TOKEN });
    expect(setCookie).toHaveBeenCalledWith(
      expect.objectContaining({ name: PASSWORD_PENDING_COOKIE, value: "1", httpOnly: true, secure: true, path: "/portal" }),
    );
  });

  it("writes the cookie without Secure on a plain-HTTP local server", async () => {
    requestHeaders.set("x-forwarded-proto", "http");
    await expect(acceptInvite({}, form({ token_hash: TOKEN }))).rejects.toThrow("NEXT_REDIRECT");
    expect(setCookie).toHaveBeenCalledWith(expect.objectContaining({ secure: false }));
  });

  it("says so when the link has expired or was already used, and marks nothing", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired", message: "expired" } });
    expect(await acceptInvite({}, form({ token_hash: TOKEN }))).toEqual({ error: en.invite.expired });
    expect(setCookie).not.toHaveBeenCalled();
  });

  it.each<Record<string, string>>([{}, { token_hash: "" }, { token_hash: "has spaces and <tags>" }, { token_hash: "x".repeat(600) }])(
    "doesn't try an incomplete or malformed token: %o",
    async (values) => {
      expect(await acceptInvite({}, form(values))).toEqual({ error: en.invite.incomplete });
      expect(verifyOtp).not.toHaveBeenCalled();
    },
  );
});
