import { expect, test } from "@playwright/test";

// On a phone, every form field needs text of at least 16px. iPhone Safari zooms the page in when
// a smaller field gets focus, and leaves it zoomed (SEC-280 round 2). The sign-in, MFA and
// back-office forms share inputClass (src/components/admin/ui.tsx), so /login stands in for all of
// them here; the public forms use fieldClass and must stay at 16px too.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

for (const path of ["/login", "/check"]) {
  test(`${path}: form fields are at least 16px on a phone`, async ({ page }) => {
    await page.goto(path);
    const fields = page.locator("input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea");
    await expect(fields.first()).toBeVisible();
    const sizes = await fields.evaluateAll((elements) =>
      elements
        .filter((element) => (element as HTMLElement).offsetParent !== null)
        .map((element) => ({
          field: element.getAttribute("name") ?? element.tagName.toLowerCase(),
          size: parseFloat(getComputedStyle(element).fontSize),
        })),
    );
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter(({ size }) => size < 16), "fields under 16px").toEqual([]);
  });
}
