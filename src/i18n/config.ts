// Languages the site is published in. English is the default and keeps the unprefixed URLs
// (/, /demo); every other language lives under its own prefix (/es, /es/demo).
//
// This module is shared by server and client code, so it must not import anything server-only.

export const locales = ["en", "es", "fr", "pt", "zh", "hi", "ar", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

type LocaleInfo = {
  /** The language's own name, shown in the selector. */
  name: string;
  /** BCP 47 tag for <html lang> and hreflang. */
  tag: string;
  dir: "ltr" | "rtl";
  /** Open Graph locale. */
  og: string;
};

export const localeInfo: Record<Locale, LocaleInfo> = {
  en: { name: "English", tag: "en", dir: "ltr", og: "en_US" },
  es: { name: "Español", tag: "es", dir: "ltr", og: "es_US" },
  fr: { name: "Français", tag: "fr", dir: "ltr", og: "fr_FR" },
  pt: { name: "Português", tag: "pt-BR", dir: "ltr", og: "pt_BR" },
  zh: { name: "中文", tag: "zh-Hans", dir: "ltr", og: "zh_CN" },
  hi: { name: "हिन्दी", tag: "hi", dir: "ltr", og: "hi_IN" },
  ar: { name: "العربية", tag: "ar", dir: "rtl", og: "ar_AR" },
  ru: { name: "Русский", tag: "ru", dir: "ltr", og: "ru_RU" },
};

// The cookie that remembers a visitor's chosen language (also read by the sign-in pages).
export const localeCookie = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

/** Prefixes an internal path with the locale. `/demo` → `/es/demo`, `/#faq` → `/es#faq`. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path;
  if (locale === defaultLocale) return path;
  const hashAt = path.indexOf("#");
  const pathname = hashAt === -1 ? path : path.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : path.slice(hashAt);
  return `/${locale}${pathname === "/" ? "" : pathname}${hash}`;
}

/** Splits `/es/demo` into `{ locale: "es", path: "/demo" }`. Unprefixed paths are English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  // `/en/...` can show up as the internal (rewritten) path of an English page.
  if (isLocale(first)) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

/** hreflang alternates for a page, keyed by language tag, plus x-default. */
export function languageAlternates(path: string): Record<string, string> {
  const entries = locales.map((locale) => [localeInfo[locale].tag, localePath(locale, path)]);
  return { ...Object.fromEntries(entries), "x-default": path };
}
