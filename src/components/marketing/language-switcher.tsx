"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { localeCookie, localeInfo, localePath, locales, splitLocale, type Locale } from "@/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  /** "menu" opens a dropdown (nav, footer); "list" shows every language inline (mobile sheet). */
  variant?: "menu" | "list";
  /** Which way the dropdown opens. */
  placement?: "down" | "up";
  /** Shows only the globe until the screen is wide, where the nav is crowded. */
  compact?: boolean;
};

function remember(locale: Locale) {
  // A year, readable by the sign-in pages too, so the whole site follows the choice.
  document.cookie = `${localeCookie}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.4}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M2.75 10h14.5M10 2.75c2 2.1 3 4.5 3 7.25s-1 5.15-3 7.25c-2-2.1-3-4.5-3-7.25s1-5.15 3-7.25Z" />
    </svg>
  );
}

// Each option is a real link to the same page in that language, so it works without
// JavaScript and search engines can follow it.
export function LanguageSwitcher({ locale, label, variant = "menu", placement = "down", compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const { path } = splitLocale(pathname ?? "/");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    rootRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const options = locales.map((option) => {
    const info = localeInfo[option];
    const current = option === locale;
    return (
      <li key={option}>
        {/* A plain anchor: switching language changes <html lang> and dir, so it should be a
            full page load rather than a client-side transition. */}
        <a
          href={localePath(option, path)}
          hrefLang={info.tag}
          lang={info.tag}
          aria-current={current ? "true" : undefined}
          onClick={() => remember(option)}
          className={`flex min-h-11 items-center justify-between gap-6 rounded-lg px-3 text-[0.9375rem] transition-colors duration-180 hover:bg-white/[0.06] hover:text-text ${
            current ? "text-text" : ""
          }`}
        >
          {info.name}
          {current && (
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0 text-gold">
              <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </a>
      </li>
    );
  });

  if (variant === "list") {
    return (
      <nav aria-label={label}>
        <p className="flex items-center gap-2 text-sm font-semibold text-text">
          <GlobeIcon />
          {label}
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-x-2">{options}</ul>
      </nav>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm transition-colors duration-180 hover:bg-white/[0.06] hover:text-text"
      >
        <GlobeIcon />
        <span className="sr-only">{label}: </span>
        <span lang={localeInfo[locale].tag} className={compact ? "hidden xl:inline" : undefined}>
          {localeInfo[locale].name}
        </span>
        <svg aria-hidden="true" viewBox="0 0 12 12" className={`size-3 transition-transform duration-180 ${open ? "rotate-180" : ""}`}>
          <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={listId}
        hidden={!open}
        className={`absolute end-0 z-50 w-52 rounded-card border border-white/10 bg-panel-solid/95 p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md ${
          placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
        }`}
      >
        <ul aria-label={label}>{options}</ul>
      </div>
    </div>
  );
}
