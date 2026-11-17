import { expect, test, type Page } from "@playwright/test";
import { isConsoleProblem } from "../e2e/console";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL, INVITEE_EMAIL, UNEMAILED_LEAD } from "./global-setup";
import { localSupabase } from "./local-supabase";
import { clearEmailsTo, latestEmailTo, linkIn } from "./mailpit";
import { CLIENT_ORG, SITE_WITH_CAMERAS } from "./seed-client";
import { secondsLeft, totp } from "./totp";

// The second test signs in with the authenticator the first one sets up, so they run in order and
// the second is skipped if the first fails.
test.describe.configure({ mode: "serial" });

let adminSecret = "";
let lastCodeWindow = -1;

/** A code from a 30-second window not used yet, so no code is entered twice. */
async function freshCode(page: Page) {
  const window = () => Math.floor(Date.now() / 30_000);
  // Also skip a code that's about to expire.
  if (window() === lastCodeWindow || secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  lastCodeWindow = window();
  return totp(adminSecret);
}

// The back office as a real admin sees it: sign in, set up the authenticator (first-time MFA),
// then work through the console. Every page is checked for Content Security Policy violations
// and script errors, so a stricter policy can't silently break the back office (SEC-269).

function watchForProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    // CSP violations and hydration mismatches (the server HTML not matching the browser render).
    if (isConsoleProblem(message)) {
      problems.push(`${page.url()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`${page.url()}: ${error.message}`));
  return problems;
}

async function expectHealthyPage(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), `${path} status`).toBeLessThan(400);
  await expect(page.locator("main#main")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Something went wrong" })).toHaveCount(0);
}

test("an admin signs in with MFA and works through the back office", async ({ page, browser }) => {
  // Many steps, each a server round trip; on a busy machine they have run past 90 seconds.
  test.setTimeout(180_000);
  const password = process.env.E2E_ADMIN_PASSWORD;
  expect(password, "global setup should have created the test admin").toBeTruthy();
  const problems = watchForProblems(page);

  // Sign in. A new admin has no authenticator yet, so the app sends them to set one up.
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });

  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.locator("main code").textContent())?.trim();
  expect(secret).toBeTruthy();
  adminSecret = secret!;
  await page.getByLabel("6-digit code").fill(await freshCode(page));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  // Dashboard: the seeded lead's email never went out, so the SEC-258 warning shows.
  const warning = page.getByRole("alert").filter({ hasText: "weren’t emailed" });
  await expect(warning).toBeVisible();
  await warning.getByRole("link", { name: "Open leads" }).click();
  await expect(page).toHaveURL(/\/admin\/leads$/);

  // Leads inbox: the lead is labelled, and can be converted into a client.
  const lead = page.getByRole("listitem").filter({ hasText: UNEMAILED_LEAD });
  await expect(lead.getByText("Admins weren’t emailed about this lead")).toBeVisible();
  // Converting creates the client and opens its page (the partly prerendered route).
  await lead.getByRole("button", { name: "Convert to client" }).click();
  await expect(page).toHaveURL(/\/admin\/clients\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: UNEMAILED_LEAD })).toBeVisible();
  const clientPage = new URL(page.url()).pathname;

  // Invite someone to this client's portal (SEC-271), then accept the invite as them.
  await clearEmailsTo(INVITEE_EMAIL);
  const inviteForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Invite user" }) });
  await inviteForm.getByLabel("Email").fill(ADMIN_EMAIL);
  await inviteForm.getByRole("button", { name: "Invite user" }).click();
  await expect(inviteForm.getByRole("status")).toContainText("belongs to an admin");

  await inviteForm.getByLabel("Email").fill(INVITEE_EMAIL);
  await inviteForm.getByLabel("Name (optional)").fill("Invited Owner");
  await inviteForm.getByRole("button", { name: "Invite user" }).click();
  await expect(inviteForm.getByRole("status")).toContainText(`Invite sent to ${INVITEE_EMAIL}.`);
  await expect(page.getByRole("listitem").filter({ hasText: INVITEE_EMAIL })).toContainText("Owner");

  const invite = await latestEmailTo(INVITEE_EMAIL);
  expect(invite.subject).toContain("VX44 client portal");
  // It names the business, so it doesn't read like a cold phishing email (SEC-280 round 2).
  expect(invite.html).toContain(`client portal for ${UNEMAILED_LEAD}`);
  const inviteLink = linkIn(invite.html, "/auth/confirm");

  // The invitee, in their own browser: the link signs them in, they choose a password, and they
  // land in this client's portal.
  const inviteeContext = await browser.newContext({ locale: "en-US", reducedMotion: "reduce" });
  const invitee = await inviteeContext.newPage();
  const inviteeProblems = watchForProblems(invitee);
  await invitee.goto(inviteLink);
  await expect(invitee).toHaveURL(/\/portal\/set-password$/, { timeout: 30_000 });
  await expect(invitee.getByRole("main")).toContainText(INVITEE_EMAIL);
  // Choosing a password can't be skipped: no menu, and any other portal page sends them back.
  await expect(invitee.getByRole("navigation", { name: "Client portal" })).toHaveCount(0);
  await invitee.goto("/portal/sites");
  await expect(invitee).toHaveURL(/\/portal\/set-password$/);
  await invitee.getByLabel("New password", { exact: true }).fill("invited owner pass 1");
  await invitee.getByLabel("Type the new password again").fill("invited owner pass 1");
  await invitee.getByRole("button", { name: "Save and continue" }).click();
  await expect(invitee).toHaveURL(/\/portal$/, { timeout: 30_000 });
  await expect(invitee.getByRole("heading", { level: 2, name: UNEMAILED_LEAD })).toBeVisible();
  // With a password chosen, the portal opens up.
  await expect(invitee.getByRole("navigation", { name: "Client portal" })).toBeVisible();
  await invitee.goto("/portal/sites");
  await expect(invitee).toHaveURL(/\/portal\/sites$/);
  // The link works only once.
  await invitee.goto(inviteLink);
  await expect(invitee).toHaveURL(/\/(login|portal)$/);
  expect(inviteeProblems, inviteeProblems.join("\n")).toEqual([]);
  await inviteeContext.close();

  // Inviting someone who already uses their account links them without another email.
  await clearEmailsTo(INVITEE_EMAIL);
  await page.reload();
  await inviteForm.getByLabel("Email").fill(INVITEE_EMAIL);
  await inviteForm.getByRole("button", { name: "Invite user" }).click();
  await expect(inviteForm.getByRole("status")).toContainText("already had an account");

  // Approving the client emails its owner (SEC-272). This local stack has no SendGrid key, so the
  // admin is told the email didn't go, and the new status is kept.
  const statusForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Update" }) });
  await statusForm.getByLabel("Status").selectOption("approved");
  await statusForm.getByRole("button", { name: "Update" }).click();
  await expect(statusForm.getByRole("status")).toContainText("Status saved, but the email to the client couldn’t be sent");
  await page.reload();
  await expect(statusForm.getByLabel("Status")).toHaveValue("approved");

  // Back in the inbox, the converted lead links to its client and is no longer flagged.
  await page.goto("/admin/leads");
  await expect(lead.getByRole("link", { name: "Open client" })).toBeVisible();
  await expect(lead.getByText("Admins weren’t emailed about this lead")).toHaveCount(0);

  // The strict policy is really there (zero violations would also "pass" if it vanished): one
  // CSP header, nonce-based, with no 'unsafe-inline' for scripts.
  const dashboard = await page.goto("/admin");
  const csp = (await dashboard!.headersArray()).filter((h) => h.name.toLowerCase() === "content-security-policy");
  expect(csp, "exactly one CSP header").toHaveLength(1);
  const scriptSrc = csp[0].value.split(";").find((d) => d.trim().startsWith("script-src")) ?? "";
  expect(scriptSrc).toContain("'nonce-");
  expect(scriptSrc).toContain("'strict-dynamic'");
  expect(scriptSrc).not.toContain("'unsafe-inline'");

  // Every other console page renders.
  for (const path of ["/admin", "/admin/leads", "/admin/clients", clientPage, "/admin/reconciliation", "/admin/plans", "/admin/activity"]) {
    await expectHealthyPage(page, path);
  }

  // An unknown back-office address shows the back office's own 404 page (rendered per request, so
  // it carries the CSP nonce). The response has already started streaming when the page decides
  // it's missing, so the status stays 200 and Next.js marks it noindex instead (documented
  // behaviour; only signed-in admins can reach it).
  await page.goto("/admin/no-such-page");
  await expect(page.getByRole("heading", { level: 1, name: "We couldn’t find that page" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();

  expect(problems, problems.join("\n")).toEqual([]);
});

// Build spec section 10, checked on the real pages: "Admin adds a site with camera count and
// provider refs; dashboard totals update", "Dashboard MRR, cameras and margin match a hand
// calculation on seed data" and "Reconciliation page flags a deliberate camera-count mismatch".
test("dashboard totals match a hand calculation, and reconciliation flags a mismatch", async ({ page }) => {
  test.setTimeout(180_000);
  expect(adminSecret, "the first test should have set up the authenticator").toBeTruthy();
  const problems = watchForProblems(page);

  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });
  await page.getByLabel("6-digit code").fill(await freshCode(page));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  // The hand calculation, straight from the database rows, using the spec's formulas:
  // MRR = Σ(active subscriptions × cameras billed × plan price), provider cost likewise,
  // margin = MRR − provider cost, and cameras = Σ camera counts of sites that aren't removed.
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  async function handCalculation() {
    const subscriptions = await db
      .from("subscriptions")
      .select("status, cameras_billed, plans(price_per_camera_month, provider_cost_per_camera_month)");
    const sites = await db.from("sites").select("status, camera_count");
    expect(subscriptions.error ?? sites.error).toBeNull();
    let mrr = 0;
    let cost = 0;
    for (const row of subscriptions.data ?? []) {
      const plan = row.plans as unknown as { price_per_camera_month: number; provider_cost_per_camera_month: number };
      if (row.status !== "active") continue;
      mrr += row.cameras_billed * Number(plan.price_per_camera_month);
      cost += row.cameras_billed * Number(plan.provider_cost_per_camera_month);
    }
    const liveSites = (sites.data ?? []).filter((site) => site.status !== "removed");
    return {
      mrr,
      cost,
      margin: mrr - cost,
      sites: liveSites.length,
      cameras: liveSites.reduce((total, site) => total + site.camera_count, 0),
    };
  }
  const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const stat = (label: string) =>
    page.getByRole("main").locator("p", { hasText: new RegExp(`^${label}$`) }).locator("xpath=following-sibling::p[1]");

  async function expectDashboardMatches() {
    const expected = await handCalculation();
    await page.goto("/admin");
    await expect(stat("MRR")).toHaveText(money(expected.mrr));
    await expect(stat("Provider cost")).toHaveText(money(expected.cost));
    await expect(stat("Gross margin")).toHaveText(money(expected.margin));
    await expect(stat("Active sites")).toHaveText(String(expected.sites));
    await expect(stat("Cameras under management")).toHaveText(String(expected.cameras));
    return expected;
  }

  // The seed's active subscription (6 cameras at $10, provider cost $4) is part of the totals.
  const before = await expectDashboardMatches();
  expect(before.mrr).toBeGreaterThanOrEqual(60);
  expect(before.margin).toBeGreaterThanOrEqual(36);

  // Add a site with a camera count and provider refs; the dashboard totals move by exactly that.
  const { data: org } = await db.from("organizations").select("id").eq("name", CLIENT_ORG).single();
  await page.goto(`/admin/clients/${org!.id}`);
  const addSite = page.locator("details").filter({ has: page.locator("summary", { hasText: "Add a site" }) });
  await addSite.locator("summary").click();
  await addSite.getByLabel("Site name").fill("E2E Added Site");
  await addSite.getByLabel("Camera count").fill("5");
  await addSite.getByLabel("Provider customer ref").fill("E2E-REF-5");
  await addSite.getByLabel("Cloud ID").fill("E2E-CLOUD-5");
  await addSite.getByRole("button", { name: "Add site" }).click();
  await expect(addSite.getByRole("status")).toContainText("Saved", { timeout: 30_000 });

  const after = await expectDashboardMatches();
  expect(after.sites).toBe(before.sites + 1);
  expect(after.cameras).toBe(before.cameras + 5);

  // SEC-264: a new site starts on the current video service. Moving it to the VX44 platform is
  // its own form: it saves the platform only, and the activity log records the move.
  await page.goto(`/admin/clients/${org!.id}`);
  const added = page.locator("details").filter({ has: page.locator("summary", { hasText: "E2E Added Site" }) });
  await expect(added.locator("summary [data-video-platform]")).toHaveText("Video platform: Current video service");
  await added.locator("summary").click();
  const platformForm = added.locator("form").filter({ has: page.getByRole("button", { name: "Save video platform" }) });
  await platformForm.getByLabel("Video platform").selectOption("vx44");
  await platformForm.getByRole("button", { name: "Save video platform" }).click();
  await expect(platformForm.getByRole("status")).toContainText("Saved", { timeout: 30_000 });
  await expect(added.locator("summary [data-video-platform]")).toHaveText("Video platform: VX44 video platform");
  const { data: moved } = await db.from("sites").select("video_platform, camera_count").eq("name", "E2E Added Site").single();
  expect(moved).toEqual({ video_platform: "vx44", camera_count: 5 });
  await page.goto("/admin/activity");
  await expect(page.getByRole("main")).toContainText("video platform: white_label → vx44");

  // Reconciliation: the provider shows 3 cameras where we have 4. Even ticked as matched, the
  // site is flagged, and the dashboard counts it as unreconciled.
  await page.goto("/admin/reconciliation");
  const site = page.getByRole("listitem").filter({ hasText: `${CLIENT_ORG} · ${SITE_WITH_CAMERAS}` });
  await site.getByLabel("Provider count").fill("3");
  await site.getByRole("checkbox", { name: "Matched" }).check();
  await site.getByRole("button", { name: "Save" }).click();
  await expect(site.getByText("Mismatch", { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.goto("/admin");
  await expect(page.getByRole("main")).toContainText("Sites unreconciled this month");

  expect(problems, problems.join("\n")).toEqual([]);
});
