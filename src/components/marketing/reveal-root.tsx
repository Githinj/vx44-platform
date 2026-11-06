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
      if (reduced) {
        element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "backwards" });
        return;
      }
      const options = (duration: number, stagger: number): KeyframeAnimationOptions => ({
        duration,
        delay: index * stagger,
        easing: EASE,
        fill: "backwards",
      });

      switch (element.dataset.reveal) {
        // Step bars and rules draw from the left.
        case "bar":
          element.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], options(800, 160));
          return;
        // Headings pull focus, like a lens settling.
        case "focus":
          element.animate(
            [
              { opacity: 0, transform: "translateY(14px)", filter: "blur(10px)" },
              { opacity: 1, transform: "none", filter: "blur(0)" },
            ],
            options(900, 90),
          );
          return;
        // Monitors switch on: a bright line opens into the picture.
        case "monitor":
          element.animate(
            [
              { opacity: 0, transform: "scale(0.7, 0.01)", filter: "brightness(3)" },
              { opacity: 1, transform: "scale(1, 0.01)", filter: "brightness(2.5)", offset: 0.35 },
              { opacity: 1, transform: "none", filter: "brightness(1)" },
            ],
            { ...options(950, 180), easing: "cubic-bezier(0.7, 0, 0.2, 1)" },
          );
          return;
        // A viewfinder closes in on its subject.
        case "frame":
          element.animate(
            [
              { opacity: 0, transform: "scale(1.12)" },
              { opacity: 1, transform: "none" },
            ],
            options(1200, 0),
          );
          return;
        default:
          element.animate(
            [
              { opacity: 0, transform: "translateY(14px)" },
              { opacity: 1, transform: "none" },
            ],
            options(650, 80),
          );
      }
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
          // Only the endless loops are paused and resumed. play() on a finished entrance
          // would rewind it and replay the hero every time it scrolled back into view.
          if (animation.effect?.getComputedTiming().iterations !== Infinity) continue;
          if (entry.isIntersecting) {
            if (animation.playState === "paused") animation.play();
          } else animation.pause();
        }
      }
    });
    for (const element of document.querySelectorAll("[data-ambient]")) ambientObserver.observe(element);

    // Cards with `.spotlight` carry a soft light that follows the pointer.
    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const card = (event.target as Element | null)?.closest<HTMLElement>(".spotlight");
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    }
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      revealObserver.disconnect();
      ambientObserver.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, [pathname]);

  return null;
}
