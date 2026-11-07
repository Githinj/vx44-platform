"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import { outlineButton, primaryButton } from "./styles";

type NavLink = { href: string; label: string };
type MenuLabels = {
  open: string;
  close: string;
  main: string;
  language: string;
  checkCameras: string;
  bookDemo: string;
};

// The section links are hidden below the md breakpoint, so phones reach them through this
// full-height sheet. While it is open, page scroll is locked and focus stays inside.
export function MobileMenu({ locale, links, labels }: { locale: Locale; links: NavLink[]; labels: MenuLabels }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>("a")?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !sheet || !buttonRef.current) return;

      // The toggle button and the sheet's links form one loop.
      const focusable = [buttonRef.current, ...sheet.querySelectorAll<HTMLElement>("a")];
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? index - 1 : index + 1;
      if (index === -1 || next < 0 || next >= focusable.length) {
        event.preventDefault();
        focusable[event.shiftKey ? focusable.length - 1 : 0].focus();
      }
    }
    // Close when the screen grows past md, where the desktop links take over.
    const desktop = window.matchMedia("(min-width: 48rem)");
    function onResize() {
      if (desktop.matches) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-full text-text transition-colors duration-180 hover:bg-white/[0.06]"
      >
        <span className="sr-only">{open ? labels.close : labels.open}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
          {open ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" d="M4 8h16M4 16h16" />
          )}
        </svg>
      </button>
      <div
        ref={sheetRef}
        id="mobile-menu"
        data-open={open || undefined}
        inert={!open}
        className="menu-sheet invisible fixed inset-x-0 top-16 bottom-0 flex -translate-y-2 flex-col overflow-y-auto border-t border-line bg-ink opacity-0 data-open:visible data-open:translate-y-0 data-open:opacity-100"
      >
        <nav aria-label={labels.main} className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex min-h-14 items-center border-b border-line font-display text-2xl font-semibold tracking-[-0.02em] text-text transition-colors duration-180 hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 sm:px-6">
          <LanguageSwitcher locale={locale} label={labels.language} variant="list" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl gap-3 px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
          <Link href={localePath(locale, "/check")} onClick={close} className={outlineButton}>
            {labels.checkCameras}
          </Link>
          <Link href={localePath(locale, "/demo")} onClick={close} className={primaryButton}>
            {labels.bookDemo}
          </Link>
        </div>
      </div>
    </div>
  );
}
