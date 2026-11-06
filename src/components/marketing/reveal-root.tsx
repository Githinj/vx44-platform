"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// One observer for the whole page. Elements opt in with `data-reveal` (animated once, as they
// enter) or `data-ambient` (looping background animations, paused while off screen).
//
// Everything runs through the Web Animations API, so no attribute or class on a
// server-rendered element ever changes. Content stays visible if this script never runs,
// and React never sees a hydration mismatch.
export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function play(element: HTMLElement) {
      const index = Number(element.style.getPropertyValue("--i")) || 0;
      if (element.dataset.reveal === "bar") {
        element.animate(
          reduced
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
          { duration: reduced ? 300 : 700, delay: reduced ? 0 : index * 160, easing: EASE, fill: "backwards" },
        );
        return;
      }
      element.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: reduced ? 300 : 600, delay: reduced ? 0 : index * 80, easing: EASE, fill: "backwards" },
      );
    }

    // Elements on screen at load are left alone. Only what scrolls in later animates, and
    // it starts the moment its top edge enters, so it is never seen before it fades.
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        play(entry.target as HTMLElement);
        revealObserver.unobserve(entry.target);
      }
    });
    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      const box = element.getBoundingClientRect();
      if (box.top >= window.innerHeight) revealObserver.observe(element);
    }

    const ambientObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        for (const animation of (entry.target as HTMLElement).getAnimations({ subtree: true })) {
          if (entry.isIntersecting) animation.play();
          else animation.pause();
        }
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
