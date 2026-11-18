import type { MetadataRoute } from "next";
import { brandName } from "@/content/seo";

// The web app manifest, served at /manifest.webmanifest with a <link> on every page. It names the
// site and lists the icons made by `npm run icons` (scripts/make-icons.mjs).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandName,
    short_name: "VX44",
    description: "AI monitoring for the cameras you already own.",
    start_url: "/",
    display: "browser",
    background_color: "#05080f",
    theme_color: "#05080f",
    icons: [
      { src: "/icon3.png", sizes: "192x192", type: "image/png" },
      { src: "/icon4.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
