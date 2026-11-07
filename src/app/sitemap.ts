import type { MetadataRoute } from "next";
import { publicPages, siteUrl } from "@/content/seo";
import { languageAlternates, localePath, locales } from "@/i18n/config";

// Every page in every language, each listing its translations so search engines show the
// version that matches the searcher's language.
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, siteUrl).toString();
  return publicPages.flatMap((page) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(page.path)).map(([tag, path]) => [tag, absolute(path)]),
    );
    return locales.map((locale) => ({
      url: absolute(localePath(locale, page.path)),
      priority: page.priority,
      alternates: { languages },
    }));
  });
}
