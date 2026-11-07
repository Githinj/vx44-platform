import { Inter, JetBrains_Mono, Noto_Sans_Arabic, Noto_Sans_Devanagari, Sora } from "next/font/google";

// Shared by both root layouts (public site and app). Latin is preloaded; the other scripts load
// only when a page uses them, because each font file carries a unicode-range.
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const soraExt = Sora({ variable: "--font-sora-ext", subsets: ["latin-ext"], preload: false });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const interExt = Inter({ variable: "--font-inter-ext", subsets: ["latin-ext", "cyrillic"], preload: false });
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], preload: false });
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

export const fontVariables = [sora, soraExt, inter, interExt, jetBrainsMono, arabic, devanagari]
  .map((font) => font.variable)
  .join(" ");
