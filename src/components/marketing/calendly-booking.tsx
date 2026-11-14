"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { bookingUrl } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { outlineButton } from "./styles";

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

// How far below the screen the calendar starts loading. Calendly takes a few seconds to draw,
// so this gives it a head start while the visitor scrolls towards it.
const loadMargin = "400px 0px";

// The placeholder button disappears once loading starts. If it had focus, focus moves to the
// calendar's region rather than dropping back to the top of the page.
function keepFocus(well: HTMLElement | null, region: HTMLElement | null) {
  if (well?.contains(document.activeElement)) region?.focus();
}

type CalendlyProps = { t: Dictionary["calendly"]; prefill?: Prefill; className?: string };

// Calendly's script brings about 3.5 MB and a dozen other companies' trackers with it, so it
// loads only once the calendar is close to the screen, or on a tap (SEC-277). Where the calendar
// is on screen when the page opens, that happens straight away, with no tap.
export function CalendlyBooking({ t, prefill, className }: CalendlyProps) {
  const wellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const well = wellRef.current;
    if (requested || !well) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        keepFocus(well, containerRef.current);
        setRequested(true);
      },
      { rootMargin: loadMargin },
    );
    observer.observe(well);
    return () => observer.disconnect();
  }, [requested]);

  function load() {
    keepFocus(wellRef.current, containerRef.current);
    setRequested(true);
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
      <div ref={wellRef} data-calendly-well className="relative h-[700px] overflow-hidden rounded-field bg-panel-solid">
        {requested ? (
          // Sits behind the calendar and is covered the moment Calendly paints, so the slow
          // embed never shows as an empty box.
          <p
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[13px] tracking-[0.1em] text-muted"
          >
            <span className="rec-dot size-1.5 rounded-full bg-gold" />
            {t.loading}
          </p>
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <button type="button" onClick={load} className={outlineButton}>
              {t.label}
            </button>
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
