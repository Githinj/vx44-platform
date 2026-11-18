import { expect, type Page, test } from "@playwright/test";

// SEC-277, found while checking #67. Until Sora and Inter arrive, next/font draws their text in a
// fallback face sized to match them, but that face is local Arial. Machines without Arial (Linux,
// and Android phones) skip it, so the text falls through to the system font at its own size, and
// the page moves when the web fonts arrive. This holds every font back on a phone-sized page,
// checks that a size-matched fallback was found, and that the swap barely moves anything.

type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node: Node | null }[] };

// The system fonts Chrome really used for an element's own text (DevTools protocol).
async function fontsUsed(page: Page, selector: string) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  expect(nodeId, `no element matches ${selector}`).toBeGreaterThan(0);
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  return fonts.map((font) => font.familyName);
}

test("late heading and body fonts barely move anything on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // Every font file arrives 1.5 s late, so the page first renders in the fallbacks.
  await page.route("**/*.woff2", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // While the fonts are held back: which fallback faces in the headline's and the body's font
  // stacks this machine can use, and which system fonts actually drew them.
  const fallbacks = await page.evaluate(async () => {
    const unquote = (name: string) => name.trim().replace(/^["']|["']$/g, "");
    const stack = ["h1", "main section p"].flatMap((selector) =>
      getComputedStyle(document.querySelector(selector)!).fontFamily.split(",").map(unquote),
    );
    const faces = [...document.fonts].filter(
      (face) => /(Sora|Inter) Fallback/.test(face.family) && stack.includes(unquote(face.family)),
    );
    await Promise.allSettled(faces.map((face) => face.load()));
    return faces.map((face) => `${unquote(face.family)}: ${face.status}`);
  });
  const headline = await fontsUsed(page, "h1 span");
  const body = await fontsUsed(page, "main section p");

  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const { total, moved } = await page.evaluate(
    () =>
      new Promise<{ total: number; moved: string[] }>((resolve) => {
        let total = 0;
        const moved = new Set<string>();
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Shift[]) {
            if (entry.hadRecentInput) continue;
            total += entry.value;
            for (const { node } of entry.sources ?? []) {
              const element = node instanceof Element ? node : node?.parentElement;
              if (element) moved.add(`${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 24)}"`);
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve({ total, moved: [...moved] }), 300);
      }),
  );

  console.log(`fallback faces: ${fallbacks.join(", ")}`);
  console.log(`while loading, the headline used ${headline.join(" + ")} and the body ${body.join(" + ")}`);
  console.log(`layout shift with every font late: ${total.toFixed(4)}${moved.length ? `; moved: ${moved.join(", ")}` : ""}`);

  expect(fallbacks.filter((face) => /Sora Fallback.*: loaded/.test(face)), "a size-matched fallback for Sora").not.toEqual([]);
  expect(fallbacks.filter((face) => /Inter Fallback.*: loaded/.test(face)), "a size-matched fallback for Inter").not.toEqual([]);
  // The HUD labels on the footage add about 0.0005 of their own when the mono font is late.
  expect(total, "cumulative layout shift after the fonts swap in").toBeLessThan(0.002);
});
