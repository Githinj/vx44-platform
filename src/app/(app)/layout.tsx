import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/content/seo";
import { getAppText } from "@/i18n/app-text";
import { localeInfo } from "@/i18n/config";
import { fontVariables } from "../fonts";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.signIn, template: "%s | VX44 AI Monitoring" },
    robots: { index: false },
  };
}

// Sign-in and back-office pages are per-visitor: they read the language cookie (and the session)
// before rendering, rather than serving a shared prerendered shell.
export const instant = false;

export const viewport: Viewport = {
  themeColor: "#05080F",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getAppText();
  const { tag, dir } = localeInfo[locale];
  return (
    <html lang={tag} dir={dir} className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
