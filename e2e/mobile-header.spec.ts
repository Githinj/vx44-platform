import { expect, test } from "@playwright/test";
import { localeInfo, localePath, locales } from "../src/i18n/config";

// The marketing header has to fit a 375 px phone in every language (SEC-277). The translated
// "Book a demo" labels are longer than the English one, and in four languages the header row
// pushed the menu button off the screen and made the page scroll sideways.
//
// The limit is the literal 375, not window.innerWidth: a phone browser widens its layout
// viewport to fit overflowing content, so the two can grow together and hide the bug.
const width = 375;

test.use({ viewport: { width, height: 812 } });

for (const locale of locales) {
  test(`home page fits a ${width} px screen in ${locale}`, async ({ page }) => {
    await page.goto(localePath(locale, "/"), { waitUntil: "load" });
    // The page really is in this language (no redirect back to English).
    await expect(page.locator("html")).toHaveAttribute("lang", localeInfo[locale].tag);
    // Fallback fonts have different widths, so measure with the real ones.
    await page.evaluate(() => document.fonts.ready);

    const header = page.locator("header").first();
    // The header's own demo button, not the one inside the closed mobile menu sheet.
    const demo = header.locator(`a[href="${localePath(locale, "/demo")}"]:not(#mobile-menu a)`);
    const menu = header.locator('button[aria-controls="mobile-menu"]');
    await expect(demo).toBeVisible();
    await expect(menu).toBeVisible();

    for (const control of [demo, menu]) {
      const box = await control.boundingBox();
      expect(box, "header control has a box").not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, "page scrolls sideways").toBeLessThanOrEqual(width);
  });
}
