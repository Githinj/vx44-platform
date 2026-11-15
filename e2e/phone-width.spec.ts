import { expect, test } from "@playwright/test";

// Build spec section 10: "Site passes a mobile-width check; no console errors." Each main page
// at a 375 px phone width: nothing scrolls sideways, and the page logs no errors of its own.
// Errors from third-party frames (Cloudflare Turnstile, Calendly) are left out: we can't fix them.
// The header is checked control by control, in every language, in header-fit.spec.ts.

const pages = ["/", "/demo", "/check", "/talk-to-sales", "/privacy", "/terms", "/login", "/es", "/ar"];

test.use({ viewport: { width: 375, height: 812 } });

for (const path of pages) {
  test(`${path} fits a phone and logs no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      const source = message.location().url;
      const ours = !source || new URL(source).hostname === "localhost";
      if (message.type() === "error" && ours) errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    // Not "networkidle": Turnstile and Calendly keep connections open on the form pages.
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(1000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, "page scrolls sideways").toBeLessThanOrEqual(375);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
