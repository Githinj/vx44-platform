import { Inter, JetBrains_Mono, Noto_Sans_Arabic, Noto_Sans_Devanagari, Sora } from "next/font/google";

// Shared by both root layouts (public site and app). Latin Sora and Inter are preloaded. The mono
// font loads when the stylesheet asks for it, and the other scripts only when a page uses them,
// because each font file carries a unicode-range.
//
// One call per family. Each call already declares every subset Google publishes (latin-ext,
// cyrillic and the rest); `subsets` only picks which files to preload. A second call for the
// same family repeated all those faces under new file names, and because the later rule wins,
// browsers ignored the preloaded Latin files and downloaded them again (SEC-277).
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Not preloaded (SEC-277): it's only small one-line labels (the wordmark tag, the hero alert label,
// the HUD on the footage). Preloading it put 40 KB at high priority ahead of the hero poster, which
// PageSpeed's simulated slow 4G counts against LCP. It loads as soon as a label needs it, and swaps
// in from a size-matched fallback.
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], preload: false });
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
