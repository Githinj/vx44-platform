import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/marketing/legal-page";
import { defaultLocale, isLocale, languageAlternates, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getLegal } from "@/i18n/legal";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    alternates: { canonical: localePath(lang, "/terms"), languages: languageAlternates("/terms") },
    title: t.meta.terms.title,
    description: t.meta.terms.description,
  };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, legal] = await Promise.all([getDictionary(lang), getLegal(lang)]);

  return (
    <LegalPage
      title={t.meta.terms.title}
      contentsLabel={t.legal.onThisPage}
      notice={lang === defaultLocale ? undefined : t.legal.translationNotice}
    >
      {legal.terms()}
    </LegalPage>
  );
}
