import { expect, test } from "@playwright/test";
import { localeInfo, localePath, locales } from "../src/i18n/config";

// The marketing header has to fit the screen in every language, from a phone to a laptop
// (SEC-277). The translated labels are longer than the English ones: in Spanish, French,
// Portuguese and Russian the header used to push its buttons off a 375 px phone and a
// 768 px tablet, and the page scrolled sideways. Where it was only just too tight, the
// section links broke onto two lines instead.
//
// The limit is the literal screen width, not window.innerWidth: a phone browser widens its
// layout viewport to fit overflowing content, so the two can grow together and hide the bug.
const widths = [375, 768, 1024, 1280];
// The section links show from Tailwind's lg breakpoint; below it they live in the menu.
const linksFrom = 1024;

test.use({ viewport: { width: widths[0], height: 812 } });

for (const locale of locales) {
  test(`header fits the screen in ${locale}`, async ({ page }) => {
    await page.goto(localePath(locale, "/"), { waitUntil: "load" });
    // The page really is in this language (no redirect back to English).
    await expect(page.locator("html")).toHaveAttribute("lang", localeInfo[locale].tag);
    // Fallback fonts have different widths, so measure with the real ones.
    await page.evaluate(() => document.fonts.ready);

    const header = page.locator("header").first();
    // The header's own controls, not the copies inside the closed mobile menu sheet.
    const demo = header.locator(`a[href="${localePath(locale, "/demo")}"]:not(#mobile-menu a)`);
    const menu = header.locator('button[aria-controls="mobile-menu"]');
    const sectionLinks = header.locator("nav:not(#mobile-menu nav)").first();

    for (const width of widths) {
      await test.step(`${width} px`, async () => {
        await page.setViewportSize({ width, height: 812 });

        await expect(demo).toBeVisible();
        if (width < linksFrom) {
          await expect(menu).toBeVisible();
          await expect(sectionLinks).toBeHidden();
        } else {
          await expect(sectionLinks).toBeVisible();
          await expect(menu).toBeHidden();
        }

        const links = width < linksFrom ? [demo] : [demo, ...(await sectionLinks.locator("a").all())];
        const controls = width < linksFrom ? [...links, menu] : links;
        for (const control of controls) {
          const box = await control.boundingBox();
          expect(box, "header control has a box").not.toBeNull();
          expect(box!.x, "control starts on screen").toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width, "control ends on screen").toBeLessThanOrEqual(width);
        }
        for (const link of links) {
          const lines = await link.evaluate((element) => {
            const range = document.createRange();
            range.selectNodeContents(element);
            return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
          });
          expect(lines, `"${await link.textContent()}" stays on one line`).toBe(1);
        }

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth, "page scrolls sideways").toBeLessThanOrEqual(width);
      });
    }
  });
}
