import type { Locale } from "../src/i18n/config";
import type { Dictionary } from "../src/i18n/dictionaries/en";
import ar from "../src/i18n/dictionaries/ar";
import en from "../src/i18n/dictionaries/en";
import es from "../src/i18n/dictionaries/es";
import fr from "../src/i18n/dictionaries/fr";
import hi from "../src/i18n/dictionaries/hi";
import pt from "../src/i18n/dictionaries/pt";
import ru from "../src/i18n/dictionaries/ru";
import zh from "../src/i18n/dictionaries/zh";

// Every marketing dictionary, so a test can check a page against its own language's text.
export const dictionaries: Record<Locale, Dictionary> = { en, es, fr, pt, zh, hi, ar, ru };
