import "server-only";
import type { Locale } from "../config";
import type { LegalContent } from "./types";

const loaders: Record<Locale, () => Promise<LegalContent>> = {
  en: () => import("./en").then((module) => module.legal),
  es: () => import("./es").then((module) => module.legal),
  fr: () => import("./fr").then((module) => module.legal),
  pt: () => import("./pt").then((module) => module.legal),
  zh: () => import("./zh").then((module) => module.legal),
  hi: () => import("./hi").then((module) => module.legal),
  ar: () => import("./ar").then((module) => module.legal),
  ru: () => import("./ru").then((module) => module.legal),
};

export function getLegal(locale: Locale): Promise<LegalContent> {
  return loaders[locale]();
}
