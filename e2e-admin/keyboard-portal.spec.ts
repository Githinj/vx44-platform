import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { expectFocusKept, expectLogicalTabOrder, expectVisibleFocus, focused, tabTo } from "../e2e/keyboard";
import { localSupabase } from "./local-supabase";
import { openLoaded } from "./page-ready";
import { CLIENT_ORG } from "./seed-client";

// The client portal from the keyboard alone (docs/frontend-standards.md, section 8): sign-in,
// the overview, sites, documents and account pages. Tab order follows the page and reaches every
// control, focus is visible, and after a form saves or refuses, focus is still where the client
// was working. Its own client (a viewer at the seeded business), so it doesn't depend on, or
// change, the other portal tests' accounts.

const EMAIL = "e2e-keyboard-client@example.com";

expect.configure({ timeout: 15_000 });

let password = "";

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === EMAIL) ?? []) await db.auth.admin.deleteUser(user.id);

  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the keyboard test client failed: ${error?.message}`);
  const { data: org } = await db.from("organizations").select("id").eq("name", CLIENT_ORG).single();
  await db.from("memberships").insert({ user_id: created.user.id, org_id: org!.id, role: "viewer" });
});

test("a client uses the portal from the keyboard alone", async ({ page }) => {
  test.setTimeout(240_000);

  await page.goto("/login");
  await tabTo(page, /^Email$/);
  await page.keyboard.type(EMAIL);
  await page.keyboard.press("Tab");
  await page.keyboard.type(password);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  // On a page load, the skip link comes first and moves focus to the content.
  await page.goto("/portal");
  await page.keyboard.press("Tab");
  expect((await focused(page))?.label).toBe("Skip to content");
  await expectVisibleFocus(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();

  // The portal menu, from the keyboard.
  await page.goto("/portal");
  await tabTo(page, /^Documents$/);
  await expectVisibleFocus(page);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/portal\/documents$/);

  for (const path of ["/portal", "/portal/sites", "/portal/documents", "/portal/account"]) {
    await test.step(`tab order on ${path}`, async () => {
      await openLoaded(page, path);
      await expectLogicalTabOrder(page, 120);
    });
  }

  // Documents: the download link takes focus visibly.
  await openLoaded(page, "/portal/documents");
  await tabTo(page, /^Download/);
  await expectVisibleFocus(page);

  // Account: save a phone number with Enter. Focus stays in the field.
  await openLoaded(page, "/portal/account");
  await tabTo(page, /^Phone$/);
  await page.keyboard.type("+1 512 555 0177");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  expect((await expectFocusKept(page, "a save")).label).toBe("Phone");

  // A refused password change (the two entries differ): the error shows, focus stays put.
  await tabTo(page, /^New password$/);
  await page.keyboard.type("keyboard pass one");
  await tabTo(page, /^Type the new password again$/, 5);
  await page.keyboard.type("keyboard pass two");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "don’t match" })).toBeVisible();
  expect((await expectFocusKept(page, "a refused password change")).label).toBe("Type the new password again");

  // Two-step verification: after the setup button, focus lands on the code field, and a wrong
  // code brings it back there.
  await tabTo(page, /^Set up authenticator$/);
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await focused(page))?.label).toBe("6-digit code");
  await page.keyboard.type("000000");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "didn't work" })).toBeVisible();
  await expect.poll(async () => (await focused(page))?.label).toBe("6-digit code");
});
