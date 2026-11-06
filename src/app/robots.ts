import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The API and the back office aren't pages anyone should land on from search.
      disallow: ["/api/", "/admin", "/login"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
