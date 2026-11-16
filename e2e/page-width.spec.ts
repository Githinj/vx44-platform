import { expect, test } from "@playwright/test";
import { localeInfo, localePath, locales } from "../src/i18n/config";

// No public page may scroll sideways on a phone, in any language. Translations can carry words
// longer than a phone line: Russian "конфиденциальности" pushed the privacy page's title to
// 408 px on a 375 px screen, and "Индивидуальная" widened the pricing card to 351 px at 320 px.
// header-fit.spec.ts covers the header on the home page; this covers every public page's body.
//
// As there, the limit is the literal screen width, not window.innerWidth, which a phone browser
// widens to fit overflowing content. One test per page and language keeps each one short.
const widths = [320, 375];
const pages = ["/", "/demo", "/check", "/talk-to-sales", "/privacy", "/terms"];

test.use({ viewport: { width: widths[0], height: 700 } });

for (const locale of locales) {
  for (const path of pages) {
    const url = localePath(locale, path);
    test(`${url} doesn't scroll sideways on a phone`, async ({ page }) => {
      await page.goto(url, { waitUntil: "load" });
      await expect(page.locator("html")).toHaveAttribute("lang", localeInfo[locale].tag);
      // Fallback fonts have different widths, so measure with the real ones.
      await page.evaluate(() => document.fonts.ready);

      for (const width of widths) {
        await page.setViewportSize({ width, height: 700 });
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect.soft(scrollWidth, `${url} at ${width} px`).toBeLessThanOrEqual(width);
      }
    });
  }
}
