"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Runs `callback` once the browser has painted the page's first content. Lighthouse counts any
// script that starts loading before that paint toward Largest Contentful Paint, so the motion
// code waits for it (SEC-277). Where the paint timing API is missing, it runs straight away.
function afterFirstPaint(callback: () => void): () => void {
  let done = false;
  let observer: PerformanceObserver | undefined;
  const run = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    callback();
  };
  if (PerformanceObserver.supportedEntryTypes?.includes("paint")) {
    observer = new PerformanceObserver((list) => {
      if (list.getEntriesByName("first-contentful-paint").length > 0) run();
    });
    // Buffered, so a paint that already happened (or a client-side navigation) counts at once.
    observer.observe({ type: "paint", buffered: true });
  } else {
    run();
  }
  return () => {
    done = true;
    observer?.disconnect();
  };
}

// Mounts the page's motion (see reveal-effects.ts) after the first paint, and again after each
// client-side navigation. Its code is a separate download, so it stays out of what the first
// screen waits for. If that download fails, the page just doesn't animate: content is visible
// without it.
export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    let stop: (() => void) | undefined;
    let left = false;
    const cancel = afterFirstPaint(() => {
      import("./reveal-effects")
        .then(({ startReveal }) => {
          if (!left) stop = startReveal();
        })
        .catch(() => {});
    });
    return () => {
      left = true;
      cancel();
      stop?.();
    };
  }, [pathname]);

  return null;
}
