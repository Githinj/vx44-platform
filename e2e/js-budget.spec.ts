import { brotliCompressSync, constants } from "node:zlib";
import { expect, test } from "@playwright/test";

// The JavaScript budget for / (SEC-277, docs/frontend-standards.md, "Performance budget"). It
// counts the module script tags in the page's HTML the way production serves them: Brotli at
// quality 3 (matched byte for byte on live files), plus about 224 B of headers each. The
// polyfill tag is `noModule`, which modern browsers and Lighthouse don't download, so it's left
// out. Route prefetches and code loaded after the page is up don't count.
//
// 150.9 KiB on 2026-11-18, about 137 of it React and Next. The limit leaves about 1 KiB of
// headroom, so growth is a decision rather than drift: raise it here, and in the docs row, on
// purpose.
const budgetKiB = 152;
const headerBytes = 224;

test("the home page's scripts stay within the JavaScript budget", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)]
    .filter((match) => !/\bnomodule\b/i.test(match[0]))
    .map((match) => match[1]);
  expect(sources.length, "module script tags on /").toBeGreaterThan(0);

  let total = 0;
  const rows: string[] = [];
  for (const source of sources) {
    // Uncompressed, so this is the file itself.
    const body = await (await request.get(source, { headers: { "accept-encoding": "identity" } })).body();
    const bytes = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 3 } }).length + headerBytes;
    total += bytes;
    rows.push(`${source.split("/").pop()}: ${(bytes / 1024).toFixed(1)} KiB`);
  }
  const kib = total / 1024;
  console.log(`JavaScript on /: ${kib.toFixed(1)} KiB in ${sources.length} files (budget ${budgetKiB} KiB)`);
  expect(kib, `JavaScript on / over ${budgetKiB} KiB:\n${rows.join("\n")}`).toBeLessThanOrEqual(budgetKiB);
});
