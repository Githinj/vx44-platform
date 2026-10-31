import { type Detection, LazyVideo } from "./lazy-video";

type FootageSlotProps = {
  camera: string;
  /** MP4 clip. Faces and number plates must be blurred, or the footage staged or consented. */
  src: string;
  poster: string;
  detection?: Detection;
};

// A 16:9 footage frame with HUD overlays. See docs/footage-sources.md for each clip's licence.
export function FootageSlot({ camera, src, poster, detection }: FootageSlotProps) {
  return (
    <div
      data-ui
      className="relative aspect-video w-full overflow-hidden border border-line bg-[#0d1421]"
    >
      <LazyVideo src={src} poster={poster} detection={detection} />
      <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
      <p className="absolute left-[5%] top-[6%] font-mono text-[9px] tracking-[0.12em] text-text [text-shadow:0_0_4px_#05080f] sm:text-[11px]">
        {camera}
      </p>
      <p className="absolute right-[5%] top-[6%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-text [text-shadow:0_0_4px_#05080f] sm:text-[11px]">
        <span aria-hidden="true" className="rec-dot size-1.5 rounded-full bg-red" />
        LIVE
      </p>
      <p className="absolute bottom-[6%] left-[5%] bg-ink/70 px-1 font-sans text-[9px] text-text sm:text-[11px]">
        Stock footage for illustration
      </p>
    </div>
  );
}
