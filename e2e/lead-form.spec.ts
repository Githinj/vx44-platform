import { expect, test, type Page } from "@playwright/test";
import { stubBookingTitle, stubCalendly } from "./calendly-stub";

// The demo form from the visitor's side: fill it in, pass the bot check, submit, see the
// confirmation. The API is stubbed, so no lead is saved and no email is sent, even when run
// on a computer whose .env.local holds real keys. Any other POST to this site is refused.
async function stubLeadApi(page: Page) {
  const posted: unknown[] = [];
  await page.route("**/*", async (route) => {
    const request = route.request();
    const sameSite = new URL(request.url()).hostname === "localhost";
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/leads") {
      posted.push(request.postDataJSON());
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }
    if (request.method() === "POST" && sameSite) return route.abort();
    return route.fallback();
  });
  return posted;
}

async function fillAndSubmit(page: Page) {
  await page.fill('[name="fullName"]', "Test Visitor");
  await page.fill('[name="businessName"]', "Example Store");
  await page.fill('[name="email"]', "visitor@example.com");
  await page.fill('[name="phone"]', "+1 555 0100");
  await page.fill('[name="city"]', "Austin");
  await page.fill('[name="state"]', "TX");
  await page.fill('[name="cameraCount"]', "8");
  await page.selectOption('[name="dvrBrand"]', "Hikvision");
  await page.check('[name="knowsDvrPassword"][value="yes"]');

  // Cloudflare's test key passes on its own; wait for its token before sending.
  await expect(page.locator('[name="cf-turnstile-response"]')).not.toHaveValue("", { timeout: 20_000 });
  await page.locator('form button[type="submit"]').click();
}

for (const { path, dir } of [
  { path: "/demo", dir: "ltr" },
  { path: "/ar/demo", dir: "rtl" },
]) {
  test(`lead form submits on ${path}`, async ({ page }) => {
    const posted = await stubLeadApi(page);
    await stubCalendly(page);
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("dir", dir);

    await fillAndSubmit(page);

    // The confirmation replaces the form and takes focus.
    const confirmation = page.getByRole("status");
    await expect(confirmation).toBeVisible();
    await expect(confirmation.locator("h2")).toBeFocused();

    // The booking calendar follows, with the visitor's name filled in. It is the stub, so the
    // test never waits on Calendly's own network.
    await expect(confirmation.locator('iframe[src^="https://calendly.com/"][src*="name=Test%20Visitor"]')).toBeAttached();
    await expect
      .poll(() => page.frames().find((frame) => frame.url().startsWith("https://calendly.com/"))?.title())
      .toBe(stubBookingTitle);

    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      fullName: "Test Visitor",
      email: "visitor@example.com",
      cameraCount: "8",
      dvrBrand: "Hikvision",
      knowsDvrPassword: "yes",
    });
    expect((posted[0] as { turnstileToken?: string }).turnstileToken).toBeTruthy();
  });
}

test("required fields stop an empty form", async ({ page }) => {
  const posted = await stubLeadApi(page);
  await page.goto("/demo");
  await page.locator('form button[type="submit"]').click();
  const missing = await page.locator('[name="fullName"]').evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
  expect(missing).toBe(true);
  expect(posted).toHaveLength(0);
});
