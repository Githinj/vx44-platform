import { expect, test } from "@playwright/test";
import ar from "../src/i18n/app/ar";

// Sign-in from the outside only. These tests never submit the form or ask for a sign-in link:
// locally that would reach the real Supabase project. Signing in as an MFA admin and reaching
// the leads list needs a test Supabase stack, which CI doesn't have yet.

test("the back office sends signed-out visitors to sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

test("sign-in fields are labelled and the skip link reaches main", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

// SEC-280 round 2, finding 12. The signed-in pages' wordmark linked to "/", which the proxy
// redirects to the visitor's language. Next prefetches the link, so every page paid for that
// redirect, and in a local production build (plain HTTP under upgrade-insecure-requests) the
// redirect failed with ERR_SSL_PROTOCOL_ERROR. The wordmark now links to the visitor's home page
// directly.
test("sign-in in Arabic links home to /ar and logs no errors", async ({ page, baseURL }) => {
  const host = new URL(baseURL!).hostname;
  const errors: string[] = [];
  page.on("console", (message) => {
    const source = message.location().url;
    if (message.type() === "error" && (!source || new URL(source).hostname === host)) {
      errors.push(`${message.text()}${source ? ` (${source})` : ""}`);
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.context().addCookies([{ name: "NEXT_LOCALE", value: "ar", url: baseURL! }]);

  await page.goto("/login", { waitUntil: "load" });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: ar.common.homeLabel })).toHaveAttribute("href", "/ar");
  // Give the link's prefetch time to run.
  await page.waitForTimeout(1500);
  expect(errors, errors.join("\n")).toEqual([]);
});
