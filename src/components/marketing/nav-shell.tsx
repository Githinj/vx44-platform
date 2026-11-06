"use client";

import { type ReactNode, useEffect, useState } from "react";

// The sticky bar gains a hairline and a light backdrop once content scrolls beneath it.
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
      {/* The blur sits on its own layer: backdrop-filter on the header itself would become the
          containing block for the fixed mobile menu sheet and squash it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 border-b border-transparent bg-ink transition-colors duration-300 group-data-scrolled:border-line group-data-scrolled:bg-ink/85 group-data-scrolled:backdrop-blur-md"
      />
      <div className="relative">{children}</div>
    </header>
  );
}
