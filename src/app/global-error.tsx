"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { errorDigest } from "@/components/error-text";
import { defaultLocale, isLocale, localeInfo, type Locale } from "@/i18n/config";
import { fontVariables } from "./fonts";
import "./globals.css";

// Last-resort page, shown when a root layout itself fails. It replaces the whole document, so no
// layout, dictionary or provider is available: the few strings it needs live here, and the
// language comes from the URL prefix (English pages have none).
const text: Record<Locale, { title: string; heading: string; body: string; retry: string; reference: string }> = {
  en: {
    title: "Something went wrong",
    heading: "Something went wrong",
    body: "This page didn’t load properly. Try again, or come back in a few minutes.",
    retry: "Try again",
    reference: "Reference:",
  },
  es: {
    title: "Algo salió mal",
    heading: "Algo salió mal",
    body: "Esta página no se cargó correctamente. Inténtelo de nuevo o vuelva en unos minutos.",
    retry: "Intentar de nuevo",
    reference: "Referencia:",
  },
  fr: {
    title: "Un problème est survenu",
    heading: "Un problème est survenu",
    body: "Cette page ne s’est pas chargée correctement. Réessayez, ou revenez dans quelques minutes.",
    retry: "Réessayer",
    reference: "Référence :",
  },
  pt: {
    title: "Algo deu errado",
    heading: "Algo deu errado",
    body: "Esta página não carregou corretamente. Tente de novo ou volte em alguns minutos.",
    retry: "Tentar de novo",
    reference: "Referência:",
  },
  zh: {
    title: "出现了问题",
    heading: "出现了问题",
    body: "此页面未能正常加载。请重试，或几分钟后再来。",
    retry: "重试",
    reference: "参考编号：",
  },
  hi: {
    title: "कुछ गड़बड़ हो गई",
    heading: "कुछ गड़बड़ हो गई",
    body: "यह पेज ठीक से लोड नहीं हुआ। फिर से कोशिश करें, या कुछ मिनट बाद आएँ।",
    retry: "फिर से कोशिश करें",
    reference: "संदर्भ:",
  },
  ar: {
    title: "حدث خطأ ما",
    heading: "حدث خطأ ما",
    body: "لم يتم تحميل هذه الصفحة بشكل صحيح. حاول مرة أخرى، أو عُد بعد بضع دقائق.",
    retry: "حاول مرة أخرى",
    reference: "المرجع:",
  },
  ru: {
    title: "Что-то пошло не так",
    heading: "Что-то пошло не так",
    body: "Эта страница загрузилась с ошибкой. Попробуйте ещё раз или вернитесь через несколько минут.",
    retry: "Попробовать снова",
    reference: "Номер ошибки:",
  },
};

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const first = usePathname()?.split("/")[1];
  const locale = isLocale(first) ? first : defaultLocale;
  const t = text[locale];
  const { tag, dir } = localeInfo[locale];
  const digest = errorDigest(error);

  useEffect(() => {
    // Only Vercel's logs for now; error tracking is a pending decision (SEC-268).
    console.error(error);
  }, [error]);

  return (
    <html lang={tag} dir={dir} className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <title>{`${t.title} | VX44 AI Monitoring`}</title>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
          <p dir="ltr" className="font-display text-xl font-semibold tracking-tight text-text">
            VX<span className="font-bold text-gold">44</span>
          </p>
          <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.heading}</h1>
          <p className="mt-4">{t.body}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-6 font-semibold text-ink"
            >
              {t.retry}
            </button>
          </div>
          {digest && (
            <p className="mt-8 text-sm text-muted">
              {t.reference} <span className="font-mono">{digest}</span>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
