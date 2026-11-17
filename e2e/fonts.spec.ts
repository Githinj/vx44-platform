import { expect, type APIRequestContext, test } from "@playwright/test";

// SEC-277. PageSpeed's mobile LCP is simulated on slow 4G, where everything fetched before the
// hero poster shares the link. Three Latin fonts were preloaded at high priority: Sora (headings),
// Inter (body) and JetBrains Mono, used only for small one-line labels (the wordmark tag, the hero
// alert label and the HUD on the footage). The mono one no longer is, so about 40 KB less competes
// with the poster. These tests pin that down, and check that the mono font arriving late barely
// moves anything.

type Face = { family: string; path: string };

// The @font-face rules in the page's stylesheets, so a font file can be matched to its family
// (next/font gives the files hashed names). The stylesheet points at the files relative to itself
// (url(../media/…)), so each one is resolved to the path the browser requests.
async function fontFaces(request: APIRequestContext, html: string): Promise<Face[]> {
  const sheets = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const faces: Face[] = [];
  for (const sheet of sheets) {
    const sheetUrl = new URL(sheet, "http://page.invalid/");
    const css = await (await request.get(sheet)).text();
    for (const [, block] of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      const family = block.match(/font-family:\s*["']?([^;"']+)/)?.[1]?.trim() ?? "";
      const src = block.match(/url\(([^)]+\.woff2)\)/)?.[1]?.replace(/["']/g, "");
      if (src) faces.push({ family, path: new URL(src, sheetUrl).pathname });
    }
  }
  return faces;
}

// Font preloads, whether sent as a Link response header or as <link> tags in <head>, as paths.
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
  return [...fromHeader, ...fromHead].map((url) => new URL(url, "http://page.invalid/").pathname);
}

test("the home page preloads the heading and body fonts, not the mono font", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();
  const faces = await fontFaces(request, html);
  const preloaded = fontPreloads(response.headers()["link"] ?? "", html);
  const familyOf = (path: string) => faces.find((face) => face.path === path)?.family ?? `unknown (${path})`;
  const families = preloaded.map(familyOf);

  expect(families.some((family) => /Sora/i.test(family)), `preloaded: ${families.join(", ")}`).toBe(true);
  expect(families.some((family) => /Inter/i.test(family)), `preloaded: ${families.join(", ")}`).toBe(true);
  expect(families.filter((family) => /JetBrains/i.test(family)), "JetBrains Mono preloaded").toEqual([]);
});

test("a late mono font barely moves anything on a phone", async ({ page }) => {
  const html = await (await page.request.get("/")).text();
  const mono = new Set(
    (await fontFaces(page.request, html)).filter((face) => /JetBrains/i.test(face.family)).map((face) => face.path),
  );
  expect(mono.size, "JetBrains Mono files in the stylesheet").toBeGreaterThan(0);

  await page.setViewportSize({ width: 375, height: 812 });
  // Only the mono font arrives late (1.5 s), so its labels first render in the size-matched
  // fallback and then swap. Sora and Inter load normally.
  let delayed = 0;
  await page.route(
    (url) => mono.has(url.pathname),
    async (route) => {
      delayed += 1;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    },
  );
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  expect(delayed, "mono font requests held back").toBeGreaterThan(0);
  const monoLoaded = await page.evaluate(() =>
    [...document.fonts].some((face) => /JetBrains/i.test(face.family) && face.status === "loaded"),
  );
  expect(monoLoaded, "the mono font swapped in").toBe(true);

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
  // next/font's size-adjusted fallback keeps the swap close to invisible. It isn't exactly 0: the HUD
  // labels on the footage are 2 px shorter in the mono font, about 0.0002 to 0.0005 locally, the
  // same as on main when the font is late. PageSpeed's limit for "good" is 0.1.
  console.log(`layout shift from the mono font swap: ${shift.toFixed(4)}`);
  expect(shift, "cumulative layout shift after the mono font swaps in").toBeLessThan(0.001);
});
