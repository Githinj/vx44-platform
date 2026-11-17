import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// The back office's everyday work, end to end, with a real admin against the local stack:
// - a returning admin signs in with their authenticator code (the other specs only cover setup);
// - a client goes from first contact to an active subscription: status, notes, a site, a plan
//   price, a subscription, a document (uploaded and downloaded), and this month's reconciliation;
// - the CSV export and the activity log both reflect that work;
// - a signed-out visitor can't reach the CSV export or a document link.
// Its own admin and client, so it doesn't depend on the other signed-in tests.

const EMAIL = "e2e-flows-admin@example.com";
const CLIENT = "E2E Flows Garage";
const SITE = "E2E Flows Forecourt";
const DOCUMENT = "E2E signed agreement";
const LEAD = "E2E Flows Lead Bakery";

expect.configure({ timeout: 15_000 });
test.describe.configure({ mode: "serial" });

let password = "";
let secret = "";
let clientPath = "";
let documentPath = "";

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: users, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`Listing users failed: ${listError.message}`);
  for (const user of users.users.filter((u) => u.email === EMAIL)) await db.auth.admin.deleteUser(user.id);

  // The last run's client and everything hanging off it.
  const { data: oldClients } = await db.from("organizations").select("id").eq("name", CLIENT);
  for (const old of oldClients ?? []) {
    const { data: documents } = await db.from("documents").select("storage_path").eq("org_id", old.id);
    const paths = (documents ?? []).map((d) => d.storage_path);
    if (paths.length) await db.storage.from("documents").remove(paths);
    await db.from("documents").delete().eq("org_id", old.id);
    await db.from("subscriptions").delete().eq("org_id", old.id);
    const { data: sites } = await db.from("sites").select("id").eq("org_id", old.id);
    for (const site of sites ?? []) await db.from("reconciliations").delete().eq("site_id", site.id);
    await db.from("sites").delete().eq("org_id", old.id);
    await db.from("organizations").delete().eq("id", old.id);
  }

  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the flows test admin failed: ${error?.message}`);
  const { error: roleError } = await db.from("profiles").update({ role: "admin" }).eq("id", created.user.id);
  if (roleError) throw new Error(`Making the test user an admin failed: ${roleError.message}`);

  // A fresh lead in the inbox, already emailed to the admins so it carries no warning.
  await db.from("leads").delete().eq("business_name", LEAD);
  const { error: leadError } = await db.from("leads").insert({
    full_name: "Flows Visitor",
    business_name: LEAD,
    email: "flows-visitor@example.com",
    phone: "+1 555 0101",
    city: "Dallas",
    state: "TX",
    camera_count_estimate: 4,
    dvr_brand: "Dahua",
    knows_dvr_password: "unsure",
    notified_at: new Date().toISOString(),
  });
  if (leadError) throw new Error(`Seeding the flows test lead failed: ${leadError.message}`);
});

// A fresh 30-second window, so no code is ever entered twice.
async function waitForNewCode(page: Page) {
  await page.waitForTimeout((secondsLeft() + 1) * 1000);
}

async function signInWithPassword(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });
}

// A returning admin: password, then the code from their authenticator.
async function signIn(page: Page) {
  await signInWithPassword(page);
  await expect(page.getByRole("heading", { name: "Enter your code" })).toBeVisible();
  await waitForNewCode(page);
  await page.getByLabel("6-digit code").fill(totp(secret));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
}

function saved(scope: ReturnType<Page["locator"]>) {
  return scope.getByRole("status").filter({ hasText: "Saved" });
}

test("a returning admin signs in with their authenticator code", async ({ page }) => {
  test.setTimeout(150_000);

  // First visit: set up the authenticator, then sign out.
  await signInWithPassword(page);
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  secret = (await page.locator("main code").textContent())!.trim();
  if (secondsLeft() < 5) await waitForNewCode(page);
  await page.getByLabel("6-digit code").fill(totp(secret));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
  await page.getByRole("banner").getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });

  // Back again: the password alone only reaches the code step, and the console stays closed.
  await signInWithPassword(page);
  await expect(page.getByRole("heading", { name: "Enter your code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Set up authenticator" })).toHaveCount(0);
  await page.goto("/admin/clients");
  await expect(page).toHaveURL(/\/admin\/mfa$/);

  // A wrong code is refused, the right one opens the back office.
  await page.getByLabel("6-digit code").fill("000000");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByRole("status").filter({ hasText: "That code didn't work" })).toBeVisible();
  await waitForNewCode(page);
  await page.getByLabel("6-digit code").fill(totp(secret));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
});

test("an admin works a lead, then takes a client from first contact to an active subscription", async ({ page }) => {
  test.setTimeout(240_000);
  await signIn(page);

  // Leads inbox: a lead's status and notes save, and survive a reload.
  await page.goto("/admin/leads");
  const lead = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: LEAD }) });
  const leadForm = lead.locator("form").filter({ has: page.getByLabel("Notes") });
  await leadForm.getByLabel("Status").selectOption({ label: "Contacted" });
  await leadForm.getByLabel("Notes").fill("Called Tuesday. Wants a quote for 4 cameras.");
  await leadForm.getByRole("button", { name: "Save" }).click();
  await expect(saved(leadForm)).toBeVisible();
  await page.reload();
  await expect(leadForm.getByLabel("Status")).toHaveValue("contacted");
  await expect(leadForm.getByLabel("Notes")).toHaveValue("Called Tuesday. Wants a quote for 4 cameras.");

  // Add the client: the new client's page opens.
  await page.goto("/admin/clients");
  await page.getByLabel("Business name").fill(CLIENT);
  await page.getByRole("button", { name: "Add client" }).click();
  await expect(page).toHaveURL(/\/admin\/clients\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: CLIENT })).toBeVisible();
  clientPath = new URL(page.url()).pathname;

  // Status and notes.
  const statusForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Update" }) });
  await statusForm.getByLabel("Status").selectOption({ label: "Approved" });
  await statusForm.getByRole("button", { name: "Update" }).click();
  await expect(saved(statusForm)).toBeVisible();

  const notesForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Save notes" }) });
  await notesForm.getByRole("textbox", { name: "Notes" }).fill("Prefers a call after 5 pm.");
  await notesForm.getByRole("button", { name: "Save notes" }).click();
  await expect(saved(notesForm)).toBeVisible();

  // A site.
  await page.getByText("Add a site", { exact: true }).click();
  const addSite = page.locator("form").filter({ has: page.getByRole("button", { name: "Add site" }) });
  await addSite.getByLabel("Site name").fill(SITE);
  await addSite.getByLabel("Camera count").fill("6");
  await addSite.getByLabel("Monitoring hours").fill("Every night, 8 pm to 6 am");
  await addSite.getByLabel("Status").selectOption({ label: "Online" });
  await addSite.getByRole("button", { name: "Add site" }).click();
  await expect(page.getByText(`${SITE} · 6 cameras · Online`)).toBeVisible();

  // A plan price, so the client can subscribe to it.
  await page.goto("/admin/plans");
  const plan = page.locator('form:has(input[name="name"][value="Essentials"])');
  await plan.getByLabel("Price per camera, per month (USD)").fill("12.50");
  await plan.getByLabel("Provider cost per camera, per month (USD)").fill("4.00");
  await plan.getByLabel("Available for new subscriptions").check();
  await plan.getByRole("button", { name: "Save plan" }).click();
  await expect(saved(plan)).toBeVisible();

  // The subscription.
  await page.goto(clientPath);
  await page.getByText("Add a subscription", { exact: true }).click();
  const addSubscription = page.locator("form").filter({ has: page.getByRole("button", { name: "Add subscription" }) });
  await addSubscription.getByLabel("Plan").selectOption({ label: "Essentials" });
  await addSubscription.getByLabel("Cameras billed").fill("6");
  await addSubscription.getByLabel("Status").selectOption({ label: "Active" });
  await addSubscription.getByLabel("Renews").fill("2027-01-31");
  await addSubscription.getByRole("button", { name: "Add subscription" }).click();
  await expect(page.getByText(/^Essentials · 6 cameras · Active · renews /)).toBeVisible();

  // A document: uploaded, listed, and the link downloads the same bytes.
  const pdf = Buffer.from("%PDF-1.4\n% VX44 e2e test document\n%%EOF\n");
  const upload = page.locator("form").filter({ has: page.getByRole("button", { name: "Upload" }) });
  await upload.getByLabel("Title").fill(DOCUMENT);
  await upload.getByLabel(/^File/).setInputFiles({ name: "agreement.pdf", mimeType: "application/pdf", buffer: pdf });
  await upload.getByRole("button", { name: "Upload" }).click();
  const link = page.getByRole("link", { name: DOCUMENT });
  await expect(link).toBeVisible();
  documentPath = (await link.getAttribute("href"))!;
  const download = await page.request.get(documentPath);
  expect(download.status(), "document download").toBe(200);
  expect((await download.body()).equals(pdf), "downloaded bytes match the upload").toBe(true);

  // This month's reconciliation: the new site starts unchecked and can be matched.
  await page.goto("/admin/reconciliation");
  const row = page.getByRole("listitem").filter({ hasText: SITE });
  await expect(row.getByText("Not checked", { exact: true })).toBeVisible();
  await row.getByLabel("Provider count").fill("6");
  await row.getByLabel("Matched").check();
  await row.getByRole("button", { name: "Save" }).click();
  await expect(saved(row)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: SITE }).locator("p").filter({ hasText: /^Matched$/ })).toBeVisible();

  // The CSV export finds the client by name, with its status and plan.
  const csv = await page.request.get(`/admin/clients/export?q=${encodeURIComponent(CLIENT)}`);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const lines = (await csv.text()).trim().split("\r\n");
  expect(lines[0]).toBe("Name,Contact,Email,Phone,City,State,Country,Status,Plan");
  // Statuses are exported as stored (approved), not as the console's labels.
  expect(lines).toEqual(["Name,Contact,Email,Phone,City,State,Country,Status,Plan", `${CLIENT},,,,,,,approved,Essentials`]);

  // The activity log saw every change, without the server action writing it (database triggers).
  await page.goto(clientPath);
  // Each entry reads "Added site · <who> · <when>".
  for (const entry of ["Added client", "Updated client", "Added site", "Added subscription", "Added document"]) {
    await expect(page.getByText(entry).first(), entry).toBeVisible();
  }
});

test("a signed-out visitor can't reach the CSV export or a document", async ({ request }) => {
  expect(documentPath, "the previous test should have uploaded a document").toBeTruthy();
  for (const path of ["/admin/clients/export", documentPath]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(307);
    expect(new URL(response.headers().location, "http://localhost").pathname, path).toBe("/login");
  }
});
