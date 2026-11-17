import { randomBytes } from "node:crypto";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// Signing out from both places that offer it: the back-office header (an admin after MFA) and the
// no-access page (a signed-in account without the admin role). Each must really end the session:
// the auth cookies are gone and /admin sends the visitor back to /login. Own accounts, so it doesn't
// depend on the other signed-in tests.

const ADMIN = "e2e-signout-admin@example.com";
const CLIENT = "e2e-signout-client@example.com";
const passwords = new Map<string, string>();

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: users, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`Listing users failed: ${listError.message}`);
  for (const user of users.users.filter((u) => u.email === ADMIN || u.email === CLIENT)) {
    await db.auth.admin.deleteUser(user.id);
  }

  for (const email of [ADMIN, CLIENT]) {
    const password = randomBytes(18).toString("base64url");
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`Creating ${email} failed: ${error?.message}`);
    passwords.set(email, password);
    // New accounts get the default "client" role; only the admin is promoted.
    if (email === ADMIN) {
      const { error: roleError } = await db.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
      if (roleError) throw new Error(`Making the test user an admin failed: ${roleError.message}`);
    }
  }
});

// Supabase keeps the session in cookies named sb-<project>-auth-token, split into numbered chunks
// when it's long.
async function sessionCookies(context: BrowserContext) {
  return (await context.cookies()).filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name) && c.value !== "");
}

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(passwords.get(email)!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function expectSignedOut(page: Page) {
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
  expect(await sessionCookies(page.context()), "session cookies after signing out").toEqual([]);
  // The back office is closed again: the proxy sends a signed-out visitor to /login.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
}

test("an admin signs out from the back office header", async ({ page }) => {
  await signIn(page, ADMIN);
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.locator("main code").textContent())?.trim();
  expect(secret).toBeTruthy();
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.getByLabel("6-digit code").fill(totp(secret!));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
  expect(await sessionCookies(page.context()), "session cookies while signed in").not.toEqual([]);

  await page.getByRole("banner").getByRole("button", { name: "Sign out" }).click();
  await expectSignedOut(page);
});

test("an account without the admin role signs out from the no-access page", async ({ page }) => {
  await signIn(page, CLIENT);
  // Wherever sign-in lands a client, the back office turns them away to /no-access.
  await page.waitForURL((url) => url.pathname !== "/login", { timeout: 30_000 });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/no-access$/);
  expect(await sessionCookies(page.context()), "session cookies while signed in").not.toEqual([]);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expectSignedOut(page);
});
