import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The sign-out action against a stubbed Supabase client. Since supabase-js 2.119, a global
// sign-out that the auth server doesn't accept keeps the local session, so the action has to
// fall back to signing this browser out before it redirects.
const { authSignOut, redirect, deletedCookies } = vi.hoisted(() => ({
  authSignOut: vi.fn(),
  deletedCookies: [] as unknown[],
  // Like Next.js, redirect() throws, so nothing after it runs.
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT ${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSessionClient: async () => ({ auth: { signOut: authSignOut } }),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ cookies: async () => ({ delete: (cookie: unknown) => void deletedCookies.push(cookie) }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/i18n/app-text", () => ({ getAppText: vi.fn() }));

import { signOut } from "@/app/(app)/admin/actions";

beforeEach(() => {
  authSignOut.mockReset();
  redirect.mockClear();
  deletedCookies.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function localSignOutRanBeforeRedirect() {
  const localCall = authSignOut.mock.calls.findIndex(([options]) => options?.scope === "local");
  return localCall >= 0 && authSignOut.mock.invocationCallOrder[localCall] < redirect.mock.invocationCallOrder[0];
}

describe("signOut", () => {
  // Review of #16, 2026-11-18: a new invitee who signs out before choosing a password leaves the
  // set-password cookie behind. The next person to sign in to the portal on that browser would be
  // held on the set-password page, so sign-out clears it.
  it("clears a new invitee's set-password step", async () => {
    authSignOut.mockResolvedValue({ error: null });
    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT /login");
    expect(deletedCookies).toEqual([{ name: "vx44_password_pending", path: "/portal" }]);
  });

  it("revokes every session and goes to /login when the auth server accepts", async () => {
    authSignOut.mockResolvedValue({ error: null });

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT /login");

    expect(authSignOut).toHaveBeenCalledTimes(1);
    expect(authSignOut.mock.calls[0][0]?.scope ?? "global").toBe("global");
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([
    ["can't be reached", new AuthRetryableFetchError("Failed to fetch", 0)],
    ["returns a server error", new AuthApiError("Internal server error", 500, "unexpected_failure")],
  ])("signs this browser out when the auth server %s", async (_case, error) => {
    authSignOut.mockResolvedValueOnce({ error }).mockResolvedValueOnce({ error: null });

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT /login");

    expect(authSignOut).toHaveBeenCalledTimes(2);
    expect(authSignOut).toHaveBeenLastCalledWith({ scope: "local" });
    expect(localSignOutRanBeforeRedirect()).toBe(true);
    expect(console.error).toHaveBeenCalled();
  });

  it("signs this browser out when the sign-out request throws", async () => {
    authSignOut.mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce({ error: null });

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT /login");

    expect(authSignOut).toHaveBeenLastCalledWith({ scope: "local" });
    expect(localSignOutRanBeforeRedirect()).toBe(true);
  });

  it("still goes to /login when signing this browser out fails too", async () => {
    authSignOut
      .mockResolvedValueOnce({ error: new AuthRetryableFetchError("Failed to fetch", 0) })
      .mockRejectedValueOnce(new Error("storage unavailable"));

    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT /login");

    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
