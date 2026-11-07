import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/marketing/legal-page";
import { defaultLocale, isLocale, languageAlternates, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getLegal } from "@/i18n/legal";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    alternates: { canonical: localePath(lang, "/privacy"), languages: languageAlternates("/privacy") },
    title: t.meta.privacy.title,
    description: t.meta.privacy.description,
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, legal] = await Promise.all([getDictionary(lang), getLegal(lang)]);

  return (
    <LegalPage
      title={t.meta.privacy.title}
      contentsLabel={t.legal.onThisPage}
      notice={lang === defaultLocale ? undefined : t.legal.translationNotice}
    >
      {legal.privacy()}
    </LegalPage>
  );
}
