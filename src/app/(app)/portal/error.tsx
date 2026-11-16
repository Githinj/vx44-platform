"use client";

import Link from "next/link";
import { useEffect } from "react";
import { primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { errorDigest, useErrorText } from "@/components/error-text";

// Shown when a portal page fails to render. It sits inside the portal layout, so the client keeps
// the portal navigation, and its way out is the portal overview rather than the back office.
export default function PortalError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useErrorText();
  const digest = errorDigest(error);

  useEffect(() => {
    // Only Vercel's logs for now; error tracking is a pending decision (SEC-268).
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">{t.heading}</h1>
      <p className="mt-4">{t.body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={primaryButtonClass}>
          {t.retry}
        </button>
        <Link href="/portal" className={secondaryButtonClass}>
          {t.home}
        </Link>
      </div>
      {digest && (
        <p className="mt-8 text-sm text-muted">
          {t.reference} <span className="font-mono">{digest}</span>
        </p>
      )}
    </div>
  );
}
