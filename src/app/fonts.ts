import { Inter, JetBrains_Mono, Noto_Sans_Arabic, Noto_Sans_Devanagari, Sora } from "next/font/google";

// Shared by both root layouts (public site and app). Latin is preloaded; the other scripts load
// only when a page uses them, because each font file carries a unicode-range.
//
// One call per family. Each call already declares every subset Google publishes (latin-ext,
// cyrillic and the rest); `subsets` only picks which files to preload. A second call for the
// same family repeated all those faces under new file names, and because the later rule wins,
// browsers ignored the preloaded Latin files and downloaded them again (SEC-277).
//
// Sora and Inter list their own size-matched fallback faces, declared in globals.css: one for
// Arial and the fonts with its metrics, one for Android's Roboto. A `fallback` list replaces
// next/font's Arial-only face, which machines without Arial skipped (SEC-277).
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  fallback: ["Sora Fallback Arial", "Sora Fallback Roboto"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  fallback: ["Inter Fallback Arial", "Inter Fallback Roboto"],
});
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], preload: false });
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

export const fontVariables = [sora, inter, jetBrainsMono, arabic, devanagari]
  .map((font) => font.variable)
  .join(" ");
