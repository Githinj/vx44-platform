import { randomBytes } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// Tap targets on a phone (SEC-280 round 2, finding 11). The back office's buttons were 36 to
// 40px tall: they pass WCAG 2.5.8 (24px) but miss the usual 44px for a finger. Every visible
// button in a page's main content, on sign-in and on each console page, must be at least 44px
// tall at 390px wide. (The header's Sign out is #49's; fields count their label as part of the
// tap area, since the label wraps the field.) Own admin and client.

const EMAIL = "e2e-tap-targets-admin@example.com";
const CLIENT = "E2E Tap Targets Client";
const MIN = 44;
let password = "";
let clientId = "";

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === EMAIL) ?? []) await db.auth.admin.deleteUser(user.id);
  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the test admin failed: ${error?.message}`);
  await db.from("profiles").update({ role: "admin" }).eq("id", created.user.id);

  const { data: old } = await db.from("organizations").select("id").eq("name", CLIENT);
  for (const row of old ?? []) {
    await db.from("sites").delete().eq("org_id", row.id);
    await db.from("organizations").delete().eq("id", row.id);
  }
  const { data: client, error: clientError } = await db.from("organizations").insert({ name: CLIENT }).select("id").single();
  if (clientError || !client) throw new Error(`Creating the test client failed: ${clientError?.message}`);
  clientId = client.id;
  // A site, so reconciliation lists a row with its Save button whatever other tests left behind.
  const { error: siteError } = await db.from("sites").insert({ org_id: clientId, name: "E2E Tap Targets Site", camera_count: 2 });
  if (siteError) throw new Error(`Creating the test site failed: ${siteError.message}`);
});

async function expectTallButtons(page: Page, where: string) {
  // Real <button>s only. A file field also has the button role, but like every field it sits in
  // its <label>, so the label is part of its tap area.
  const buttons = page.getByRole("main").locator("button");
  let checked = 0;
  for (const button of await buttons.all()) {
    if (!(await button.isVisible())) continue;
    const name = (await button.textContent())?.trim();
    const box = (await button.boundingBox())!;
    expect.soft(box.height, `${where}: "${name}" is a ${MIN}px tap target`).toBeGreaterThanOrEqual(MIN);
    checked++;
  }
  expect(checked, `${where} has buttons to check`).toBeGreaterThan(0);
}

test("buttons are 44px tap targets on a phone", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/login");
  await expectTallButtons(page, "/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });
  await expectTallButtons(page, "/admin/mfa");
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.locator("main code").textContent())!.trim();
  await expectTallButtons(page, "/admin/mfa, entering the code");
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.getByLabel("6-digit code").fill(totp(secret));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  for (const path of ["/admin/leads", "/admin/clients", `/admin/clients/${clientId}`, "/admin/reconciliation", "/admin/plans"]) {
    await page.goto(path);
    await expect(page.getByRole("main")).not.toContainText("Loading…");
    await expectTallButtons(page, path);
  }
});
