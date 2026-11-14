import { expect, test, type Page } from "@playwright/test";
import { isCalendly, stubCalendly } from "./calendly-stub";

// Calendly's booking widget brings about 3.5 MB of scripts from some 20 hosts, most of them
// trackers. It loads only once the calendar is close to the screen, or on a tap (SEC-277).
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

const calendar = (page: Page) => page.locator('[data-calendly-well] iframe[src^="https://calendly.com/"]');

// Where the calendar is on screen when the page opens, it loads straight away: no tap, no scroll.
// On /talk-to-sales that is every screen size, phones included (its top sits about 550 px down).
for (const { name, viewport } of [
  { name: "a phone", viewport: { width: 375, height: 812 } },
  { name: "a wide screen", viewport: { width: 1280, height: 720 } },
]) {
  test.describe(`on ${name}`, () => {
    test.use({ viewport });

    for (const path of ["/talk-to-sales", "/ar/talk-to-sales"]) {
      test(`${path} loads the calendar without a tap or scroll`, async ({ page }) => {
        const { blocked } = await watchCalendly(page);
        await page.goto(path);
        await expect(calendar(page)).toBeAttached();
        await expect(page.locator("[data-calendly-well] button")).toHaveCount(0);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(blocked).toEqual([]);
      });
    }
  });
}

// No page puts the calendar far below the screen yet, so this test pushes it down to check the
// deferral itself: nothing from Calendly at load, then the calendar once it is scrolled to.
test.describe("further down the page", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("loads nothing from Calendly until the calendar nears the screen", async ({ page }) => {
    const { requests, blocked } = await watchCalendly(page);
    await page.route("**/talk-to-sales", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        "</head>",
        "<style>[data-calendly-well]{margin-top:2000px}</style></head>",
      );
      await route.fulfill({ response, body });
    });
    await page.goto("/talk-to-sales");
    // Long enough for the page to hydrate and the observer to report.
    await page.waitForLoadState("networkidle");
    expect(requests).toEqual([]);
    await expect(page.locator("[data-calendly-well] button")).toBeAttached();

    await page.locator("[data-calendly-well]").scrollIntoViewIfNeeded();
    await expect(calendar(page)).toBeAttached();
    expect(requests.some((url) => url.startsWith("https://assets.calendly.com/"))).toBe(true);
    expect(blocked).toEqual([]);
  });

  test("loads the calendar at once when its placeholder button is pressed", async ({ page }) => {
    const { requests } = await watchCalendly(page);
    await page.route("**/talk-to-sales", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        "</head>",
        "<style>[data-calendly-well]{margin-top:2000px}</style></head>",
      );
      await route.fulfill({ response, body });
    });
    await page.goto("/talk-to-sales");
    await page.waitForLoadState("networkidle");
    expect(requests).toEqual([]);
    // Focused without scrolling and pressed with the keyboard, so the calendar stays far below
    // the screen and only the button can start the load.
    await page.locator("[data-calendly-well] button").evaluate((button: HTMLElement) => button.focus({ preventScroll: true }));
    await page.keyboard.press("Enter");
    await expect(calendar(page)).toBeAttached();
    // The button is gone, so focus moves to the calendar's region rather than the page top.
    await expect(page.getByRole("region", { name: "Book a time" })).toBeFocused();
  });
});
