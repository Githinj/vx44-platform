"use client";

import { useState } from "react";
import { secondaryButtonClass } from "@/components/admin/ui";

type KeyText = { cantScan: string; openInApp: string; copyKey: string; keyCopied: string };

// Two-step setup on the phone that shows the QR code (SEC-280 round 2): a phone can't scan its
// own screen. The otpauth:// link opens the authenticator app with the key filled in, and the
// key can be copied instead of typed. Shared by the back office and the client portal.
export function AuthenticatorKey({ secret, uri, t }: { secret: string; uri?: string; t: KeyText }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      // No clipboard (an old browser, or a page that isn't secure): the key is still on screen.
      setCopied(false);
    }
  }

  return (
    <>
      {uri && (
        <a href={uri} className={`${secondaryButtonClass} mt-4 min-h-11 w-full`}>
          {t.openInApp}
        </a>
      )}
      <p className="mt-4 text-sm">{t.cantScan}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <code className="min-w-0 font-mono text-sm break-all text-text">{secret}</code>
        <button type="button" onClick={copy} className={`${secondaryButtonClass} min-h-11`}>
          {t.copyKey}
        </button>
      </div>
      <p role="status" className="mt-1 min-h-5 text-sm text-muted">
        {copied ? t.keyCopied : ""}
      </p>
    </>
  );
}
