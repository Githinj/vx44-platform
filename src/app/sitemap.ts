import type { MetadataRoute } from "next";
import { publicPages, siteUrl } from "@/content/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    url: new URL(page.path, siteUrl).toString(),
    priority: page.priority,
  }));
}
