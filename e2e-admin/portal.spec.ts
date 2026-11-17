import { expect, test, type Page } from "@playwright/test";
import { isConsoleProblem } from "../e2e/console";
import { createClient } from "@supabase/supabase-js";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";
import {
  CAMERA_URL,
  CLIENT_DOCUMENT,
  CLIENT_EMAIL,
  CLIENT_ORG,
  MFA_CLIENT_EMAIL,
  OTHER_DOCUMENT,
  OTHER_ORG,
  OTHER_SITE,
  PAYMENT_URL,
  SITE_WITH_CAMERAS,
  SITE_WITHOUT_CAMERAS,
} from "./seed-client";

// The client portal as a real client sees it (SEC-275): sign in, see only their own
// organization, "View my cameras" only where a camera link is set, download only their own
// documents, and no way into the back office. Every page is checked for CSP violations.

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

async function signIn(page: Page, password: string, email = CLIENT_EMAIL) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

// Each code is used once: if the last one came from this 30-second window, wait for the next.
let lastWindow = -1;
async function freshCode(page: Page, secret: string) {
  const window = () => Math.floor(Date.now() / 30_000);
  if (window() === lastWindow || secondsLeft() < 3) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  lastWindow = window();
  return totp(secret);
}

async function expectNoOtherOrg(page: Page) {
  await expect(page.getByRole("main")).not.toContainText(OTHER_ORG);
  await expect(page.getByRole("main")).not.toContainText(OTHER_SITE);
  await expect(page.getByRole("main")).not.toContainText(OTHER_DOCUMENT);
}

