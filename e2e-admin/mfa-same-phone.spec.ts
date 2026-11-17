import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// Setting up two-step verification on the phone that shows the QR code (SEC-280 round 2,
// finding 8). A phone can't scan its own screen, and the fallback was a 32-character key with no
// copy button. The setup screen now has an "Add to authenticator app" link (otpauth://), which
// opens the app on a phone, and a "Copy key" button. Own admin, so it doesn't depend on other
// tests.

const EMAIL = "e2e-mfa-phone-admin@example.com";
let password = "";

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === EMAIL) ?? []) await db.auth.admin.deleteUser(user.id);
  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the test admin failed: ${error?.message}`);
  await db.from("profiles").update({ role: "admin" }).eq("id", created.user.id);
});

test("two-step setup works on the phone that shows the code", async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const key = (await page.locator("main code").textContent())!.trim();
  expect(key).toMatch(/^[A-Z2-7]{16,}$/);

  // The link hands the same key to the phone's authenticator app.
  const link = page.getByRole("link", { name: "Add to authenticator app" });
  await expect(link).toBeVisible();
  const uri = new URL((await link.getAttribute("href"))!);
  expect(uri.protocol).toBe("otpauth:");
  expect(uri.host).toBe("totp");
  expect(uri.searchParams.get("secret")).toBe(key);
  expect((await link.boundingBox())!.height, "the link is a 44px tap target").toBeGreaterThanOrEqual(44);

  // "Copy key" puts the key on the clipboard and says so.
  const copy = page.getByRole("button", { name: "Copy key" });
  expect((await copy.boundingBox())!.height, "the button is a 44px tap target").toBeGreaterThanOrEqual(44);
  await copy.click();
  await expect(page.getByRole("status").filter({ hasText: "Key copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(key);

  // A code from the link's key finishes setup, as an app opened from the link would.
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.getByLabel("6-digit code").fill(totp(uri.searchParams.get("secret")!));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
});
