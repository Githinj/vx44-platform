import type { CSSProperties } from "react";
import { type Detection, LazyVideo } from "./lazy-video";

type FootageSlotProps = {
  camera: string;
  /** MP4 clip. Faces and number plates must be blurred, or the footage staged or consented. */
  src: string;
  poster: string;
  detection?: Detection;
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
export function FootageSlot({
  camera,
  src,
  poster,
  detection,
  priority,
  reveal,
  index = 0,
  className = "",
}: FootageSlotProps) {
  // The hero HUD prints in after the boot sweep; elsewhere it is simply there.
  const hudIn = priority ? "hud-in" : "";
  return (
    <div
      data-ui
      data-reveal={reveal ? "monitor" : undefined}
      style={reveal ? ({ "--i": index } as CSSProperties) : undefined}
      className={`relative aspect-video w-full overflow-hidden rounded-frame border border-line bg-footage ${className}`}
    >
      <LazyVideo src={src} poster={poster} detection={detection} priority={priority} />
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
        Stock footage for illustration
      </p>
    </div>
  );
}
