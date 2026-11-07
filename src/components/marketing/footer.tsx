import Link from "next/link";
import { formatAddress, navLinks, placeholders } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { EmailLink, PhoneLink } from "./contact-links";
import { LanguageSwitcher } from "./language-switcher";
import { Wordmark } from "./wordmark";

const heading = "text-sm font-semibold text-text";
const list = "mt-4 grid gap-0.5";
const link =
  "inline-flex min-h-10 items-center text-[0.9375rem] transition-colors duration-180 hover:text-text";
const legalLink = "inline-flex min-h-11 items-center transition-colors duration-180 hover:text-text";

// A quiet, structured close: who VX44 is, where to go next, and how to reach a person.
export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const getStarted = [
    { href: "/demo", label: t.common.bookDemo },
    { href: "/check", label: t.common.checkCameras },
    { href: "/talk-to-sales", label: t.common.talkToSales },
  ];

  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-10 lg:py-20">
          <div className="col-span-2 max-w-xs lg:col-span-1">
            <Wordmark href={localePath(locale, "/")} label={t.common.homeLabel} />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-pretty">{t.footer.tagline}</p>
          </div>

          <nav aria-label={t.footer.footerNav}>
            <h2 className={heading}>{t.footer.explore}</h2>
            <ul className={list}>
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={localePath(locale, item.href)} className={link}>
                    {t.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.getStarted}>
            <h2 className={heading}>{t.footer.getStarted}</h2>
            <ul className={list}>
              {getStarted.map((item) => (
                <li key={item.href}>
                  <Link href={localePath(locale, item.href)} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Each detail is labelled, so nobody has to guess which line is which. */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className={heading}>{t.footer.contact}</h2>
            <address className="mt-4 not-italic">
              <dl className="grid gap-4 text-[0.9375rem]">
                <div>
                  <dt className="text-xs text-muted">{t.footer.email}</dt>
                  <dd className="text-text">
                    <EmailLink className="inline-flex min-h-8 items-center" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.footer.phone}</dt>
                  {/* Phone numbers and addresses read left to right in every language. */}
                  <dd className="text-text" dir="ltr">
                    <PhoneLink className="inline-flex min-h-8 items-center" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.footer.address}</dt>
                  <dd className="mt-1 leading-relaxed text-text" dir="ltr">
                    {formatAddress()}
                  </dd>
                </div>
              </dl>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-line py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="py-2 sm:py-0">
            &copy; {placeholders.legalEntity}. {t.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-6">
            <nav aria-label={t.footer.legal} className="flex gap-6">
              <Link href={localePath(locale, "/privacy")} className={legalLink}>
                {t.footer.privacy}
              </Link>
              <Link href={localePath(locale, "/terms")} className={legalLink}>
                {t.footer.terms}
              </Link>
            </nav>
            <div className="-ms-3">
              <LanguageSwitcher locale={locale} label={t.common.language} placement="up" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
