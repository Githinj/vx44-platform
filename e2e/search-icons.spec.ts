import { expect, type APIRequestContext, test } from "@playwright/test";
import { siteUrl } from "../src/content/seo";

// What Google needs to show the site's icon and name in search results. The favicon must be
// crawlable, square and a multiple of 48 px, the Organization logo a raster image of at least
// 112 px, and the site name comes from WebSite structured data on the home page. An SVG icon
// that draws its letters with <text> may not render for Google, so the mark is plain paths.

type Png = { width: number; height: number };

// Width and height from a PNG's IHDR chunk, or null if it isn't a PNG.
function pngSize(bytes: Buffer): Png | null {
  if (bytes.length < 24 || bytes.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function fetchImage(request: APIRequestContext, href: string) {
  const response = await request.get(href);
  expect(response.status(), `${href} status`).toBe(200);
  const type = response.headers()["content-type"] ?? "";
  expect(type, `${href} content type`).toMatch(/^image\//);
  return { type, bytes: await response.body() };
}

// The site's own URLs in absolute form (structured data, the manifest) fetched from this server.
const local = (url: string) => url.replace(siteUrl, "");

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

test("the head links a vector icon, PNG icons at 48, 96, 192 and 512 px, an Apple icon and a manifest", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const icons = links.filter((tag) => attribute(tag, "rel") === "icon");

  const svg = icons.find((tag) => attribute(tag, "type") === "image/svg+xml");
  expect(svg, "an SVG icon").toBeTruthy();
  const svgText = (await (await request.get(attribute(svg!, "href")!)).text()).toLowerCase();
  expect(svgText, "the SVG icon draws its mark with paths").toContain("<path");
  expect(svgText, "the SVG icon uses no <text>").not.toContain("<text");

  const pngs = icons.filter((tag) => attribute(tag, "type") === "image/png");
  expect(pngs.map((tag) => attribute(tag, "sizes")).sort()).toEqual(["192x192", "48x48", "512x512", "96x96"]);
  for (const tag of pngs) {
    const { bytes } = await fetchImage(request, attribute(tag, "href")!);
    const size = pngSize(bytes);
    expect(size && `${size.width}x${size.height}`, attribute(tag, "href")).toBe(attribute(tag, "sizes"));
  }

  const apple = links.find((tag) => attribute(tag, "rel") === "apple-touch-icon");
  expect(apple, "an Apple touch icon").toBeTruthy();
  expect(pngSize((await fetchImage(request, attribute(apple!, "href")!)).bytes)).toEqual({ width: 180, height: 180 });

  expect(links.some((tag) => attribute(tag, "rel") === "manifest"), "a manifest link").toBe(true);
});

test("/favicon.ico holds 16, 32 and 48 px images", async ({ request }) => {
  const { bytes } = await fetchImage(request, "/favicon.ico");
  // ICONDIR: reserved 0, type 1 (icon), then one 16-byte entry per image, whose first byte is the
  // width (0 meaning 256).
  expect(bytes.readUInt16LE(0)).toBe(0);
  expect(bytes.readUInt16LE(2)).toBe(1);
  const count = bytes.readUInt16LE(4);
  const widths = Array.from({ length: count }, (_, i) => bytes[6 + i * 16] || 256).sort((a, b) => a - b);
  expect(widths).toEqual([16, 32, 48]);
});

test("the manifest names the site and points at icons that exist", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.status()).toBe(200);
  const manifest = (await response.json()) as { name: string; short_name: string; icons: { src: string; sizes: string }[] };
  expect(manifest.name).toBe("VX44 AI Monitoring");
  expect(manifest.short_name).toBe("VX44");
  expect(manifest.icons.map((icon) => icon.sizes).sort()).toEqual(["192x192", "512x512"]);
  for (const icon of manifest.icons) {
    const size = pngSize((await fetchImage(request, local(icon.src))).bytes);
    expect(size && `${size.width}x${size.height}`, icon.src).toBe(icon.sizes);
  }
});

for (const path of ["/", "/es"]) {
  test(`${path} names the site and its logo in structured data`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
      (m) => JSON.parse(m[1]) as Record<string, unknown>,
    );

    // Google reads the site name from WebSite data on the home page.
    const website = blocks.find((block) => block["@type"] === "WebSite");
    expect(website, "WebSite structured data").toBeTruthy();
    expect(website).toMatchObject({ name: "VX44", alternateName: ["VX44 AI Monitoring"], url: `${siteUrl}/` });

    // The logo: a raster image Google can crawl, square, at least 112 px.
    const organization = blocks.find((block) => block["@type"] === "Organization");
    expect(organization, "Organization structured data").toBeTruthy();
    const logo = String(organization!.logo);
    expect(logo.startsWith(`${siteUrl}/`), logo).toBe(true);
    const size = pngSize((await fetchImage(request, local(logo))).bytes);
    expect(size, `${logo} is a PNG`).not.toBeNull();
    expect(size!.width).toBeGreaterThanOrEqual(112);
    expect(size!.width).toBe(size!.height);
  });
}
