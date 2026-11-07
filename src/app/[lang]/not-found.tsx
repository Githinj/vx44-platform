import type { Metadata } from "next";
import { lang } from "next/root-params";
import { NotFoundView } from "@/components/marketing/not-found-view";
import { defaultLocale, isLocale } from "@/i18n/config";

export const metadata: Metadata = { title: "404", robots: { index: false } };

// Shown when a page inside a language calls notFound().
export default async function NotFound() {
  const requested = await lang();
  return <NotFoundView locale={isLocale(requested) ? requested : defaultLocale} />;
}
