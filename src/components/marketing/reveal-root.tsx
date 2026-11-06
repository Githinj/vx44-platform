"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// One observer for the whole page. Elements opt in with `data-reveal` (shown once, as they
// enter) or `data-ambient` (a looping background that pauses while off screen).
export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])"));

    // Anything already on screen stays as it is, so nothing visible blinks out on load.
    for (const element of reveals) {
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) element.dataset.shown = "";
    }
    root.classList.add("reveal-on");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const element of reveals) {
      if (!("shown" in element.dataset)) revealObserver.observe(element);
    }

    const ambientObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) element.dataset.inview = "";
        else delete element.dataset.inview;
      }
    });
    for (const element of document.querySelectorAll("[data-ambient]")) ambientObserver.observe(element);

    return () => {
      revealObserver.disconnect();
      ambientObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
