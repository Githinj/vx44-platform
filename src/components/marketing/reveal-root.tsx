"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Mounts the page's motion (see reveal-effects.ts) after the page is up, and again after each
// client-side navigation. Its code is a separate download, so it stays out of the scripts the
// first screen waits for. If that download fails, the page just doesn't animate: content is
// visible without it.
export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    let stop: (() => void) | undefined;
    let left = false;
    import("./reveal-effects")
      .then(({ startReveal }) => {
        if (!left) stop = startReveal();
      })
      .catch(() => {});
    return () => {
      left = true;
      stop?.();
    };
  }, [pathname]);

  return null;
}
