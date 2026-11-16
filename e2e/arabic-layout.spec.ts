import { expect, test } from "@playwright/test";
import ar from "../src/i18n/dictionaries/ar";
import en from "../src/i18n/dictionaries/en";

// Right-to-left layout bugs found by the persona walkthroughs (SEC-280). English runs too, so a
// fix for Arabic can't break the left-to-right page.

for (const { path, text } of [
  { path: "/", text: en },
  { path: "/ar", text: ar },
]) {
  for (const width of [640, 1280]) {
    test(`the hero alert card leaves the stock footage label visible on ${path} at ${width} px (SEC-285)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: "load" });
      const label = page.getByText(text.common.stockFootage).first();
      await label.scrollIntoViewIfNeeded();
      const covered = await label.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return Boolean(top?.closest(".hero-alert"));
      });
      expect(covered).toBe(false);
    });
  }
}

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of ["/", "/ar"]) {
    test(`each footer contact value lines up with its label on ${path} (SEC-288)`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });
      const rows = page.locator("footer address dl > div");
      await expect(rows).toHaveCount(3);
      const rtl = path === "/ar";
      // Where the text actually sits, not the full-width dt and dd blocks.
      const textEdges = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        return { left: r.left, right: r.right };
      };
      for (const row of await rows.all()) {
        const label = await row.locator("dt").evaluate(textEdges);
        const value = await row.locator("dd").evaluate(textEdges);
        // Start-aligned: the right edges match in Arabic, the left edges in English.
        if (rtl) expect(Math.abs(value.right - label.right)).toBeLessThanOrEqual(1);
        else expect(Math.abs(value.left - label.left)).toBeLessThanOrEqual(1);
      }
    });
  }
});
