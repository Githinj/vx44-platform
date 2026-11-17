import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { expectFocusKept, expectLogicalTabOrder, expectVisibleFocus, focused, tabTo } from "../e2e/keyboard";
import { localSupabase } from "./local-supabase";
import { contentShown } from "./page-ready";
import { secondsLeft, totp } from "./totp";

// The back office from the keyboard alone (docs/frontend-standards.md, section 8): sign-in,
// authenticator setup, the skip link, the console menu, a list and a client page with forms.
// Tab order follows the page and reaches every control, focus is visible, and after a form
// saves or refuses, focus is still where the admin was working. Its own admin and client, so it
// doesn't depend on the other signed-in tests.

const EMAIL = "e2e-keyboard-admin@example.com";
const CLIENT = "E2E Keyboard Client";

expect.configure({ timeout: 15_000 });

let password = "";
let clientId = "";

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === EMAIL) ?? []) await db.auth.admin.deleteUser(user.id);
  const { data: oldClients } = await db.from("organizations").select("id").like("name", `${CLIENT}%`);
  for (const old of oldClients ?? []) {
    await db.from("sites").delete().eq("org_id", old.id);
    await db.from("organizations").delete().eq("id", old.id);
  }

  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the keyboard test admin failed: ${error?.message}`);
  await db.from("profiles").update({ role: "admin" }).eq("id", created.user.id);
  const { data: client } = await db.from("organizations").insert({ name: CLIENT, status: "lead" }).select("id").single();
  clientId = client!.id;
});

test("an admin works the back office from the keyboard alone", async ({ page }) => {
  test.setTimeout(240_000);

  // Sign in.
  await page.goto("/login");
  await tabTo(page, /^Email$/);
  await page.keyboard.type(EMAIL);
  await page.keyboard.press("Tab");
  await page.keyboard.type(password);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });

  // Set up the authenticator. After the setup button, focus lands on the code field.
  await contentShown(page);
  await tabTo(page, /^Set up authenticator$/);
  await page.keyboard.press("Enter");
  await expect(page.locator("main code")).toBeVisible();
  await expect.poll(async () => (await focused(page))?.label).toBe("6-digit code");
  const secret = (await page.locator("main code").textContent())!.trim();
  // A wrong code: focus comes back to the field for another try.
  await page.keyboard.type("000000");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "didn't work" })).toBeVisible();
  await expect.poll(async () => (await focused(page))?.label).toBe("6-digit code");
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(totp(secret));
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  // On a page load, the skip link is the first stop and moves focus to the page's content.
  await page.goto("/admin");
  await page.keyboard.press("Tab");
  expect((await focused(page))?.label).toBe("Skip to content");
  await expectVisibleFocus(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();

  // The console menu, from the keyboard.
  await page.goto("/admin");
  await tabTo(page, /^Leads$/);
  await expectVisibleFocus(page);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\/leads$/);

  for (const path of ["/admin", "/admin/leads", "/admin/clients", `/admin/clients/${clientId}`]) {
    await test.step(`tab order on ${path}`, async () => {
      await page.goto(path);
      await contentShown(page);
      await expectLogicalTabOrder(page, 250);
    });
  }

  // A client page form: change the name and press Enter. It saves, and focus stays in the field.
  await page.goto(`/admin/clients/${clientId}`);
  await contentShown(page);
  await tabTo(page, /^Business name$/, 80);
  await expectVisibleFocus(page);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(`${CLIENT} Ltd`);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  expect((await expectFocusKept(page, "a save")).label).toBe("Business name");

  // A refused form: a negative camera count passes the browser but not the server. The error
  // shows and focus stays on the button that sent it.
  await tabTo(page, /^Add a site$/, 80);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  expect((await focused(page))?.label).toBe("Site name");
  await page.keyboard.type("Keyboard Site");
  await tabTo(page, /^Camera count$/, 10);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("-1");
  await tabTo(page, /^Add site$/, 20);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "can't be negative" })).toBeVisible();
  expect((await expectFocusKept(page, "a refused save")).label).toBe("Add site");
});
