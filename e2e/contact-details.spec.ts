import { expect, test, type Page } from "@playwright/test";
import { contact } from "../src/content/site";
import { type Locale, localePath, locales } from "../src/i18n/config";
import { stubCalendly } from "./calendly-stub";
import { dictionaries } from "./dictionaries";

// Ways to reach a person, offered where visitors look for them (SEC-280, findings 2, 6 and 11).
// The footer already has the phone number, email and privacy link on every page, so every check
// here is scoped to the page content or the menu sheet.

const phoneLink = (scope: ReturnType<Page["locator"]>) => scope.locator(`a[href="${contact.phoneHref}"]`);
const emailLink = (scope: ReturnType<Page["locator"]>) => scope.locator(`a[href="mailto:${contact.email}"]`);

// The words around each link are translated; the number and address come from site.ts.
async function expectCallOrEmail(scope: ReturnType<Page["locator"]>, locale: Locale) {
  const t = dictionaries[locale].common;
  const phone = phoneLink(scope);
  await expect(phone).toBeVisible();
  await expect(phone).toHaveText(contact.phone);
  // A phone number reads left to right in every language, Arabic included.
  expect(await phone.evaluate((element) => getComputedStyle(element).direction)).toBe("ltr");
  await expect(scope).toContainText(t.preferToCall.replace("{phone}", contact.phone));

  const email = emailLink(scope);
  await expect(email).toBeVisible();
  await expect(email).toHaveText(contact.email);
  await expect(scope).toContainText(t.orEmail.replace("{email}", contact.email));
}

test("/talk-to-sales shows the phone number and email before the calendar, in every language", async ({ page }) => {
  // Eight page loads in one test: slow on a busy machine.
  test.slow();
  await stubCalendly(page);
  for (const locale of locales) {
    await test.step(locale, async () => {
      await page.goto(localePath(locale, "/talk-to-sales"), { waitUntil: "load" });
      const main = page.locator("main");
      await expectCallOrEmail(main, locale);
      // Before the booking panel, so nobody has to open the calendar to find another way in.
      const before = await phoneLink(main).evaluate((link) => {
        const well = document.querySelector("[data-calendly-well]")!;
        return Boolean(link.compareDocumentPosition(well) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(before, "the phone number comes before the calendar").toBe(true);
    });
  }
});

test("the empty booking panel says what \"Pick a time\" opens, in every language", async ({ page }) => {
  test.slow();
  await stubCalendly(page);
  for (const locale of locales) {
    await test.step(locale, async () => {
      await page.goto(localePath(locale, "/talk-to-sales"), { waitUntil: "load" });
      const t = dictionaries[locale].calendly;
      const well = page.locator("[data-calendly-well]");
      await expect(well.getByText(t.openHint, { exact: true })).toBeVisible();
      // Screen readers hear it with the button, too.
      await expect(well.getByRole("button", { name: t.open })).toHaveAccessibleDescription(t.openHint);
    });
  }
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu shows the phone number and email, inside its focus loop, in every language", async ({ page }) => {
    test.slow();
    for (const locale of locales) {
      await test.step(locale, async () => {
        await page.goto(localePath(locale, "/"), { waitUntil: "load" });
        const menuButton = page.locator('button[aria-controls="mobile-menu"]');
        await menuButton.click();
        await expect(menuButton).toHaveAttribute("aria-expanded", "true");
        const sheet = page.locator("#mobile-menu");
        await expectCallOrEmail(sheet, locale);

        // Tab reaches both links without leaving the menu.
        const reached = new Set<string>();
        for (let i = 0; i < 25 && reached.size < 2; i++) {
          await page.keyboard.press("Tab");
          const href = await page.evaluate(() => document.activeElement?.getAttribute("href") ?? "");
          if (href === contact.phoneHref || href === `mailto:${contact.email}`) reached.add(href);
        }
        expect([...reached].sort()).toEqual([`mailto:${contact.email}`, contact.phoneHref].sort());
        await page.keyboard.press("Escape");
      });
    }
  });
});

// "Our privacy policy explains…" in the footage answer is a link to the privacy page, in the
// visitor's language, and the sentence reads exactly as before.
test("the footage FAQ links to the privacy policy in every language", async ({ page }) => {
  test.slow();
  const footage = dictionaries.en.home.faq.items.findIndex((item) => item.question === "Where is my footage stored?");
  expect(footage).toBeGreaterThanOrEqual(0);
  for (const locale of locales) {
    await test.step(locale, async () => {
      const faq = dictionaries[locale].home.faq;
      await page.goto(localePath(locale, "/"), { waitUntil: "load" });
      const item = page.locator("#faq details").filter({ hasText: faq.items[footage].question });
      await item.locator("summary").click();

      const link = item.getByRole("link");
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", localePath(locale, "/privacy"));
      await expect(link).toHaveText(faq.privacyLink);
      await expect(item.locator("p")).toHaveText(faq.items[footage].answer.replace("{privacy}", faq.privacyLink));
    });
  }
});
