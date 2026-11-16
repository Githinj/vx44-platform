import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { stubCalendly } from "./calendly-stub";

// Automated accessibility checks (WCAG 2.1 A and AA) on the main pages. Serious and critical
// findings fail the test. Third-party iframes (Turnstile, Calendly) are excluded: we can't fix them.
const pages = [
  "/",
  "/demo",
  "/check",
  "/talk-to-sales",
  "/privacy",
  "/terms",
  "/ar",
  "/ar/demo",
  "/ar/talk-to-sales",
  "/login",
  "/no-such-page",
];

async function expectNoSeriousProblems(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("iframe")
    .analyze();

  const serious = results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`);

  expect(serious, serious.join("\n\n")).toEqual([]);
}

for (const path of pages) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    // Pages load nothing from Calendly until a tap, but should one start to, this keeps its
    // megabytes off the test: an iframe holds back the page's load event. Axe skips iframes anyway.
    await stubCalendly(page);
    // Not "networkidle": Turnstile keeps connections open on the form pages.
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(1000);
    await expectNoSeriousProblems(page);
  });
}

// States the page checks above never open: every FAQ answer (one of them holds a link inside a
// sentence) and the phone menu with its contact links.
for (const path of ["/", "/ar"]) {
  test(`no serious accessibility problems on ${path} with every FAQ answer open`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load" });
    // The set of closed answers shrinks with each click, so always open the first one left.
    const closed = page.locator("#faq details:not([open])");
    while ((await closed.count()) > 0) await closed.first().locator("summary").click();
    await expect(page.locator("#faq details[open]")).not.toHaveCount(0);
    await expectNoSeriousProblems(page);
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test(`no serious accessibility problems on ${path} with the menu open`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });
      const menuButton = page.locator('button[aria-controls="mobile-menu"]');
      await menuButton.click();
      await expect(menuButton).toHaveAttribute("aria-expanded", "true");
      // The sheet fades in; let it finish so contrast is measured on the final colours.
      await page.waitForTimeout(500);
      await expectNoSeriousProblems(page);
    });
  });
}
