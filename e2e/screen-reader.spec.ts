import { expect, test, type Page } from "@playwright/test";
import { localePath, locales } from "../src/i18n/config";
import { stubCalendly } from "./calendly-stub";
import { dictionaries } from "./dictionaries";
import { expectVisibleFocus } from "./keyboard";

// What a screen reader gets, beyond what axe can measure (SEC-280, finding 11). No real screen
// reader runs here: these check the attributes screen readers rely on.

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  // The menu holds keyboard focus, but a screen reader in browse mode doesn't follow focus. So
  // the page behind the full-height sheet must be inert while it's open (SEC-297).
  test("the open menu makes the page behind it inert, and frees it on close", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const menuButton = page.locator('button[aria-controls="mobile-menu"]');
    const inert = (selector: string) =>
      page.evaluate((s) => Boolean(document.querySelector(s)?.closest("[inert]")), selector);
    const behind = () => Promise.all(["#content", "body > footer", 'a[href="#content"]'].map(inert));

    expect(await behind()).toEqual([false, false, false]);

    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect.poll(behind).toEqual([true, true, true]);
    // The menu itself, and the button that closes it, stay reachable.
    expect(await inert("#mobile-menu")).toBe(false);
    expect(await inert('button[aria-controls="mobile-menu"]')).toBe(false);

    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect.poll(behind).toEqual([false, false, false]);

    // Following a link in the menu closes it and frees the page too.
    await menuButton.click();
    await expect.poll(behind).toEqual([true, true, true]);
    await page.locator("#mobile-menu nav a").first().click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect.poll(behind).toEqual([false, false, false]);
  });
});

// A form only becomes a landmark once it has a name. Without one, a screen reader went from
// "What happens next" straight to "Name, edit text" (SEC-298).
test("the demo form is named by its heading in every language", async ({ page }) => {
  // One page load per language: slow on a busy machine.
  test.slow();
  for (const locale of locales) {
    await test.step(locale, async () => {
      await page.goto(localePath(locale, "/demo"), { waitUntil: "load" });
      const name = dictionaries[locale].leadForm.formTitle;
      const form = page.getByRole("form", { name, exact: true });
      await expect(form).toBeVisible();
      await expect(form.getByRole("heading", { name, exact: true })).toHaveCount(1);
    });
  }
});

// The alert card's header stays in English in every language (DESIGN.md: Label). It isn't a HUD
// label, so it isn't hidden; it's marked as English, so the screen reader switches voice
// (SEC-299). HUD labels on the footage stay hidden.
test("English camera labels on translated home pages are hidden or marked as English", async ({ page }) => {
  test.slow();
  for (const locale of locales.filter((l) => l !== "en")) {
    await test.step(locale, async () => {
      await page.goto(localePath(locale, "/"), { waitUntil: "load" });
      const unmarked = await page.evaluate(() => {
        const found: string[] = [];
        const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode.textContent?.trim() ?? "";
          if (!/\bCAM \d+\b|\bAI ALERT\b/.test(text)) continue;
          const element = walker.currentNode.parentElement!;
          if (element.closest('[aria-hidden="true"]')) continue;
          const lang = element.closest("[lang]")?.getAttribute("lang") ?? "";
          if (!/^en(-|$)/.test(lang)) found.push(`${text} (lang="${lang}")`);
        }
        return found;
      });
      expect(unmarked).toEqual([]);

      // The alert header is still announced, not hidden.
      const header = page.locator("main").getByText("AI ALERT · CAM 01");
      await expect(header).toBeVisible();
      expect(await header.evaluate((element) => element.closest('[aria-hidden="true"]'))).toBeNull();
    });
  }
});

// The skip link's target takes focus only so the next Tab starts there. Its outline used to
// draw a gold box round the whole page (SEC-280 finding 11, item d).
async function useSkipLink(page: Page, target: string) {
  await page.keyboard.press("Tab");
  await expect(page.locator(`a[href="#${target}"]`)).toBeFocused();
  await page.keyboard.press("Enter");
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    const style = getComputedStyle(element);
    const outline = style.outlineStyle === "none" || parseFloat(style.outlineWidth) === 0 ? "none" : `${style.outlineStyle} ${style.outlineWidth}`;
    // :focus-visible must match, or "no outline" would pass for the wrong reason.
    return { id: element.id, focusVisible: element.matches(":focus-visible"), outline };
  });
}

for (const { path, target } of [
  { path: "/", target: "content" },
  { path: "/ar", target: "content" },
  { path: "/login", target: "main" },
]) {
  test(`on ${path}, the skip link's target takes focus without an outline round the page`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load" });
    expect(await useSkipLink(page, target)).toEqual({ id: target, focusVisible: true, outline: "none" });

    // The next Tab goes to the first control in the content, which keeps its focus ring.
    await page.keyboard.press("Tab");
    expect(await page.evaluate((id) => document.getElementById(id)!.contains(document.activeElement), target)).toBe(true);
    await expectVisibleFocus(page);
  });
}

// Focus also moves by script to the /check verdict and to the booking calendar's region, so
// screen readers announce them. Like the skip link's target they aren't controls, and each asks
// for no outline, but the global ring used to beat that and box in the whole section.
async function focusOutline(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    const style = getComputedStyle(element);
    const outline = style.outlineStyle === "none" || parseFloat(style.outlineWidth) === 0 ? "none" : `${style.outlineStyle} ${style.outlineWidth}`;
    // :focus-visible must match, or "no outline" would pass for the wrong reason.
    return { tabindex: element.getAttribute("tabindex"), focusVisible: element.matches(":focus-visible"), outline };
  });
}

test("the /check verdict takes focus without an outline", async ({ page }) => {
  await page.goto("/check", { waitUntil: "load" });
  await page.locator('input[name="brand"][value="Dahua"]').check();
  await page.locator('input[name="cameras"]').fill("8");
  await page.locator('input[name="password"][value="yes"]').check();
  await page.locator('form button[type="submit"]').focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("h2[tabindex='-1']")).toBeFocused();
  expect(await focusOutline(page)).toEqual({ tabindex: "-1", focusVisible: true, outline: "none" });
});

test("the booking calendar's region takes focus without an outline", async ({ page }) => {
  await stubCalendly(page);
  await page.goto("/talk-to-sales", { waitUntil: "load" });
  await page.getByRole("button", { name: dictionaries.en.calendly.open }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("region", { name: dictionaries.en.calendly.label })).toBeFocused();
  expect(await focusOutline(page)).toEqual({ tabindex: "-1", focusVisible: true, outline: "none" });
});
