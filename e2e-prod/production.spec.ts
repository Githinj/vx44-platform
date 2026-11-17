import { expect, test, type Page } from "@playwright/test";
import { publicPages } from "../src/content/seo";
import { localePath, locales } from "../src/i18n/config";

// Read-only smoke test of the live site, run with `npm run test:prod` or the "Production smoke
// test" GitHub Action. It must never submit a form, book a time or sign in: every request to the
// site other than GET or HEAD is refused and fails the test, and nothing here clicks, types or
// opens the booking calendar.
//
// The test tagged @launch checks the /demo lead form and its bot check. It fails until the
// production Turnstile keys are set (action pack §1, SEC-251), by design: that's how Morris can
// confirm §1 is done. The daily run leaves it out.

// The host under test is the config's baseURL (www.vx44ai.com unless PROD_URL says otherwise).
async function guard(page: Page, host: string) {
  const refused: string[] = [];
  await page.route("**/*", (route) => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method()) && new URL(request.url()).hostname === host) {
      refused.push(`${request.method()} ${request.url()}`);
      return route.abort();
    }
    return route.fallback();
  });
  return refused;
}

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${page.url()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));
  return errors;
}

test.describe("every public page, in every language", () => {
  for (const locale of locales) {
    for (const { path } of publicPages) {
      const url = localePath(locale, path);
      test(`${url} loads with no console errors`, async ({ page, baseURL }) => {
        const refused = await guard(page, new URL(baseURL!).hostname);
        const errors = watchConsole(page);
        const response = await page.goto(url, { waitUntil: "load" });
        expect(response?.status(), `${url} status`).toBe(200);
        await expect(page.locator("h1").first()).toBeVisible();
        // Late errors, from scripts that run after load.
        await page.waitForTimeout(1500);
        expect(errors, errors.join("\n")).toEqual([]);
        expect(refused, "requests other than GET to the site").toEqual([]);
      });
    }
  }
});

test("the security headers are in place", async ({ request }) => {
  const home = await request.get("/es");
  expect(home.status()).toBe(200);
  const headers = home.headers();
  const csp = headers["content-security-policy"] ?? "";
  for (const directive of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) {
    expect(csp, `public CSP has ${directive}`).toContain(directive);
  }
  expect(Number(/max-age=(\d+)/.exec(headers["strict-transport-security"] ?? "")?.[1] ?? 0)).toBeGreaterThanOrEqual(31536000);
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");

  // The sign-in page gets the strict, per-request policy instead.
  const login = await request.get("/login");
  expect(login.status()).toBe(200);
  const loginCsp = login.headers()["content-security-policy"] ?? "";
  const scriptSrc = loginCsp.split(";").find((d) => d.trim().startsWith("script-src")) ?? "";
  expect(scriptSrc).toContain("'nonce-");
  expect(scriptSrc).toContain("'strict-dynamic'");
  expect(scriptSrc).not.toContain("'unsafe-inline'");
});

test("the sign-in page loads", async ({ page, baseURL }) => {
  const refused = await guard(page, new URL(baseURL!).hostname);
  const errors = watchConsole(page);
  await page.goto("/login", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await page.waitForTimeout(1500);
  expect(errors, errors.join("\n")).toEqual([]);
  expect(refused).toEqual([]);
});

test("the demo page shows the lead form and its bot check @launch", async ({ page, baseURL }) => {
  const refused = await guard(page, new URL(baseURL!).hostname);
  const errors = watchConsole(page);
  await page.goto("/demo", { waitUntil: "load" });
  // With the production Turnstile site key built in, the form replaces the "Pick a time" fallback.
  const form = page.locator('form[aria-labelledby="lead-form-title"]');
  await expect(form, "the lead form (needs NEXT_PUBLIC_TURNSTILE_SITE_KEY in production)").toBeVisible();
  await expect(form.locator('[name="fullName"]')).toBeVisible();
  // Cloudflare's widget runs in its own frame.
  await expect
    .poll(() => page.frames().some((frame) => frame.url().startsWith("https://challenges.cloudflare.com/")), {
      message: "the Turnstile bot check loads",
      timeout: 20_000,
    })
    .toBe(true);
  await page.waitForTimeout(1500);
  expect(errors, errors.join("\n")).toEqual([]);
  expect(refused).toEqual([]);
});
