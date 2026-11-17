import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import { type Detection, LazyVideo } from "./lazy-video";

// Posters go through the image optimiser: a 1080 px WebP of about 28 KB instead of the 60 KB
// JPEG for the hero (SEC-277), still sharp across the content column's full 1104 px. A poster
// can't take a srcset, so every screen gets this one size. getImageProps runs on the server
// here and adds no client script.
//
// The poster stays on the <video> rather than becoming a separate <img>: Chrome would then count
// the clip's first frame, a fraction of a pixel larger, as a later Largest Contentful Paint.
function optimisedPoster(src: string) {
  const { srcSet } = getImageProps({ src, alt: "", width: 1080, height: 608 }).props;
  // The first candidate is the 1x one, at exactly the requested width.
  return srcSet?.split(" ")[0] ?? src;
}

type FootageSlotProps = {
  camera: string;
  /** MP4 clip. Faces and number plates must be blurred, or the footage staged or consented. */
  src: string;
  poster: string;
  detection?: Detection;
  /** The translated "Stock footage for illustration" disclosure. */
  disclosure: string;
  /** Set on the above-the-fold slot only: fetches its poster first and plays the signal boot. */
  priority?: boolean;
  /** Below the fold: the frame switches on like a monitor as it scrolls in. */
  reveal?: boolean;
  /** Stagger position for the reveal. */
  index?: number;
  className?: string;
};

const hud = "font-mono text-[10px] tracking-[0.12em] text-text [text-shadow:0_0_4px_#05080f] sm:text-[11px]";

// A 16:9 footage frame with HUD overlays. Drop a real clip in by changing `src` and `poster`.
// See docs/footage-sources.md for each clip's licence.
//
// The frame is always left to right: the HUD is the camera's own print-out, and the detection
// box positions are measured from the left of the picture.
export function FootageSlot({
  camera,
  src,
  poster,
  detection,
  disclosure,
  priority,
  reveal,
  index = 0,
  className = "",
}: FootageSlotProps) {
  // The hero HUD prints in after the boot sweep; elsewhere it is simply there.
  const hudIn = priority ? "hud-in" : "";
  const still = optimisedPoster(poster);
  return (
    <div
      data-ui
      dir="ltr"
      data-reveal={reveal ? "monitor" : undefined}
      style={reveal ? ({ "--i": index } as CSSProperties) : undefined}
      className={`relative aspect-video w-full overflow-hidden rounded-frame border border-line bg-footage ${className}`}
    >
      {/* The hero poster is usually the largest thing on screen, so it should not queue behind
          scripts and the other posters. A <link> element, which React hoists into the HTML's
          <head>: the imperative preload() it replaces only travelled in the page's script data,
          applied once React's client code ran, so the browser found the poster late (SEC-277). */}
      {priority && <link rel="preload" as="image" href={still} fetchPriority="high" />}
      <LazyVideo src={src} poster={still} detection={detection} priority={priority} />
      <div aria-hidden="true" className="footage-glass pointer-events-none absolute inset-0 rounded-[inherit]" />
      {priority && <div aria-hidden="true" className="boot-sweep" />}
      <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
      <p aria-hidden="true" className={`absolute top-[6%] left-[5%] ${hud} ${hudIn}`}>
        {camera}
      </p>
      <p
        aria-hidden="true"
        style={{ "--i": 1 } as CSSProperties}
        className={`absolute top-[6%] right-[5%] flex items-center gap-1.5 ${hud} ${hudIn}`}
      >
        <span className="rec-dot size-1.5 rounded-full bg-red" />
        LIVE
      </p>
      <p className="absolute bottom-[6%] left-[5%] rounded-md bg-ink/75 px-2 py-0.5 text-[11px] text-text">
        {disclosure}
      </p>
    </div>
  );
}
