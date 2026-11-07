import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { LeadForm } from "@/components/marketing/lead-form";
import { pageHeading } from "@/components/marketing/styles";
import { isLocale, languageAlternates, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/demo">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    alternates: { canonical: localePath(lang, "/demo"), languages: languageAlternates("/demo") },
    title: t.meta.demo.title,
    description: t.meta.demo.description,
  };
}

export default async function DemoPage({ params }: PageProps<"/[lang]/demo">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className={`hero-focus ${pageHeading}`}>{t.demo.heading}</h1>
          <p className="hero-rise mt-5 text-lg text-pretty" style={{ "--i": 1 } as CSSProperties}>
            {t.demo.intro}
          </p>
          <h2 className="hero-rise mt-12 text-xl font-semibold" style={{ "--i": 2 } as CSSProperties}>
            {t.demo.nextTitle}
          </h2>
          {/* A short vertical track: the order is the information, so the steps keep numbers. */}
          <ol className="relative mt-6 space-y-7 before:absolute before:start-[0.9375rem] before:top-2 before:bottom-2 before:w-px before:bg-line">
            {t.demo.nextSteps.map((step, index) => (
              <li key={index} className="hero-rise relative flex gap-5" style={{ "--i": index + 3 } as CSSProperties}>
                <span
                  aria-hidden="true"
                  className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-ink font-mono text-[13px] text-gold"
                >
                  {index + 1}
                </span>
                <span className="pt-1 leading-relaxed text-pretty">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="hero-rise" style={{ "--i": 2 } as CSSProperties}>
          <LeadForm
            locale={lang}
            t={t.leadForm}
            options={t.options}
            calendly={t.calendly}
            privacyHref={localePath(lang, "/privacy")}
          />
        </div>
      </div>
    </main>
  );
}
