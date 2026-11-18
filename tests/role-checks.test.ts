import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The role checks in src/lib/auth.ts, with the session and the database stubbed. A failed read of
// the person's role is not the same as having no role: it must not send a signed-in admin or
// client to "no access" (review of #16, 2026-11-18). It fails as an error instead, so the app's
// error page offers "Try again".
const { redirect, profileRead } = vi.hoisted(() => ({
  // Like Next.js, redirect() throws, so nothing after it runs.
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT ${path}`);
  }),
  profileRead: { value: { data: null, error: null } as { data: { role: string } | null; error: { message: string } | null } },
}));

const supabase = {
  auth: { getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }) },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => profileRead.value }) }) }),
};

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/supabase/server", () => ({ createSessionClient: async () => supabase }));

const { homePathFor, requireAdminRole, requireClientRole } = await import("@/lib/auth");

const readFailed = { data: null, error: { message: "upstream request timeout" } };

beforeEach(() => {
  redirect.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requireAdminRole", () => {
  it("lets an admin through", async () => {
    profileRead.value = { data: { role: "admin" }, error: null };
    await expect(requireAdminRole()).resolves.toMatchObject({ user: { id: "user-1" } });
  });

  it("sends someone with no admin role to no-access", async () => {
    profileRead.value = { data: { role: "client" }, error: null };
    await expect(requireAdminRole()).rejects.toThrow("NEXT_REDIRECT /no-access");
    profileRead.value = { data: null, error: null };
    await expect(requireAdminRole()).rejects.toThrow("NEXT_REDIRECT /no-access");
  });

  it("fails as an error, not no-access, when the role can't be read", async () => {
    profileRead.value = readFailed;
    await expect(requireAdminRole()).rejects.toThrow("The role couldn't be read");
    expect(redirect).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("user-1"), "upstream request timeout");
  });
});

describe("requireClientRole", () => {
  it("lets a client through, and sends an admin to the back office", async () => {
    profileRead.value = { data: { role: "client" }, error: null };
    await expect(requireClientRole()).resolves.toMatchObject({ user: { id: "user-1" } });
    profileRead.value = { data: { role: "admin" }, error: null };
    await expect(requireClientRole()).rejects.toThrow("NEXT_REDIRECT /admin");
  });

  it("sends someone with no role to no-access", async () => {
    profileRead.value = { data: null, error: null };
    await expect(requireClientRole()).rejects.toThrow("NEXT_REDIRECT /no-access");
  });

  it("fails as an error, not no-access, when the role can't be read", async () => {
    profileRead.value = readFailed;
    await expect(requireClientRole()).rejects.toThrow("The role couldn't be read");
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("homePathFor", () => {
  it("sends admins to the back office and everyone else to the portal", async () => {
    profileRead.value = { data: { role: "admin" }, error: null };
    expect(await homePathFor(supabase as never, "user-1")).toBe("/admin");
    profileRead.value = { data: { role: "client" }, error: null };
    expect(await homePathFor(supabase as never, "user-1")).toBe("/portal");
  });

  it("logs a failed read and lands on the portal, which checks the role again", async () => {
    // /portal sends an admin on to /admin once the role can be read, and shows the error page
    // with "Try again" if it still can't.
    profileRead.value = readFailed;
    expect(await homePathFor(supabase as never, "user-1")).toBe("/portal");
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("user-1"), "upstream request timeout");
  });
});
