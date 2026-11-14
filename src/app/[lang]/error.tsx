"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, type CSSProperties } from "react";
import { errorDigest, useErrorText } from "@/components/error-text";
import { NoSignalFrame } from "@/components/marketing/no-signal-frame";
import { pageHeading, primaryButton, textLink } from "@/components/marketing/styles";
import { defaultLocale, isLocale, localePath } from "@/i18n/config";

// Shown when a page on the public site fails to render. The nav and footer stay, because the
// language layout wraps this boundary.
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useErrorText();
  const params = useParams<{ lang?: string }>();
  const locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const digest = errorDigest(error);

  useEffect(() => {
    // Only Vercel's logs for now; error tracking is a pending decision (SEC-268).
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-32">
      <div>
        <h1 className={`hero-focus max-w-xl ${pageHeading}`}>{t.heading}</h1>
        <p className="hero-rise mt-5 max-w-xl text-lg text-pretty" style={{ "--i": 1 } as CSSProperties}>
          {t.body}
        </p>
        <div
          className="hero-rise mt-9 flex flex-col gap-x-7 gap-y-2 sm:flex-row sm:items-center"
          style={{ "--i": 2 } as CSSProperties}
        >
          <button type="button" onClick={() => retry()} className={primaryButton}>
            {t.retry}
          </button>
          <Link href={localePath(locale, "/")} className={`${textLink} justify-center`}>
            {t.home}
          </Link>
        </div>
        {digest && (
          <p className="mt-8 text-sm text-muted">
            {t.reference} <span className="font-mono">{digest}</span>
          </p>
        )}
      </div>

      <NoSignalFrame cam="CAM ERR" status="SIGNAL LOST" label="NO SIGNAL" />
    </main>
  );
}
