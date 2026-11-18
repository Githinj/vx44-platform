// Makes every raster icon from the vector mark, src/app/icon.svg. To change the logo:
//   1. Replace src/app/icon.svg with the new mark: a square viewBox (any size), shapes and paths
//      only. Text must be converted to outlines, because an SVG icon that draws letters with
//      <text> may not render for Google.
//   2. If the mark has thin lines, give scripts/icon-small.svg the same shapes with heavier strokes
//      (or delete it to use icon.svg everywhere). It's used only for the 16 and 32 px images in
//      favicon.ico, where thin lines blur into each other. It's a hinting cut, not a second design.
//   3. Run `npm run icons`, then commit the files it rewrites:
//      src/app/icon1.png … icon4.png  48, 96, 192 and 512 px: browser tabs, Google's favicon
//                                     (a multiple of 48 px), the manifest and the Organization logo
//      src/app/apple-icon.png         180 px, on a solid background: iOS rounds the corners itself
//      src/app/favicon.ico            16 and 32 px from the small cut, 48 px from the mark
// Next.js turns these files into the <link> tags (its metadata file conventions), and
// src/app/manifest.ts and the Organization structured data point at icon3.png and icon4.png.
// e2e/search-icons.spec.ts checks the result.
//
// Uses sharp, which Next.js installs for image optimisation, so nothing extra is needed.
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "src/app/icon.svg";
const smallSource = "scripts/icon-small.svg";
const background = "#05080F"; // the mark's own tile colour, for the Apple icon's square

/** Renders one SVG file at any square size. */
async function renderer(file) {
  const svg = await readFile(file);
  // The viewBox width sets the mark's own size: 72 dpi draws one unit as one pixel.
  const viewBox = svg.toString().match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (!viewBox || viewBox[1] !== viewBox[2]) throw new Error(`${file} needs a square viewBox`);
  const units = Number(viewBox[1]);
  // Rendered at twice the size asked for, so every size is a downscale of a sharp image.
  return (size) => sharp(svg, { density: Math.ceil((72 * size) / units) * 2 }).resize(size, size);
}

const render = await renderer(source);
const renderSmall = existsSync(smallSource) ? await renderer(smallSource) : render;

const pngs = [
  ["src/app/icon1.png", 48],
  ["src/app/icon2.png", 96],
  ["src/app/icon3.png", 192],
  ["src/app/icon4.png", 512],
];
for (const [file, size] of pngs) {
  await writeFile(file, await render(size).png({ compressionLevel: 9 }).toBuffer());
}
await writeFile(
  "src/app/apple-icon.png",
  await render(180).flatten({ background }).png({ compressionLevel: 9 }).toBuffer(),
);

// An .ico is a small directory followed by the images; modern ones hold PNGs.
const ico = [
  [16, renderSmall],
  [32, renderSmall],
  [48, render],
];
const images = await Promise.all(ico.map(([size, draw]) => draw(size).png({ compressionLevel: 9 }).toBuffer()));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((image, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(ico[i][0], entry); // width
  header.writeUInt8(ico[i][0], entry + 1); // height
  header.writeUInt8(0, entry + 2); // no palette
  header.writeUInt8(0, entry + 3); // reserved
  header.writeUInt16LE(1, entry + 4); // colour planes
  header.writeUInt16LE(32, entry + 6); // bits per pixel
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...images]));

const smallNote = renderSmall === render ? "" : `, and its 16 and 32 px images from ${smallSource}`;
console.log(`Made ${pngs.length} icons, the Apple icon and favicon.ico from ${source}${smallNote}.`);
