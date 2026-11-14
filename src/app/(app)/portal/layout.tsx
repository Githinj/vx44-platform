import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(app)/admin/actions";
import { ErrorTextProvider } from "@/components/error-text";
import { Wordmark } from "@/components/marketing/wordmark";
import { getAppText } from "@/i18n/app-text";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return {
    title: { default: t.meta.portal, template: t.meta.portalTemplate },
    robots: { index: false },
  };
}

const links = [
  { href: "/portal", key: "overview" },
  { href: "/portal/sites", key: "sites" },
  { href: "/portal/billing", key: "billing" },
  { href: "/portal/documents", key: "documents" },
  { href: "/portal/support", key: "support" },
] as const;

// The session is checked by each page (requireClient), not here, so a failed check never takes
// the whole layout down with it.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getAppText();
  return (
    <ErrorTextProvider
      value={{ ...t.errorPage, home: t.portal.backToOverview, homeLabel: t.common.homeLabel }}
    >
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
          <Wordmark label={t.common.homeLabel} />
          <nav aria-label={t.common.portalNav} className="order-3 w-full overflow-x-auto md:order-none md:w-auto">
            <ul className="flex gap-5 text-sm whitespace-nowrap">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-gold">
                    {t.meta[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={signOut} className="ms-auto">
            <button type="submit" className="text-sm transition hover:text-gold">
              {t.common.signOut}
            </button>
          </form>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none sm:px-6 lg:py-10">
        {children}
      </main>
    </ErrorTextProvider>
  );
}
