import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { isCalendly, stubCalendly } from "./calendly-stub";

// Calendly's booking widget brings about 3.5 MB of scripts from some 20 hosts, most of them
// trackers. Nothing from Calendly loads until the visitor taps "Pick a time", and the tap opens
// the calendar at once (SEC-277). The one exception, the confirmation after the lead form is
// sent, is covered in lead-form.spec.ts.
// Both Calendly hosts are stubbed (see calendly-stub.ts); a Content Security Policy that blocked
// either one still fails these tests.
async function watchCalendly(page: Page) {
  const requests: string[] = [];
  const blocked: string[] = [];
  page.on("request", (request) => {
    if (isCalendly(request.url())) requests.push(request.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Content Security Policy")) blocked.push(message.text());
  });
  await stubCalendly(page);
  return { requests, blocked };
}

// Same rules as accessibility.spec.ts: WCAG 2.1 A and AA, serious and critical findings only,
// and Calendly's own frame left out.
async function seriousAxeProblems(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("iframe")
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

const well = (page: Page) => page.locator("[data-calendly-well]");
const calendar = (page: Page) => well(page).locator('iframe[src^="https://calendly.com/"]');

// The page is open with the "Pick a time" button showing. Checks that nothing has come from
// Calendly, even with the button on screen, then taps it and checks the calendar opens in the
// same box with no second tap. Tests that call this are marked slow: with four browsers sharing
// a laptop, an axe run took up to 10 s, which pushed some runs past the default 30 s.
async function tapToOpen(page: Page, { requests, blocked }: Awaited<ReturnType<typeof watchCalendly>>) {
  const button = well(page).getByRole("button");
  await button.scrollIntoViewIfNeeded();
  // Long enough for the page to hydrate and anything that was going to load to start.
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  expect(await seriousAxeProblems(page)).toEqual([]);

  const before = await well(page).boundingBox();
  await button.click();
  await expect(calendar(page)).toBeAttached();
  expect(requests.some((url) => url.startsWith("https://assets.calendly.com/"))).toBe(true);
  // Focus moves from the vanished button to the calendar, and nothing on the page moved.
  await expect(well(page).getByRole("region")).toBeFocused();
  expect(await well(page).boundingBox()).toEqual(before);
  expect(blocked).toEqual([]);
  expect(await seriousAxeProblems(page)).toEqual([]);
}

for (const { name, viewport } of [
  { name: "a phone", viewport: { width: 375, height: 812 } },
  { name: "a wide screen", viewport: { width: 1280, height: 720 } },
]) {
  test.describe(`on ${name}`, () => {
    test.use({ viewport });

    for (const { path, label } of [
      { path: "/talk-to-sales", label: "Pick a time" },
      { path: "/ar/talk-to-sales", label: "اختر موعدًا" },
    ]) {
      test(`${path} loads nothing from Calendly until "Pick a time" is tapped`, async ({ page }) => {
        test.slow();
        const watched = await watchCalendly(page);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expect(well(page).getByRole("button")).toHaveText(label);
        await tapToOpen(page, watched);
      });
    }
  });
}

// /demo shows the booking calendar in place of the form only when the build has no Turnstile
// site key. CI and the usual local build have one, so this is skipped there; build without
// NEXT_PUBLIC_TURNSTILE_SITE_KEY to run it.
test("the /demo fallback loads nothing from Calendly until \"Pick a time\" is tapped", async ({ page }) => {
  test.slow();
  const watched = await watchCalendly(page);
  await page.goto("/demo");
  await page.waitForLoadState("networkidle");
  test.skip((await well(page).count()) === 0, "This build has a Turnstile key, so /demo shows the lead form");
  await tapToOpen(page, watched);
});
