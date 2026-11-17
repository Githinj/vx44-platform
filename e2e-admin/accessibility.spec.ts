import { randomBytes } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ar from "../src/i18n/app/ar";
import en from "../src/i18n/app/en";
import { localSupabase } from "./local-supabase";
import { secondsLeft, totp } from "./totp";

// Automated accessibility checks (WCAG 2.1 A and AA) on the signed-in side, as e2e/ runs them on
// the public site. Sign-in, both two-step screens and every console page, on a phone and at
// desktop width, in English and in Arabic (right to left). On the client page every collapsed
// section is opened first, so its forms are checked too. Serious and critical findings fail.
// Own admin and client, so it doesn't depend on other tests.

const EMAIL = "e2e-axe-admin@example.com";
const CLIENT = "E2E Axe Client";
// Buttons are found by their text in each language, from the app's own dictionaries.
const TEXT = { en, ar };
const LOCALES = ["en", "ar"] as const;
const SIZES = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];
const COMBOS = LOCALES.flatMap((locale) => SIZES.map((size) => ({ locale, size })));
let password = "";
let clientId = "";

test.beforeAll(async () => {
  const { url, serviceRoleKey } = localSupabase();
  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  for (const user of users?.users.filter((u) => u.email === EMAIL) ?? []) await db.auth.admin.deleteUser(user.id);
  password = randomBytes(18).toString("base64url");
  const { data: created, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
  if (error || !created.user) throw new Error(`Creating the test admin failed: ${error?.message}`);
  await db.from("profiles").update({ role: "admin" }).eq("id", created.user.id);

  // A client with a site, so the client page shows a saved site's form as well as "Add a site".
  const { data: old } = await db.from("organizations").select("id").eq("name", CLIENT);
  for (const row of old ?? []) {
    await db.from("sites").delete().eq("org_id", row.id);
    await db.from("organizations").delete().eq("id", row.id);
  }
  const { data: client, error: clientError } = await db
    .from("organizations")
    .insert({ name: CLIENT, city: "Queens", state: "NY" })
    .select("id")
    .single();
  if (clientError || !client) throw new Error(`Creating the test client failed: ${clientError?.message}`);
  clientId = client.id;
  const { error: siteError } = await db.from("sites").insert({ org_id: clientId, name: "Front counter", camera_count: 4 });
  if (siteError) throw new Error(`Creating the test site failed: ${siteError.message}`);
});

async function seriousProblems(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.target.join(" ")).join("\n    ")}`);
}

const found: string[] = [];
async function check(page: Page, where: string) {
  for (const problem of await seriousProblems(page)) found.push(`${where}\n  ${problem}`);
}

async function settled(page: Page, locale: "en" | "ar") {
  await expect(page.getByRole("main")).not.toContainText(TEXT[locale].common.loading);
  // Let fade-ins finish so contrast is measured on the final colours.
  await page.waitForTimeout(300);
}

test("no serious accessibility problems on the signed-in side", async ({ page, baseURL }) => {
  test.setTimeout(240_000);
  const setLocale = (locale: string) => page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: baseURL! }]);

  // Sign-in, before signing in.
  for (const { locale, size } of COMBOS) {
    await setLocale(locale);
    await page.setViewportSize(size);
    await page.goto("/login");
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await check(page, `/login (${locale}, ${size.name})`);
  }

  await setLocale("en");
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: en.login.submit, exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/mfa$/, { timeout: 30_000 });

  // Both two-step screens. Starting setup again replaces the unfinished attempt.
  let secret = "";
  for (const { locale, size } of COMBOS) {
    await setLocale(locale);
    await page.setViewportSize(size);
    await page.goto("/admin/mfa");
    await check(page, `/admin/mfa, set up (${locale}, ${size.name})`);
    await page.getByRole("button", { name: TEXT[locale].mfa.setUp, exact: true }).click();
    await expect(page.locator('input[name="code"]')).toBeVisible();
    secret = (await page.locator("main code").textContent())!.trim();
    await check(page, `/admin/mfa, enter the code (${locale}, ${size.name})`);
  }
  if (secondsLeft() < 5) await page.waitForTimeout((secondsLeft() + 1) * 1000);
  await page.locator('input[name="code"]').fill(totp(secret));
  await page.locator('input[name="code"]').press("Enter");
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  // Every console page. Sites are managed on the client page.
  const pages = ["/admin", "/admin/leads", "/admin/clients", `/admin/clients/${clientId}`, "/admin/reconciliation", "/admin/plans", "/admin/activity"];
  for (const { locale, size } of COMBOS) {
    await setLocale(locale);
    await page.setViewportSize(size);
    for (const path of pages) {
      await page.goto(path);
      // The right page, in the right direction: a lost session would quietly check sign-in instead.
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await settled(page, locale);
      if (path.startsWith("/admin/clients/")) {
        const closed = page.locator("main details:not([open])");
        while ((await closed.count()) > 0) await closed.first().locator("summary").click();
      }
      await check(page, `${path.replace(clientId, "[id]")} (${locale}, ${size.name})`);
    }
  }

  expect(found, `${found.length} serious or critical accessibility problems:\n\n${found.join("\n\n")}`).toEqual([]);
});
