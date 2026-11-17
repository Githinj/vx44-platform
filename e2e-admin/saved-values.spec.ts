import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// Back-office forms keep what the admin sees (SEC-280 round 2). React resets a <form action> after
// every action it runs, whether the save worked or was refused. Text fields came back with their
// new saved value, but a <select> fell back to its first value: the lead status showed "New" again
// after saving "Contacted", and the next save on that card quietly wrote "New" back. And when a
// save was refused, everything the admin had typed was wiped. Own admin, lead and client, so it
// doesn't depend on the other signed-in tests.

const EMAIL = "e2e-saved-values-admin@example.com";
const LEAD = "E2E Saved Values Deli";
const CLIENT = "E2E Saved Values Client";

expect.configure({ timeout: 15_000 });

let password = "";
let leadId = "";
let clientId = "";
const db = () => {
  const { url, serviceRoleKey } = localSupabase();
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
};

test.beforeAll(async () => {
  const supabase = db();
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === EMAIL) ?? []) await supabase.auth.admin.deleteUser(user.id);
  await supabase.from("leads").delete().eq("business_name", LEAD);
  const { data: oldClients } = await supabase.from("organizations").select("id").eq("name", CLIENT);
  for (const old of oldClients ?? []) {
    await supabase.from("sites").delete().eq("org_id", old.id);
    await supabase.from("organizations").delete().eq("id", old.id);
  }

  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await supabase.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the test admin failed: ${error?.message}`);
  await supabase.from("profiles").update({ role: "admin" }).eq("id", created.user.id);

  const { data: lead } = await supabase
    .from("leads")
    .insert({
      full_name: "Test Visitor",
      business_name: LEAD,
      email: "deli@example.com",
      phone: "+1 555 0102",
      city: "Austin",
      state: "TX",
      camera_count_estimate: 4,
      dvr_brand: "Dahua",
      knows_dvr_password: "yes",
      notified_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  leadId = lead!.id;
  const { data: client } = await supabase.from("organizations").insert({ name: CLIENT, status: "lead" }).select("id").single();
  clientId = client!.id;
  await supabase.from("sites").insert({ org_id: clientId, name: "Main store", camera_count: 4, status: "pending" });
});

async function signIn(page: Page) {
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
}

test("forms keep the saved values, and what was typed when a save is refused", async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);

  // A lead's status. After saving, the dropdown shows "Contacted", and a second save that only
  // changes the notes leaves the status alone.
  await page.goto("/admin/leads");
  const card = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: LEAD }) });
  const leadForm = card.locator("form").filter({ has: page.getByLabel("Notes") });
  await leadForm.getByLabel("Status").selectOption("contacted");
  await leadForm.getByRole("button", { name: "Save" }).click();
  await expect(leadForm.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await expect.soft(leadForm.getByLabel("Status"), "the lead status after saving").toHaveValue("contacted");

  await leadForm.getByLabel("Notes").fill("Called back, booked a demo.");
  await leadForm.getByRole("button", { name: "Save" }).click();
  await expect(leadForm.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  const { data: stored } = await db().from("leads").select("status, notes").eq("id", leadId).single();
  expect.soft(stored, "a notes-only save keeps the saved status").toEqual({ status: "contacted", notes: "Called back, booked a demo." });

  // The client's status, at the top of its page.
  await page.goto(`/admin/clients/${clientId}`);
  const statusForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Update" }) });
  await statusForm.getByLabel("Status").selectOption("approved");
  await statusForm.getByRole("button", { name: "Update" }).click();
  await expect(statusForm.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await expect.soft(statusForm.getByLabel("Status"), "the client status after saving").toHaveValue("approved");

  // An existing site's status, in its own form.
  await page.getByText(/^Main store · 4 cameras/).click();
  const siteForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Save site" }) });
  await siteForm.getByLabel("Status").selectOption("online");
  await siteForm.getByRole("button", { name: "Save site" }).click();
  await expect(siteForm.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await expect.soft(siteForm.getByLabel("Status"), "the site status after saving").toHaveValue("online");

  // A refused save keeps what was typed. A negative camera count passes the browser but not the
  // server, and the admin shouldn't have to type the site in again.
  await page.getByText("Add a site", { exact: true }).click();
  const addSite = page.locator("form").filter({ has: page.getByRole("button", { name: "Add site" }) });
  await addSite.getByLabel("Site name").fill("Back room");
  await addSite.getByLabel("Camera count").fill("-1");
  await addSite.getByLabel("Status").selectOption("online");
  await addSite.getByRole("button", { name: "Add site" }).click();
  await expect(addSite.getByRole("status")).toContainText("can't be negative");
  await expect.soft(addSite.getByLabel("Site name"), "the site name after a refused save").toHaveValue("Back room");
  await expect.soft(addSite.getByLabel("Camera count"), "the camera count after a refused save").toHaveValue("-1");
  await expect.soft(addSite.getByLabel("Status"), "the status after a refused save").toHaveValue("online");

  // Once it's right, the site is added and the add form clears for the next one.
  await addSite.getByLabel("Camera count").fill("2");
  await addSite.getByRole("button", { name: "Add site" }).click();
  await expect(page.getByText(/^Back room · 2 cameras/)).toBeVisible();
  await expect.soft(addSite.getByLabel("Site name"), "the add form clears after a successful save").toHaveValue("");
});
