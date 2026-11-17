import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { signOut } from "@/app/(app)/admin/actions";
import { ErrorTextProvider } from "@/components/error-text";
import { Wordmark } from "@/components/marketing/wordmark";
import { PendingButton } from "@/components/pending-button";
import { getAppText } from "@/i18n/app-text";
import { requireClientRole } from "@/lib/auth";
import { PASSWORD_PENDING_COOKIE } from "@/lib/password-pending";

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
  { href: "/portal/account", key: "account" },
] as const;

// Signed-out visitors and admins are redirected here, before anything streams. The full check,
// including two-step verification, is in (signed-in)/layout.tsx, which wraps every page except
// the code page itself, and each page repeats it.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireClientRole();
  const { t } = await getAppText();
  // A new invitee sees no menu until they've chosen a password: there's nowhere else to go yet.
  const passwordPending = (await cookies()).has(PASSWORD_PENDING_COOKIE);
  return (
    <ErrorTextProvider
      value={{ ...t.errorPage, home: t.portal.backToOverview, homeLabel: t.common.homeLabel }}
    >
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
          <Wordmark label={t.common.homeLabel} />
          {/* On phones the links wrap onto a second row rather than scrolling sideways out of
              sight (Account was off-screen), and each is a 44px tap target (SEC-280). */}
          {!passwordPending && (
            <nav aria-label={t.common.portalNav} className="order-3 w-full md:order-none md:w-auto">
              <ul className="flex flex-wrap gap-x-5 text-sm md:flex-nowrap md:whitespace-nowrap">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-11 items-center transition hover:text-gold">
                      {t.meta[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <form action={signOut} className="ms-auto">
            <PendingButton className="inline-flex min-h-11 items-center text-sm transition hover:text-gold disabled:opacity-60">
              {t.common.signOut}
            </PendingButton>
          </form>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none sm:px-6 lg:py-10">
        {children}
      </main>
    </ErrorTextProvider>
  );
}
