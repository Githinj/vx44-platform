"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { errorDigest, useErrorText } from "@/components/error-text";
import { Wordmark } from "@/components/marketing/wordmark";
import { errorPageHome } from "@/lib/app-home";

// Shown when a sign-in or back-office page fails to render, or the portal's layout does. The page's
// own layout is gone, so this brings its own <main>. Its links lead back to the back office or the
// portal, depending on where the error happened (src/lib/app-home.ts).
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useErrorText();
  const digest = errorDigest(error);
  const home = errorPageHome(usePathname());

  useEffect(() => {
    // Only Vercel's logs for now; error tracking is a pending decision (SEC-268).
    console.error(error);
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 outline-none">
      <Wordmark href={home} label={t.homeLabel} />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.heading}</h1>
      <p className="mt-4">{t.body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={primaryButtonClass}>
          {t.retry}
        </button>
        <Link href={home} className={secondaryButtonClass}>
          {t.home}
        </Link>
      </div>
      {digest && (
        <p className="mt-8 text-sm text-muted">
          {t.reference} <span className="font-mono">{digest}</span>
        </p>
      )}
    </main>
  );
}
