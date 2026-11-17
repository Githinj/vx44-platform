import { expect, test, type Page } from "@playwright/test";
import { ADMIN_EMAIL, UNEMAILED_LEAD } from "./global-setup";
import { secondsLeft, totp } from "./totp";

// The back office as a real admin sees it: sign in, set up the authenticator (first-time MFA),
// then work through the console. Every page is checked for Content Security Policy violations
// and script errors, so a stricter policy can't silently break the back office (SEC-269).

function watchForProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy|Refused to/i.test(message.text())) {
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

test("an admin signs in with MFA and works through the back office", async ({ page }) => {
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
  // Don't type a code that's about to expire.
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.getByLabel("6-digit code").fill(totp(secret!));
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

  // The client's first site starts from the lead's answers (SEC-280 round 2), so the admin
  // doesn't type them again.
  const addSite = page.locator("details").filter({ has: page.locator("summary", { hasText: /^Add a site$/ }) });
  await addSite.locator("summary").click();
  await expect(addSite.getByText("Filled in from the lead this client came from.")).toBeVisible();
  await expect(addSite.getByLabel("Site name", { exact: true })).toHaveValue(UNEMAILED_LEAD);
  await expect(addSite.getByLabel("City", { exact: true })).toHaveValue("Austin");
  await expect(addSite.getByLabel("State", { exact: true })).toHaveValue("TX");
  await expect(addSite.getByLabel("Camera count", { exact: true })).toHaveValue("8");
  await expect(addSite.getByLabel("DVR brand", { exact: true })).toHaveValue("Hikvision");
  // Not `exact`: a select's label text includes its options.
  await expect(addSite.getByLabel("DVR password known")).toHaveValue("yes");
  // Saved as it is, the site lists with the lead's camera count, and the next site starts blank,
  // straight away (a form reset mustn't bring the lead's answers back) and after a reload.
  await addSite.getByRole("button", { name: "Add site" }).click();
  await expect(page.getByText(`${UNEMAILED_LEAD} · 8 cameras`)).toBeVisible();
  await expect(addSite.getByText("Filled in from the lead")).toHaveCount(0);
  await expect(addSite.getByLabel("Site name", { exact: true })).toHaveValue("");
  await expect(addSite.getByLabel("Camera count", { exact: true })).toHaveValue("0");
  await expect(addSite.getByLabel("DVR brand", { exact: true })).toHaveValue("");
  await expect(addSite.getByLabel("DVR password known")).toHaveValue("");
  await page.reload();
  await addSite.locator("summary").click();
  await expect(addSite.getByLabel("Site name", { exact: true })).toHaveValue("");
  await expect(addSite.getByText("Filled in from the lead")).toHaveCount(0);

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
