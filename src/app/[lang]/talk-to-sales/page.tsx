import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendlyBooking } from "@/components/marketing/calendly-booking";
import { pageHeading } from "@/components/marketing/styles";
import { isLocale, languageAlternates, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/talk-to-sales">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    alternates: {
      canonical: localePath(lang, "/talk-to-sales"),
      languages: languageAlternates("/talk-to-sales"),
    },
    title: t.meta.sales.title,
    description: t.meta.sales.description,
  };
}

export default async function TalkToSalesPage({ params }: PageProps<"/[lang]/talk-to-sales">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className={`hero-focus ${pageHeading}`}>{t.sales.heading}</h1>
          <p className="mt-5 text-lg text-pretty">{t.sales.intro}</p>
          <h2 className="mt-12 text-xl font-semibold">{t.sales.bringTitle}</h2>
          <ul className="mt-4 space-y-3 leading-relaxed">
            {t.sales.bring.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface rounded-card p-3 sm:p-8">
          <CalendlyBooking t={t.calendly} />
        </div>
      </div>
    </main>
  );
}
