import "server-only";
import { cookies } from "next/headers";
import type { AppDictionary } from "./app/en";
import { defaultLocale, isLocale, localeCookie, localeInfo, type Locale } from "./config";

const loaders: Record<Locale, () => Promise<AppDictionary>> = {
  en: () => import("./app/en").then((module) => module.default),
  es: () => import("./app/es").then((module) => module.default),
  fr: () => import("./app/fr").then((module) => module.default),
  pt: () => import("./app/pt").then((module) => module.default),
  zh: () => import("./app/zh").then((module) => module.default),
  hi: () => import("./app/hi").then((module) => module.default),
  ar: () => import("./app/ar").then((module) => module.default),
  ru: () => import("./app/ru").then((module) => module.default),
};

/** The sign-in pages and back office follow the language picked on the public site (a cookie). */
export async function getAppLocale(): Promise<Locale> {
  const saved = (await cookies()).get(localeCookie)?.value;
  return isLocale(saved) ? saved : defaultLocale;
}

/** The visitor's language, its copy, and the tag used to format dates and money. */
export async function getAppText() {
  const locale = await getAppLocale();
  const t = await loaders[locale]();
  return { locale, t, format: formatTag(locale) };
}

/** Number and date formatting keeps Latin digits, so figures read the same for every admin. */
export function formatTag(locale: Locale) {
  return `${localeInfo[locale].tag}-u-nu-latn`;
}

export type { AppDictionary };
