import { expect, type Page, test } from "@playwright/test";

// The camera check on /check, after the persona walkthroughs (SEC-280) found three bugs in it.

async function answer(page: Page) {
  await page.locator('input[name="brand"][value="Dahua"]').check();
  await page.locator('input[name="cameras"]').fill("16");
  await page.locator('input[name="password"][value="yes"]').check();
}

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the verdict shows below the floating header, inside the focused heading (SEC-286)", async ({ page }) => {
    await page.goto("/check", { waitUntil: "load" });
    await answer(page);
    const submit = page.locator('form button[type="submit"]');
    await submit.scrollIntoViewIfNeeded();
    await submit.click();

    const heading = page.getByRole("heading", { level: 2, name: /LOOKS COMPATIBLE/ });
    await expect(heading).toBeFocused();
    // The browser scrolls the focused heading into view; give it a frame to settle.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const headerBottom = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
    const verdictTop = await heading.evaluate((el) => el.getBoundingClientRect().top);
    expect(verdictTop).toBeGreaterThanOrEqual(headerBottom);
  });
});

test('"Change my answers" brings the form back filled in, with focus on it (SEC-284)', async ({ page }) => {
  await page.goto("/check", { waitUntil: "load" });
  await answer(page);
  await page.locator('form button[type="submit"]').click();

  await page.getByRole("button", { name: "Change my answers" }).press("Enter");

  const dahua = page.locator('input[name="brand"][value="Dahua"]');
  await expect(dahua).toBeChecked();
  await expect(page.locator('input[name="cameras"]')).toHaveValue("16");
  await expect(page.locator('input[name="password"][value="yes"]')).toBeChecked();
  await expect(dahua).toBeFocused();
});

for (const width of [768, 1280]) {
  test(`the camera count box sits below its question at ${width} px (SEC-287)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/check", { waitUntil: "load" });
    const label = await page.locator('label[for="check-cameras"]').boundingBox();
    const input = await page.locator("#check-cameras").boundingBox();
    expect(label && input).toBeTruthy();
    expect(input!.y).toBeGreaterThanOrEqual(label!.y + label!.height);
  });
}
