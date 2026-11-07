import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

// Each language loads on its own, only on the server, so pages ship just the strings they render.
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((module) => module.default),
  es: () => import("./dictionaries/es").then((module) => module.default),
  fr: () => import("./dictionaries/fr").then((module) => module.default),
  pt: () => import("./dictionaries/pt").then((module) => module.default),
  zh: () => import("./dictionaries/zh").then((module) => module.default),
  hi: () => import("./dictionaries/hi").then((module) => module.default),
  ar: () => import("./dictionaries/ar").then((module) => module.default),
  ru: () => import("./dictionaries/ru").then((module) => module.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

export type { Dictionary };
