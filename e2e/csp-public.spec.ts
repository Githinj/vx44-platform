import { expect, test, type Page } from "@playwright/test";
import { publicPages } from "../src/content/seo";
import { localePath, locales } from "../src/i18n/config";
import { stubCalendly } from "./calendly-stub";

// The public pages' Content Security Policy blocks inline event-handler attributes
// (script-src-attr 'none', SEC-266). It's a common way an injected snippet runs (<img onerror=…>),
// and nothing on these pages needs one: React attaches its handlers in script. These tests keep
// it that way. A future onclick= or javascript: link in the HTML fails here, instead of silently
// doing nothing in the browser, and the pages' own features must run with no violation.

const handlerAttribute = /<[a-z][^>]*?\s(on[a-z]+)\s*=/gi;
const javascriptUrl = /\s(?:href|src|action|formaction)\s*=\s*["']?\s*javascript:/gi;

// The markup only: inline scripts carry the page's data as text, not as attributes.
function markup(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

for (const locale of locales) {
  test(`every ${locale} public page blocks and has no inline event handlers`, async ({ request }) => {
    for (const path of [...publicPages.map((p) => p.path), "/no-such-page"]) {
      const url = localePath(locale, path);
      const response = await request.get(url);
      expect(response.status(), url).toBe(path === "/no-such-page" ? 404 : 200);
      expect(response.headers()["content-security-policy"], `${url}: policy`).toContain("script-src-attr 'none'");
      const html = markup(await response.text());
      expect([...html.matchAll(handlerAttribute)].map((m) => m[1]), `${url}: event-handler attributes`).toEqual([]);
      expect(html.match(javascriptUrl) ?? [], `${url}: javascript: URLs`).toEqual([]);
    }
  });
}

// Every policy violation the page reports, and any event-handler attribute in the live page
// (one a script added after load would be blocked too).
async function watchPolicy(page: Page) {
  const fromConsole: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Content Security Policy")) fromConsole.push(message.text());
  });
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { cspViolations: string[] }).cspViolations = seen;
    document.addEventListener(
      "securitypolicyviolation",
      (event) => seen.push(`${event.effectiveDirective} blocked ${event.blockedURI || "inline"}`),
      true,
    );
  });
  return async () => {
    const { violations, handlers } = await page.evaluate(() => ({
      violations: (window as unknown as { cspViolations: string[] }).cspViolations,
      handlers: [...document.querySelectorAll("*")].flatMap((element) =>
        [...element.attributes]
          .filter((attribute) => /^on/i.test(attribute.name))
          .map((attribute) => `<${element.tagName.toLowerCase()} ${attribute.name}>`),
      ),
    }));
    return { violations: [...violations, ...fromConsole], handlers };
  };
}

test("the home page runs with no policy violation", async ({ page }) => {
  const check = await watchPolicy(page);
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  expect(await check()).toEqual({ violations: [], handlers: [] });
});

test("the lead form's bot check runs with no policy violation", async ({ page }) => {
  const check = await watchPolicy(page);
  await page.goto("/demo", { waitUntil: "load" });
  // Cloudflare's test key issues a token once its widget has run.
  await expect(page.locator('[name="cf-turnstile-response"]')).not.toHaveValue("", { timeout: 20_000 });
  expect(await check()).toEqual({ violations: [], handlers: [] });
});

test("the booking calendar opens with no policy violation", async ({ page }) => {
  test.slow();
  // Calendly's hosts are stubbed (calendly-stub.ts); the stubbed requests still pass the policy.
  await stubCalendly(page);
  const check = await watchPolicy(page);
  await page.goto("/talk-to-sales", { waitUntil: "load" });
  const well = page.locator("[data-calendly-well]");
  await well.getByRole("button").click();
  await expect(well.locator('iframe[src^="https://calendly.com/"]')).toBeAttached();
  await page.waitForTimeout(500);
  expect(await check()).toEqual({ violations: [], handlers: [] });
});
