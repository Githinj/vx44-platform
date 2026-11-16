"use client";

import Script from "next/script";
import { useId, useRef, useState } from "react";
import { bookingUrl } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { primaryButton } from "./styles";

type Prefill = { name?: string; email?: string };

type CalendlyApi = {
  initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

// Calendly only applies these brand colours on paid plans; other plans ignore them.
// The widget script ignores its `prefill` option, so name and email go in the URL, which
// Calendly reads to fill in the booking form.
function embedUrl(prefill?: Prefill) {
  const params: Record<string, string> = {
    background_color: "0b111d",
    text_color: "eef2f8",
    primary_color: "cfa23a",
  };
  if (prefill?.name) params.name = prefill.name;
  if (prefill?.email) params.email = prefill.email;
  // encodeURIComponent writes spaces as %20. URLSearchParams writes "+", which Calendly's
  // script keeps as a literal plus, so "Jane Doe" would show as "Jane+Doe".
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${bookingUrl}?${query}`;
}

type CalendlyProps = {
  t: Dictionary["calendly"];
  prefill?: Prefill;
  className?: string;
  // Right after the lead form is sent: the visitor has just asked to book, so no tap is needed.
  loadAtOnce?: boolean;
};

// Calendly's script brings about 3.5 MB and a dozen other companies' trackers with it, so
// nothing from Calendly loads until the visitor taps "Pick a time" (SEC-277), and the tap opens
// the calendar straight away. The one exception is the confirmation after the lead form is sent.
export function CalendlyBooking({ t, prefill, className, loadAtOnce = false }: CalendlyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [requested, setRequested] = useState(loadAtOnce);
  const [failed, setFailed] = useState(false);

  function load() {
    setRequested(true);
    // The button disappears, so focus moves to the calendar's region rather than dropping back
    // to the top of the page. The calendar opens where the button was, so nothing scrolls.
    containerRef.current?.focus({ preventScroll: true });
  }

  function mount() {
    const container = containerRef.current;
    if (!container || !window.Calendly) return;
    // onReady runs again on every mount, so clear any calendar left from before.
    container.replaceChildren();
    window.Calendly.initInlineWidget({ url: embedUrl(prefill), parentElement: container });
  }

  return (
    <div className={className}>
      <div data-calendly-well className="relative h-[700px] overflow-hidden rounded-field bg-panel-solid">
        {requested ? (
          // Sits behind the calendar and is covered the moment Calendly paints, so the slow
          // embed never shows as an empty box. It takes the button's place.
          <p
            aria-hidden="true"
            className="absolute inset-x-0 top-12 flex min-h-12 items-center justify-center gap-2 font-mono text-[13px] tracking-[0.1em] text-muted"
          >
            <span className="rec-dot size-1.5 rounded-full bg-gold" />
            {t.loading}
          </p>
        ) : (
          // Fills the same box as the calendar, so nothing on the page moves when it opens. The
          // button sits near the top, so on a phone it shows as soon as the box does. The line
          // under it says what the tap opens, so the box doesn't read as empty (SEC-280).
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-start gap-4 px-6 pt-12 text-center">
            <button type="button" onClick={load} aria-describedby={hintId} className={primaryButton}>
              {t.open}
            </button>
            <p id={hintId} className="max-w-xs text-sm text-pretty">
              {t.openHint}
            </p>
          </div>
        )}
        <div ref={containerRef} role="region" tabIndex={-1} aria-label={t.label} className="relative h-full outline-none" />
      </div>
      {failed && (
        <p className="mt-4 text-sm">
          {t.failed}{" "}
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-4">
            {t.openPage}
          </a>
          .
        </p>
      )}
      {requested && (
        <Script
          id="calendly-widget"
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
          onReady={mount}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
