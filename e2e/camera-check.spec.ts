import { expect, test } from "@playwright/test";
import { localeInfo, localePath, locales, type Locale } from "../src/i18n/config";
import type { Dictionary } from "../src/i18n/dictionaries/en";
import ar from "../src/i18n/dictionaries/ar";
import en from "../src/i18n/dictionaries/en";
import es from "../src/i18n/dictionaries/es";
import fr from "../src/i18n/dictionaries/fr";
import hi from "../src/i18n/dictionaries/hi";
import pt from "../src/i18n/dictionaries/pt";
import ru from "../src/i18n/dictionaries/ru";
import zh from "../src/i18n/dictionaries/zh";

const dictionaries: Record<Locale, Dictionary> = { en, es, fr, pt, zh, hi, ar, ru };

// The camera check's submit button used to be written in English in the component, so every
// translated /check page ended in "Check my cameras" (SEC-283). It now comes from the dictionary.
for (const locale of locales) {
  test(`the camera check's button is in ${locale}`, async ({ page }) => {
    await page.goto(localePath(locale, "/check"), { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("lang", localeInfo[locale].tag);
    await expect(page.locator('form button[type="submit"]')).toHaveText(dictionaries[locale].check.submit);
  });
}
