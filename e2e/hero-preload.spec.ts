import { expect, test } from "@playwright/test";

// SEC-277. The home page's Largest Contentful Paint is the hero video's poster. It's meant to be
// fetched early and at high priority, but the preload only travelled in the page's script data,
// where React applies it once its client code runs, so the server HTML had no preload link and the
// browser found the poster only when it reached the <video>. The preload must be in the HTML's
// <head>, for exactly the URL the poster uses. Checked on the raw HTML, with no JavaScript.

for (const path of ["/", "/ar"]) {
  test(`${path} preloads the hero poster from the HTML head, at high priority`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const head = html.slice(0, html.indexOf("</head>"));
    const poster = html.match(/<video[^>]*\sposter="([^"]+)"/)?.[1];
    expect(poster, "the hero video has a poster").toBeTruthy();

    const preloads = [...head.matchAll(/<link\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((tag) => /\srel="preload"/.test(tag) && /\sas="image"/.test(tag));
    const forPoster = preloads.find((tag) => tag.includes(`href="${poster}"`));
    expect(forPoster, `a preload link in <head> for ${poster}`).toBeTruthy();
    expect(forPoster).toMatch(/\sfetchPriority="high"|\sfetchpriority="high"/);
  });
}
