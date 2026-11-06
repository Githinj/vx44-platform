import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { Wordmark } from "@/components/marketing/wordmark";

export const metadata: Metadata = {
  title: { default: "Back office", template: "%s | VX44 back office" },
  robots: { index: false },
};

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/reconciliation", label: "Reconciliation" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/activity", label: "Activity" },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
          <Wordmark />
          <nav aria-label="Back office" className="order-3 w-full overflow-x-auto lg:order-none lg:w-auto">
            <ul className="flex gap-5 text-sm whitespace-nowrap">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={signOut} className="ml-auto">
            <button type="submit" className="text-sm transition hover:text-gold">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">{children}</main>
    </>
  );
}
