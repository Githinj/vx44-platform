import Link from "next/link";
import type { CSSProperties } from "react";
import { pageHeading, primaryButton, textLink } from "@/components/marketing/styles";
import { localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const hud = "font-mono text-[10px] tracking-[0.12em] text-text sm:text-[11px]";

// The "no signal" 404 view, shared by the not-found boundary and the 404 route the proxy uses.
export async function NotFoundView({ locale }: { locale: Locale }) {
  const t = await getDictionary(locale);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-32">
      <div>
        <h1 className={`hero-focus max-w-xl ${pageHeading}`}>{t.notFound.heading}</h1>
        <p className="hero-rise mt-5 max-w-xl text-lg text-pretty" style={{ "--i": 1 } as CSSProperties}>
          {t.notFound.body}
        </p>
        <div
          className="hero-rise mt-9 flex flex-col gap-x-7 gap-y-2 sm:flex-row sm:items-center"
          style={{ "--i": 2 } as CSSProperties}
        >
          <Link href={localePath(locale, "/")} className={primaryButton}>
            {t.notFound.home}
          </Link>
          <Link href={localePath(locale, "/demo")} className={`${textLink} justify-center`}>
            {t.common.bookDemo}
          </Link>
        </div>
      </div>

      {/* A camera frame with no feed: the site's HUD language, saying "nothing here". */}
      <div
        data-ambient
        dir="ltr"
        className="hero-rise relative aspect-video w-full overflow-hidden rounded-frame border border-line bg-footage"
        style={{ "--i": 3 } as CSSProperties}
      >
        <div aria-hidden="true" className="no-signal absolute inset-0" />
        <div aria-hidden="true" className="footage-glass absolute inset-0" />
        <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
        <p aria-hidden="true" className={`absolute top-[6%] left-[5%] ${hud}`}>
          CAM 404
        </p>
        <p aria-hidden="true" className={`absolute top-[6%] right-[5%] flex items-center gap-1.5 ${hud}`}>
          <span className="size-1.5 rounded-full bg-muted" />
          OFFLINE
        </p>
        <p className="absolute inset-0 flex items-center justify-center font-mono text-sm tracking-[0.3em] text-muted">
          404 · NO SIGNAL
        </p>
      </div>
    </main>
  );
}
