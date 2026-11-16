import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/marketing/footer";
import { Nav } from "@/components/marketing/nav";
import { RevealRoot } from "@/components/marketing/reveal-root";
import { SkipLink } from "@/components/marketing/skip-link";
import { siteUrl } from "@/content/seo";
import { isLocale, languageAlternates, localeInfo, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ErrorTextProvider } from "@/components/error-text";
import { fontVariables } from "../fonts";
import "../globals.css";

// Every language is rendered at build time. The proxy sends any other first segment to the
// English pages, and an unknown language that slips through is a 404 (below).

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.title, template: "%s | VX44 AI Monitoring" },
    description: t.meta.description,
    alternates: { languages: languageAlternates("/") },
    openGraph: {
      title: "VX44 AI Monitoring",
      description: t.meta.ogDescription,
      url: siteUrl,
      siteName: "VX44 AI Monitoring",
      type: "website",
      locale: localeInfo[lang].og,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#05080F",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const { tag, dir } = localeInfo[lang];

  return (
    <html lang={tag} dir={dir} className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ErrorTextProvider value={{ ...t.errorPage, homeLabel: t.common.homeLabel }}>
          <SkipLink label={t.common.skipToContent} />
          <Nav locale={lang} t={t} />
          <div id="content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </div>
          <Footer locale={lang} t={t} />
          <RevealRoot />
        </ErrorTextProvider>
      </body>
    </html>
  );
}
