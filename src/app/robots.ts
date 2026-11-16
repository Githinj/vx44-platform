import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The API, the back office and the client portal aren't pages anyone should land on from search.
      disallow: ["/api/", "/admin", "/portal", "/login"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
