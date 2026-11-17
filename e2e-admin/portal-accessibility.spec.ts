import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import ar from "../src/i18n/app/ar";
import en from "../src/i18n/app/en";
import { CLIENT_EMAIL } from "./seed-client";

// Automated accessibility checks (WCAG 2.1 A and AA) on the client portal, as e2e-admin/
// accessibility.spec.ts runs them on the back office: every portal page, on a phone and at
// desktop width, in English and in Arabic (right to left), plus the choose-a-password step an
// invited client sees first. Serious and critical findings fail. Signs in as the seeded client,
// who has no authenticator, and changes nothing.

const LOADING = { en: en.common.loading, ar: ar.common.loading };
const LOCALES = ["en", "ar"] as const;
const SIZES = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];
const PAGES = ["/portal", "/portal/sites", "/portal/billing", "/portal/documents", "/portal/support", "/portal/account"];

async function seriousProblems(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.target.join(" ")).join("\n    ")}`);
}

test("no serious accessibility problems in the client portal", async ({ page, baseURL }) => {
  test.setTimeout(240_000);
  const found: string[] = [];
  const check = async (where: string) => {
    for (const problem of await seriousProblems(page)) found.push(`${where}\n  ${problem}`);
  };
  const setLocale = (locale: string) => page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: baseURL! }]);

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(CLIENT_EMAIL);
  await page.locator('input[name="password"]').fill(process.env.E2E_CLIENT_PASSWORD!);
  // The sign-in page has two submit buttons ("Sign in" and the emailed-link one).
  await page.getByRole("button", { name: en.login.submit, exact: true }).click();
  await expect(page).toHaveURL(/\/portal$/, { timeout: 30_000 });

  for (const locale of LOCALES) {
    await setLocale(locale);
    for (const size of SIZES) {
      await page.setViewportSize(size);
      for (const path of PAGES) {
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expect(page.getByRole("main")).not.toContainText(LOADING[locale]);
        await page.waitForTimeout(300);
        await check(`${path} (${locale}, ${size.name})`);
      }

      // The first screen after accepting an invite: choose a password, with the menu hidden.
      await page.context().addCookies([{ name: "vx44_password_pending", value: "1", url: `${baseURL}/portal` }]);
      await page.goto("/portal/set-password");
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await check(`/portal/set-password (${locale}, ${size.name})`);
      await page.context().clearCookies({ name: "vx44_password_pending" });
    }
  }

  expect(found, `${found.length} serious or critical accessibility problems:\n\n${found.join("\n\n")}`).toEqual([]);
});
