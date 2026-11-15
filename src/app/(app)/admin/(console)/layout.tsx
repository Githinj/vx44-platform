import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(app)/admin/actions";
import { Wordmark } from "@/components/marketing/wordmark";
import { PendingButton } from "@/components/pending-button";
import { getAppText } from "@/i18n/app-text";
import { requireAdmin } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppText();
  return {
    title: { default: t.meta.backOffice, template: t.meta.backOfficeTemplate },
    robots: { index: false },
  };
}

const links = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/leads", key: "leads" },
  { href: "/admin/clients", key: "clients" },
  { href: "/admin/reconciliation", key: "reconciliation" },
  { href: "/admin/plans", key: "plans" },
  { href: "/admin/activity", key: "activity" },
] as const;

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  // Checked here, before anything streams, so a visitor who isn't a signed-in admin with MFA
  // gets a real redirect (to /login, /no-access or /admin/mfa) straight away. Inside a page's
  // loading boundary the same redirect only happens once the page has started streaming, which
  // left a new admin on an empty /admin when the server was slow. The pages still call
  // requireAdmin() themselves (cached per request), since a layout doesn't re-run on every
  // navigation between its pages.
  await requireAdmin();
  const { t } = await getAppText();
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
          <Wordmark label={t.common.homeLabel} />
          <nav aria-label={t.common.backOfficeNav} className="order-3 w-full overflow-x-auto lg:order-none lg:w-auto">
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
            <PendingButton className="text-sm transition hover:text-gold disabled:opacity-60">
              {t.common.signOut}
            </PendingButton>
          </form>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 outline-none sm:px-6 lg:py-10">{children}</main>
    </>
  );
}