test("a client signs in and sees only their own organization", async ({ page }) => {
  const password = process.env.E2E_CLIENT_PASSWORD;
  expect(password, "global setup should have created the test client").toBeTruthy();
  const problems = watchForProblems(page);

  // A client lands on the portal, not the back office, and needs no authenticator.
  await signIn(page, password!);
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  // Overview: their organization and where it is in onboarding.
  await expect(page.getByRole("heading", { level: 2, name: CLIENT_ORG })).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText("Approved");
  await expect(page.getByRole("main")).toContainText("Essentials");
  await expectNoOtherOrg(page);

  // The strict policy applies here too: one CSP header, nonce-based, no 'unsafe-inline' scripts.
  const overview = await page.goto("/portal");
  const csp = (await overview!.headersArray()).filter((h) => h.name.toLowerCase() === "content-security-policy");
  expect(csp, "exactly one CSP header").toHaveLength(1);
  const scriptSrc = csp[0].value.split(";").find((d) => d.trim().startsWith("script-src")) ?? "";
  expect(scriptSrc).toContain("'nonce-");
  expect(scriptSrc).not.toContain("'unsafe-inline'");

  // Sites: "View my cameras" only on the site with a camera link.
  await page.goto("/portal/sites");
  const withCameras = page.getByRole("listitem").filter({ hasText: SITE_WITH_CAMERAS });
  const withoutCameras = page.getByRole("listitem").filter({ hasText: SITE_WITHOUT_CAMERAS });
  await expect(withCameras.getByRole("link", { name: /View my cameras/ })).toHaveAttribute("href", CAMERA_URL);
  await expect(withoutCameras).toBeVisible();
  await expect(withoutCameras.getByRole("link", { name: /View my cameras/ })).toHaveCount(0);
  await expectNoOtherOrg(page);

  // Billing: the plan, its monthly price, and "Pay now" for the payment link. The button only
  // shows with an amount beside it (SEC-280 round 2).
  await page.goto("/portal/billing");
  await expect(page.getByRole("heading", { name: "Essentials" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText(/Monthly price\s*\$\d+\.\d{2}/);
  await expect(page.getByRole("link", { name: /Pay now/ })).toHaveAttribute("href", PAYMENT_URL);

  // Documents: their agreement downloads through a short-lived signed link.
  await page.goto("/portal/documents");
  await expectNoOtherOrg(page);
  const download = page.getByRole("link", { name: new RegExp(`Download.*${CLIENT_DOCUMENT}`) });
  const href = await download.getAttribute("href");
  expect(href).toMatch(/^\/portal\/documents\/[0-9a-f-]{36}$/);
  const redirect = await page.request.get(href!, { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  const signedUrl = redirect.headers().location;
  expect(signedUrl).toContain("/storage/v1/object/sign/documents/");
  const file = await page.request.get(signedUrl);
  expect(file.status()).toBe(200);
  expect((await file.body()).subarray(0, 5).toString()).toBe("%PDF-");

  // Another organization's document can't be reached, even with its exact address.
  const other = await page.request.get(`/portal/documents/${process.env.E2E_OTHER_DOCUMENT_ID}`, { maxRedirects: 0 });
  expect(other.status()).toBe(404);

  // The back office is refused.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/no-access$/);

  // An unknown portal address shows the portal's own 404, inside the portal.
  await page.goto("/portal/no-such-page");
  await expect(page.getByRole("heading", { level: 1, name: "We couldn’t find that page" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to your overview" })).toBeVisible();

  expect(problems, problems.join("\n")).toEqual([]);
});

// On a phone the menu used to scroll sideways with no sign that it did, so Account (password and
// two-step verification) sat off the right edge, and the links were 17px tall (SEC-280 round 2).
test("every portal menu link is on screen and easy to tap on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, process.env.E2E_CLIENT_PASSWORD!);
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });
  const links = page.getByRole("navigation", { name: "Client portal" }).getByRole("link");
  await expect(links).toHaveCount(6);
  for (const link of await links.all()) {
    const name = (await link.textContent())?.trim();
    const box = (await link.boundingBox())!;
    expect(box.x, `${name} starts on screen`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `${name} ends on screen`).toBeLessThanOrEqual(390);
    expect(box.height, `${name} is a 44px tap target`).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth), "no sideways scroll").toBeLessThanOrEqual(390);
});

test("a client updates their details, sends a support message and changes their password", async ({ page }) => {
  const password = process.env.E2E_CLIENT_PASSWORD!;
  const problems = watchForProblems(page);
  await signIn(page, password);
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  // Details: the saved phone number is still there after a reload.
  await page.goto("/portal/account");
  await page.getByLabel("Phone").fill("+1 512 555 0142");
  await page.getByRole("button", { name: "Save details" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Phone")).toHaveValue("+1 512 555 0142");

  // Support: this local stack has no SendGrid key, so the client is told it couldn't be sent
  // (the real send is covered by tests/portal-support.test.ts).
  await page.goto("/portal/support");
  await page.getByLabel("Message").fill("Camera 2 has been offline since Monday.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("couldn’t be sent");

  // Password: change it, sign out, and sign in with the new one.
  const newPassword = `${password}-changed`;
  await page.goto("/portal/account");
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Type the new password again").fill(newPassword);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Password changed." })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await signIn(page, newPassword);
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  expect(problems, problems.join("\n")).toEqual([]);
});

test("a client turns on two-step verification, signs in with a code and turns it off", async ({ page }) => {
  // Up to three codes, each from its own 30-second window.
  test.setTimeout(180_000);
  const password = process.env.E2E_CLIENT_PASSWORD!;
  const problems = watchForProblems(page);
  await signIn(page, password, MFA_CLIENT_EMAIL);
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  // Turn it on from the Account page.
  await page.goto("/portal/account");
  await expect(page.getByRole("main")).toContainText("Off. Turn it on");
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.getByRole("main").locator("code").textContent())?.trim();
  expect(secret).toBeTruthy();
  await page.getByLabel("6-digit code").fill(await freshCode(page, secret!));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByRole("main")).toContainText("On. Each sign-in asks for a code", { timeout: 30_000 });

  // The database insists too: a password-only (aal1) session through the API sees nothing of the
  // organization, even though the person is a member. This also proves the check can read
  // auth.mfa_factors on a real Supabase stack.
  const { url, anonKey } = localSupabase();
  const api = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: apiSignInError } = await api.auth.signInWithPassword({ email: MFA_CLIENT_EMAIL, password });
  expect(apiSignInError).toBeNull();
  const passwordOnly = await api.from("client_organizations").select("name");
  expect(passwordOnly.error).toBeNull();
  expect(passwordOnly.data).toEqual([]);
  await api.auth.signOut();

  // The next sign-in asks for a code before showing anything.
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, password, MFA_CLIENT_EMAIL);
  await expect(page).toHaveURL(/\/portal\/mfa$/, { timeout: 30_000 });
  await page.goto("/portal/sites");
  await expect(page).toHaveURL(/\/portal\/mfa$/);
  await page.getByLabel("6-digit code").fill(totp(secret!).replace(/\d$/, (d) => String((Number(d) + 1) % 10)));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByRole("status")).toContainText("That code didn't work", { timeout: 30_000 });
  await page.getByLabel("6-digit code").fill(await freshCode(page, secret!));
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 2, name: CLIENT_ORG })).toBeVisible();

  // Turning it off needs a current code.
  await page.goto("/portal/account");
  await page.getByLabel("6-digit code").fill(await freshCode(page, secret!));
  await page.getByRole("button", { name: "Turn off" }).click();
  await expect(page.getByRole("main")).toContainText("Off. Turn it on", { timeout: 30_000 });

  // And the next sign-in goes straight to the portal again.
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, password, MFA_CLIENT_EMAIL);
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  expect(problems, problems.join("\n")).toEqual([]);
});
