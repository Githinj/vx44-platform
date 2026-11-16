import type { Metadata } from "next";
import Link from "next/link";
import { secondaryButtonClass } from "@/components/admin/ui";
import { Wordmark } from "@/components/marketing/wordmark";
import { getAppText } from "@/i18n/app-text";

export const metadata: Metadata = { title: "404", robots: { index: false } };

// The 404 for sign-in and the back office. Rendered per request like the rest of this tree, so
// it gets the strict CSP nonce (SEC-269); Next.js's built-in 404 is prebuilt and can't.
export default async function AppNotFound() {
  const { t } = await getAppText();
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 outline-none">
      <Wordmark href="/admin" label={t.common.homeLabel} />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.notFound.heading}</h1>
      <p className="mt-4">{t.notFound.body}</p>
      <div className="mt-6">
        <Link href="/admin" className={secondaryButtonClass}>
          {t.errorPage.home}
        </Link>
      </div>
    </main>
  );
}
