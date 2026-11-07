import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CameraCheck } from "@/components/marketing/camera-check";
import { pageHeading } from "@/components/marketing/styles";
import { isLocale, languageAlternates, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/check">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    alternates: { canonical: localePath(lang, "/check"), languages: languageAlternates("/check") },
    title: t.meta.check.title,
    description: t.meta.check.description,
  };
}

export default async function CheckPage({ params }: PageProps<"/[lang]/check">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className={`hero-focus ${pageHeading}`}>{t.check.heading}</h1>
          <p className="mt-5 text-lg text-pretty">{t.check.intro}</p>
        </div>
        <CameraCheck t={t.check} options={t.options} demoPath={localePath(lang, "/demo")} />
      </div>
    </main>
  );
}
