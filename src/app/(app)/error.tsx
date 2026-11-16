"use client";

import Link from "next/link";
import { useEffect } from "react";
import { primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { errorDigest, useErrorText } from "@/components/error-text";
import { Wordmark } from "@/components/marketing/wordmark";

// Shown when a sign-in or back-office page fails to render. The page's own layout is gone, so
// this brings its own <main>.
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useErrorText();
  const digest = errorDigest(error);

  useEffect(() => {
    // Only Vercel's logs for now; error tracking is a pending decision (SEC-268).
    console.error(error);
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 outline-none">
      <Wordmark href="/admin" label={t.homeLabel} />
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.02em]">{t.heading}</h1>
      <p className="mt-4">{t.body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={primaryButtonClass}>
          {t.retry}
        </button>
        <Link href="/admin" className={secondaryButtonClass}>
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
