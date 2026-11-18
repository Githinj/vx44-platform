import { expect, test } from "@playwright/test";

// SEC-277. A stylesheet <link> blocks the first paint: the browser reads the HTML, finds the link,
// then waits a round trip for the CSS before it draws anything. PageSpeed's simulated slow 4G
// counted that at about 130 ms against mobile LCP (2.6 s against a 2.5 s target). With Next's
// inlineCss, the styles arrive inside the HTML instead. Signed-in pages get the same, because the
// option applies to the whole app.

for (const path of ["/", "/demo", "/login"]) {
  test(`${path} carries its styles in the HTML, with no render-blocking stylesheet`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head.match(/<link\b[^>]*rel="stylesheet"[^>]*>/g) ?? [], "stylesheet links in <head>").toEqual([]);
    const inline = [...head.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
    // Two things only the site's own stylesheet has: the web fonts, and the smooth-scroll offset.
    expect(inline, "the web fonts' rules").toContain("@font-face");
    expect(inline, "globals.css").toContain("scroll-padding-top");
  });
}

test("the inlined font rules point at font files that load", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  const inline = [...head.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  // Relative to the page now, not to a stylesheet, so a path that only worked from the old
  // stylesheet's folder would break every font.
  const urls = [...inline.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1].replace(/["']/g, ""));
  expect(urls.length, "font files in the inlined CSS").toBeGreaterThan(0);
  for (const url of new Set(urls.slice(0, 3))) {
    const response = await request.get(new URL(url, "http://page.invalid/").pathname);
    expect(response.status(), url).toBe(200);
  }
});
