import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// The clients list on a phone (SEC-280 round 2). The five filters and the Filter button filled the
// first screen, and the table was wider than the phone: "Queens, N…" was cut off and Status and
// Plan sat off the right edge. On a phone the list is now one card per client, and only the
// search box shows until "More filters" is tapped. From `sm` up nothing changes. Own admin and
// client, so it doesn't depend on other tests.

const EMAIL = "e2e-clients-phone-admin@example.com";
const CLIENT = "E2E Phone Client";
const PHONE = { width: 390, height: 844 };
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

  await db.from("organizations").delete().eq("name", CLIENT);
  const { error: clientError } = await db
    .from("organizations")
    .insert({ name: CLIENT, primary_contact_name: "Priya Shah", city: "Queens", state: "NY", status: "active" });
  if (clientError) throw new Error(`Creating the test client failed: ${clientError.message}`);
});

test("the clients list fits a phone, and the table stays from sm up", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize(PHONE);

  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.locator("main code").textContent())!.trim();
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.getByLabel("6-digit code").fill(totp(secret));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  // Only the search box shows; the other four filters wait behind "More filters".
  await page.goto("/admin/clients");
  const main = page.getByRole("main");
  const moreFilters = main.getByRole("button", { name: /^More filters/ });
  await expect(main.getByLabel("Search")).toBeVisible();
  await expect(moreFilters).toBeVisible();
  await expect(moreFilters).toHaveAttribute("aria-expanded", "false");
  for (const label of ["Status", "City", "State", "Plan"]) await expect(main.getByLabel(label)).toBeHidden();

  // The first client is whole on the first screen.
  const firstCard = main.getByRole("listitem").first();
  await expect(firstCard).toBeVisible();
  const first = (await firstCard.boundingBox())!;
  expect(first.y + first.height, "first client ends on the first screen").toBeLessThanOrEqual(PHONE.height);

  // Searching works from the phone layout, and every detail of the card is on screen.
  await main.getByLabel("Search").fill(CLIENT);
  await main.getByRole("button", { name: "Filter", exact: true }).click();
  await expect(page).toHaveURL(/[?&]q=E2E\+Phone\+Client/);
  const card = main.getByRole("listitem").filter({ hasText: CLIENT });
  await expect(card.getByRole("link", { name: CLIENT })).toBeVisible();
  const details = card.locator("dd");
  await expect(details).toHaveText(["Priya Shah", "Queens, NY", "Active", "—"]);
  for (const detail of await details.all()) {
    const text = await detail.textContent();
    const box = (await detail.boundingBox())!;
    expect(box.x, `${text} starts on screen`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `${text} ends on screen`).toBeLessThanOrEqual(PHONE.width);
  }
  const link = (await card.getByRole("link", { name: CLIENT }).boundingBox())!;
  expect(link.height, "the client link is a 44px tap target").toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth), "no sideways scroll").toBeLessThanOrEqual(PHONE.width);

  // "More filters" opens the other four. A filter that's on is counted on the button and stays
  // on while the fields are folded away.
  await moreFilters.click();
  await expect(moreFilters).toHaveAttribute("aria-expanded", "true");
  await main.getByLabel("Status").selectOption({ label: "Active" });
  await main.getByRole("button", { name: "Filter", exact: true }).click();
  await expect(page).toHaveURL(/[?&]status=active/);
  await expect(main.getByRole("button", { name: "More filters (1 on)" })).toBeVisible();
  await expect(main.getByLabel("Status")).toBeHidden();
  await expect(main.getByLabel("Status")).toHaveValue("active");
  await expect(main.getByRole("listitem").filter({ hasText: CLIENT })).toBeVisible();

  // From `sm` up: the table, with all five filters showing and no "More filters" button.
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(main.getByRole("table")).toBeVisible();
  await expect(main.getByRole("list")).toBeHidden();
  await expect(main.getByRole("button", { name: /^More filters/ })).toBeHidden();
  for (const label of ["Status", "City", "State", "Plan"]) await expect(main.getByLabel(label)).toBeVisible();
  const row = main.getByRole("row").filter({ hasText: CLIENT });
  await expect(row.getByRole("cell")).toHaveText([CLIENT, "Priya Shah", "Queens, NY", "Active", "—"]);
});
