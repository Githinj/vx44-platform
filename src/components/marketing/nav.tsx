import Link from "next/link";
import { navLinks } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { CallOrEmail } from "./contact-links";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { NavShell } from "./nav-shell";
import { compactButton } from "./styles";
import { Wordmark } from "./wordmark";

export function Nav({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = navLinks.map((link) => ({ href: localePath(locale, link.href), label: t.nav[link.key] }));
  return (
    <NavShell>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* On phones the wordmark drops its "AI MONITORING" tag so the demo button keeps its
            full label. Translated labels run up to about 180 px (Russian), and the whole row
            with the tag needs about 440 px, so the tag returns from 28rem (SEC-277). */}
        <Wordmark href={localePath(locale, "/")} label={t.common.homeLabel} tagClassName="max-[28rem]:hidden" />
        <NavLinks links={links} label={t.common.mainNav} />
        <div className="flex items-center gap-1">
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} label={t.common.language} compact />
          </div>
          <Link href={localePath(locale, "/demo")} className={compactButton}>
            {t.common.bookDemo}
          </Link>
          <MobileMenu
            locale={locale}
            links={links}
            labels={{
              open: t.common.openMenu,
              close: t.common.closeMenu,
              main: t.common.mainNav,
              language: t.common.language,
              checkCameras: t.common.checkCameras,
              bookDemo: t.common.bookDemo,
            }}
            contact={<CallOrEmail t={t.common} className="mt-2 grid text-center text-sm" />}
          />
        </div>
      </div>
    </NavShell>
  );
}
