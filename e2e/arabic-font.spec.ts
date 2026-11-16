import { expect, type Page, test } from "@playwright/test";

// Arabic text should be drawn in Noto Sans Arabic, and Latin text on Arabic pages in Sora and
// Inter. next/font gives Sora and Inter a fallback face that is local Arial for every character,
// and Windows Arial has Arabic letters, so before SEC-289 Arabic pages never reached Noto.
// Chrome reports the fonts it really used for a node's text through the DevTools protocol.

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

async function arabicFaces(page: Page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.family.includes("Noto Sans Arabic")).map((face) => face.status);
  });
}

test("Arabic text uses Noto Sans Arabic, and Latin text keeps Sora and Inter (SEC-289)", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "load" });
  expect(await arabicFaces(page)).toContain("loaded");

  for (const selector of ["h1", "main section p", "footer p"]) {
    const fonts = await fontsUsed(page, selector);
    expect(fonts, selector).toContain("Noto Sans Arabic");
    expect(fonts, selector).not.toContain("Arial");
  }

  // The phone number is Latin digits and symbols in the body face.
  const phone = await fontsUsed(page, 'footer a[href^="tel:"]');
  expect(phone).toEqual(["Inter"]);
});

test("English pages don't download the Arabic font", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  expect(await arabicFaces(page)).not.toContain("loaded");
});
