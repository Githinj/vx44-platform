import { expect, test } from "@playwright/test";
import ar from "../src/i18n/app/ar";
import en from "../src/i18n/app/en";
import { HYDRATION } from "../e2e/console";
import { CLIENT_EMAIL } from "./seed-client";

// Build spec section 10, "Site passes a mobile-width check; no console errors", for the client
// portal, as e2e/phone-width.spec.ts checks the public pages. Every portal page, and the
// choose-a-password step an invited client sees first, at a 375 px phone width in English and in
// Arabic (right to left): nothing scrolls sideways, and the page logs no error of its own. Any
// console error counts, not only the CSP and hydration problems portal.spec.ts watches for.
// Signs in as the seeded client, who has no authenticator, and changes nothing. (It runs before
// portal.spec.ts, which changes that client's password.)

const WIDTH = 375;
const TEXT = { en, ar };
const LOCALES = ["en", "ar"] as const;
const PAGES = ["/portal", "/portal/sites", "/portal/billing", "/portal/documents", "/portal/support", "/portal/account"];

test.use({ viewport: { width: WIDTH, height: 812 } });

test("every portal page fits a phone and logs no errors", async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  const host = new URL(baseURL!).hostname;
  const errors: string[] = [];
  page.on("console", (message) => {
    const source = message.location().url;
    const ours = !source || new URL(source).hostname === host;
    // Errors of our own, and hydration warnings (which development builds log as warnings).
    if (ours && (message.type() === "error" || HYDRATION.test(message.text()))) {
      errors.push(`${new URL(page.url()).pathname}: ${message.text()}${source ? ` (${source})` : ""}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`${new URL(page.url()).pathname}: ${error.message}`));
  const setLocale = (locale: string) => page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: baseURL! }]);

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(CLIENT_EMAIL);
  await page.locator('input[name="password"]').fill(process.env.E2E_CLIENT_PASSWORD!);
  // The sign-in page has two submit buttons ("Sign in" and the emailed-link one).
  await page.getByRole("button", { name: en.login.submit, exact: true }).click();
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  async function fits(path: string, locale: "en" | "ar") {
    await page.goto(path, { waitUntil: "load" });
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByRole("main")).not.toContainText(TEXT[locale].common.loading);
    // Give late errors (a failed image, a client-side fetch) a moment to show.
    await page.waitForTimeout(1000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect.soft(scrollWidth, `${path} (${locale}) scrolls sideways`).toBeLessThanOrEqual(WIDTH);
  }

  for (const locale of LOCALES) {
    await setLocale(locale);
    for (const path of PAGES) await fits(path, locale);

    // The first screen after accepting an invite: choose a password, with the menu hidden.
    await page.context().addCookies([{ name: "vx44_password_pending", value: "1", url: `${baseURL}/portal` }]);
    await fits("/portal/set-password", locale);
    await page.context().clearCookies({ name: "vx44_password_pending" });
  }

  expect(errors, errors.join("\n")).toEqual([]);
});
