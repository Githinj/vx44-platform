"use client";

import { type ReactNode, useEffect, useState } from "react";

// At the top of the page the bar sits flat on the night ground. Once content scrolls beneath
// it, the bar lifts into a soft floating capsule with a light backdrop blur.
export function NavShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header data-scrolled={scrolled || undefined} className="group sticky top-0 z-40">
      {/* Both layers are siblings of the content: backdrop-filter on the header itself would
          become the containing block for the fixed mobile menu sheet and squash it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink transition-opacity duration-300 group-data-scrolled:opacity-0"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-2 inset-y-1.5 mx-auto max-w-6xl -translate-y-1 scale-[0.985] rounded-2xl border border-white/10 bg-ink/80 opacity-0 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md transition duration-300 ease-calm group-data-scrolled:translate-y-0 group-data-scrolled:scale-100 group-data-scrolled:opacity-100 sm:inset-x-3"
      />
      <div className="relative">{children}</div>
    </header>
  );
}
