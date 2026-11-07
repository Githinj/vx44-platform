import Link from "next/link";
import { navLinks } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
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
        <Wordmark href={localePath(locale, "/")} label={t.common.homeLabel} />
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
          />
        </div>
      </div>
    </NavShell>
  );
}
