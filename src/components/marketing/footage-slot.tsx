import { type Detection, LazyVideo } from "./lazy-video";

type FootageSlotProps = {
  camera: string;
  /** MP4 clip. Faces and number plates must be blurred, or the footage staged or consented. */
  src: string;
  poster: string;
  detection?: Detection;
};

const hud = "font-mono text-[10px] tracking-[0.12em] text-text [text-shadow:0_0_4px_#05080f] sm:text-[11px]";

// A 16:9 footage frame with HUD overlays. Drop a real clip in by changing `src` and `poster`.
// See docs/footage-sources.md for each clip's licence.
export function FootageSlot({ camera, src, poster, detection }: FootageSlotProps) {
  return (
    <div data-ui className="relative aspect-video w-full overflow-hidden border border-line bg-footage">
      <LazyVideo src={src} poster={poster} detection={detection} />
      <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
      <p aria-hidden="true" className={`absolute top-[6%] left-[5%] ${hud}`}>
        {camera}
      </p>
      <p aria-hidden="true" className={`absolute top-[6%] right-[5%] flex items-center gap-1.5 ${hud}`}>
        <span className="rec-dot size-1.5 rounded-full bg-red" />
        LIVE
      </p>
      <p className="absolute bottom-[6%] left-[5%] bg-ink/75 px-1.5 py-0.5 text-[11px] text-text">
        Stock footage for illustration
      </p>
    </div>
  );
}
