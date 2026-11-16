// Writes public/grain.png: the film-grain tile drawn over the whole page (body::before in
// src/app/globals.css). Run with `node scripts/make-grain.mjs`.
//
// The grain used to be an inline SVG with an feTurbulence filter. Headless and low-end
// browsers rasterise that filter slowly, and it held back the first paint of the homepage by
// about half a second (SEC-277). A pre-drawn image costs only a decode.
//
// The noise copies the old filter's output: white pixels whose alpha is 0.55 times a value
// centred on 0.5. A fixed seed keeps the file identical between runs.
import { writeFileSync } from "node:fs";
import { crc32, deflateSync } from "node:zlib";

const size = 128;
const levels = 16;

// mulberry32: a small seeded random number generator.
let seed = 0x5ec277;
function random() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// One palette entry per alpha level, all white.
const palette = Buffer.alloc(levels * 3, 255);
const alpha = Buffer.from(Array.from({ length: levels }, (_, i) => Math.round((255 * 0.55 * i) / (levels - 1))));

// 4 bits per pixel, each row prefixed with filter type 0. The mean of three uniform samples
// gives the bell-shaped spread of fractal noise.
const rowBytes = size / 2;
const raw = Buffer.alloc(size * (rowBytes + 1));
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const value = (random() + random() + random()) / 3;
    const index = Math.min(levels - 1, Math.round(value * (levels - 1)));
    const offset = y * (rowBytes + 1) + 1 + (x >> 1);
    raw[offset] |= x % 2 === 0 ? index << 4 : index;
  }
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header[8] = 4; // bit depth
header[9] = 3; // indexed colour
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", header),
  chunk("PLTE", palette),
  chunk("tRNS", alpha),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(new URL("../public/grain.png", import.meta.url), png);
console.log(`public/grain.png: ${size}x${size}, ${png.length} bytes`);
