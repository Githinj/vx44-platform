import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
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
  "/login",
  "/no-such-page",
];

for (const path of pages) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    // Calendly's real embed is megabytes, and an iframe holds back the page's load event, so
    // /talk-to-sales would wait on it. The axe run skips iframes anyway.
    await stubCalendly(page);
    // Not "networkidle": Turnstile keeps connections open on the form pages.
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    const serious = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`);

    expect(serious, serious.join("\n\n")).toEqual([]);
  });
}
