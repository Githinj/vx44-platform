"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { bookingUrl } from "@/content/site";

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

export function CalendlyBooking({ prefill, className }: { prefill?: Prefill; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  function mount() {
    const container = containerRef.current;
    if (!container || !window.Calendly) return;
    // onReady runs again on every mount, so clear any calendar left from before.
    container.replaceChildren();
    window.Calendly.initInlineWidget({ url: embedUrl(prefill), parentElement: container });
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="h-[700px] bg-[#0b111d]" aria-label="Book a time" />
      {failed && (
        <p className="mt-4 text-sm">
          The calendar didn’t load.{" "}
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-4">
            Open the booking page
          </a>
          .
        </p>
      )}
      <Script
        id="calendly-widget"
        src="https://assets.calendly.com/assets/external/widget.js"
        // The calendar is the main content wherever it appears, so load it straight away.
        // lazyOnload waits for an idle moment, which can stall after the video-heavy homepage.
        strategy="afterInteractive"
        onReady={mount}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
