import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/app/en";

// Per-visitor limits on sign-in and the emailed sign-in link (SEC-241 review). The limit logic, and
// the two login actions with the session, the database and the request headers stubbed.

const { rpc, signInWithPassword, signInWithOtp, requestHeaders } = vi.hoisted(() => ({
  rpc: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOtp: vi.fn(),
  requestHeaders: new Headers(),
}));

vi.mock("next/headers", () => ({ headers: async () => requestHeaders }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT ${path}`);
  },
}));
vi.mock("@/i18n/app-text", () => ({ getAppText: async () => ({ locale: "en", t: en, format: "en-US" }) }));
vi.mock("@/lib/auth", () => ({ homePathFor: async () => "/admin" }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));
vi.mock("@/lib/supabase/server", () => ({
  getAuthEnv: () => ({ url: "https://example.supabase.co", anonKey: "anon" }),
  createSessionClient: async () => ({ auth: { signInWithPassword, signInWithOtp } }),
}));

const { AUTH_LIMITS, limitChecks } = await import("@/lib/auth-rate-limit");
const { signInWithPassword: signIn, sendMagicLink } = await import("@/app/(app)/login/actions");

const SALT = "0123456789abcdef-test";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
}

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
  vi.stubEnv("RATE_LIMIT_SALT", SALT);
  // Vercel's own header, plus a made-up x-forwarded-for that must be ignored.
  for (const name of ["x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"]) requestHeaders.delete(name);
  requestHeaders.set("x-vercel-forwarded-for", "203.0.113.7");
  requestHeaders.set("x-forwarded-for", "198.51.100.66");
  rpc.mockReset().mockResolvedValue({ data: true, error: null });
  signInWithPassword.mockReset().mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  signInWithOtp.mockReset().mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("limit checks", () => {
  it("limits a visitor per email address, and on its own", () => {
    const checks = limitChecks("sign-in", "203.0.113.7", "Ann@Example.com", SALT);
    expect(checks.map((c) => [c.max, c.windowSeconds])).toEqual([
      [AUTH_LIMITS["sign-in"].perAddress.max, AUTH_LIMITS["sign-in"].perAddress.windowSeconds],
      [AUTH_LIMITS["sign-in"].perVisitor.max, AUTH_LIMITS["sign-in"].perVisitor.windowSeconds],
    ]);
    // Generous enough for a few typos; tighter for emailed links.
    expect(AUTH_LIMITS["sign-in"].perAddress.max).toBeGreaterThanOrEqual(5);
    expect(AUTH_LIMITS.link.perAddress.max).toBeLessThan(AUTH_LIMITS["sign-in"].perAddress.max);
  });

  it("hashes the address and email, ignoring the email's case and spaces", () => {
    const [a] = limitChecks("sign-in", "203.0.113.7", "Ann@Example.com", SALT);
    const [b] = limitChecks("sign-in", "203.0.113.7", " ann@example.com ", SALT);
    const [c] = limitChecks("sign-in", "203.0.113.8", "ann@example.com", SALT);
    expect(a.key).toBe(b.key);
    expect(a.key).not.toBe(c.key);
    expect(a.key).not.toMatch(/203\.0\.113|ann/i);
    expect(limitChecks("link", "203.0.113.7", "ann@example.com", SALT)[0].key).not.toBe(a.key);
  });

  it("leaves the per-visitor limit off for the local machine or an unknown address", () => {
    // Production always knows the visitor's address; only a local test server comes from loopback.
    for (const ip of [null, "127.0.0.1", "::1", "::ffff:127.0.0.1"]) {
      expect(limitChecks("sign-in", ip, "ann@example.com", SALT), String(ip)).toHaveLength(1);
    }
  });
});

describe("signing in", () => {
  it("counts the attempt, then signs in", async () => {
    await expect(signIn({}, form({ email: "ann@example.com", password: "pw" }))).rejects.toThrow("NEXT_REDIRECT /admin");
    expect(rpc).toHaveBeenCalledWith("check_lead_rate_limit", expect.objectContaining({ p_limit: AUTH_LIMITS["sign-in"].perAddress.max }));
    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });

  it("refuses over the limit without asking Supabase, in the visitor's language", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const state = await signIn({}, form({ email: "ann@example.com", password: "pw" }));
    expect(state).toEqual({ error: en.login.tooManyAttempts });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("still signs in if the limit can't be checked", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "connection refused" } });
    await expect(signIn({}, form({ email: "ann@example.com", password: "pw" }))).rejects.toThrow("NEXT_REDIRECT /admin");
    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });

  // SEC-241 review: a client can send any x-forwarded-for, so trusting it would let a new value on
  // each try count as a new visitor and skip both limits.
  it("ignores a made-up x-forwarded-for, so it can't rotate visitors", async () => {
    const keys: string[][] = [];
    for (const spoofed of ["198.51.100.1", "198.51.100.2"]) {
      rpc.mockClear();
      requestHeaders.set("x-forwarded-for", spoofed);
      await signIn({}, form({ email: "ann@example.com", password: "pw" })).catch(() => {});
      keys.push(rpc.mock.calls.map(([, args]) => args.p_key));
    }
    expect(keys[0]).toHaveLength(2);
    expect(keys[1]).toEqual(keys[0]);
  });

  it("treats a visitor with only x-forwarded-for as unknown: the per-address limit still applies", async () => {
    requestHeaders.delete("x-vercel-forwarded-for");
    requestHeaders.set("x-forwarded-for", "203.0.113.7");
    await signIn({}, form({ email: "ann@example.com", password: "pw" })).catch(() => {});
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("doesn't count a form with no email or password", async () => {
    await signIn({}, form({ email: "", password: "" }));
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("the emailed sign-in link", () => {
  it("refuses over the limit without sending, in the visitor's language", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const state = await sendMagicLink({}, form({ email: "ann@example.com" }));
    expect(state).toEqual({ error: en.login.tooManyLinks });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it("sends under the limit, with the same reply whether or not the account exists", async () => {
    const state = await sendMagicLink({}, form({ email: "ann@example.com" }));
    expect(state).toEqual({ notice: en.login.linkSent });
    expect(signInWithOtp).toHaveBeenCalledTimes(1);
  });
});
