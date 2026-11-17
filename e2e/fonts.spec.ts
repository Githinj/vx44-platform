import { expect, type APIRequestContext, test } from "@playwright/test";

// SEC-277. PageSpeed's mobile LCP is simulated on slow 4G, where everything fetched before the
// hero poster shares the link. Three Latin fonts were preloaded at high priority: Sora (headings),
// Inter (body) and JetBrains Mono, used only for the small HUD text on the footage. The mono one no
// longer is, so about 33 KB less competes with the poster. These tests pin that down, and check
// that the HUD font arriving late doesn't move anything.

type Face = { family: string; url: string; range: string };

// The @font-face rules in the page's stylesheets, so a font file can be matched to its family
// (next/font gives the files hashed names).
async function fontFaces(request: APIRequestContext, html: string): Promise<Face[]> {
  const sheets = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const faces: Face[] = [];
  for (const sheet of sheets) {
    const css = await (await request.get(sheet)).text();
    for (const [, block] of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      const family = block.match(/font-family:\s*["']?([^;"']+)/)?.[1]?.trim() ?? "";
      const url = block.match(/url\(([^)]+\.woff2)\)/)?.[1]?.replace(/["']/g, "") ?? "";
      const range = block.match(/unicode-range:\s*([^;]+)/)?.[1] ?? "";
      if (url) faces.push({ family, url, range });
    }
  }
  return faces;
}

// Font preloads, whether sent as a Link response header or as <link> tags in <head>.
function fontPreloads(linkHeader: string, html: string) {
  const head = html.slice(0, html.indexOf("</head>"));
  const fromHeader = linkHeader
    .split(/,\s*(?=<)/)
    .filter((part) => /rel=preload/.test(part) && /as="?font/.test(part))
    .map((part) => part.match(/<([^>]+)>/)?.[1] ?? "");
  const fromHead = [...head.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => /rel="preload"/.test(tag) && /as="font"/.test(tag))
    .map((tag) => tag.match(/href="([^"]+)"/)?.[1] ?? "");
  return [...fromHeader, ...fromHead].map((url) => url.replace(/^https?:\/\/[^/]+/, ""));
}

test("the home page preloads the heading and body fonts, not the HUD's mono font", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();
  const faces = await fontFaces(request, html);
  const preloaded = fontPreloads(response.headers()["link"] ?? "", html);
  const familyOf = (url: string) => faces.find((face) => face.url === url)?.family ?? `unknown (${url})`;
  const families = preloaded.map(familyOf);

  expect(families.some((family) => /Sora/i.test(family)), `preloaded: ${families.join(", ")}`).toBe(true);
  expect(families.some((family) => /Inter/i.test(family)), `preloaded: ${families.join(", ")}`).toBe(true);
  expect(families.filter((family) => /JetBrains/i.test(family)), "JetBrains Mono preloaded").toEqual([]);
});

test("a late HUD font moves nothing on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // Every font arrives 1.5 s late, so the page first renders in the fallbacks, then swaps.
  await page.route("**/*.woff2", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const shift = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 300);
      }),
  );
  // next/font's size-adjusted fallbacks should make the swap invisible to layout.
  expect(shift, "cumulative layout shift after the fonts swap in").toBeLessThan(0.001);
});
