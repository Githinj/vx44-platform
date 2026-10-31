import type { ReactNode } from "react";
import { LazyVideo } from "./lazy-video";

type FootageSlotProps = {
  camera: string;
  /** MP4 clip. Faces and number plates must be blurred, or the footage staged or consented. */
  src?: string;
  poster?: string;
  children?: ReactNode;
};

// A 16:9 footage frame with HUD overlays. Without `src` it renders a styled placeholder.
export function FootageSlot({ camera, src, poster, children }: FootageSlotProps) {
  return (
    <div
      data-ui
      className="footage-placeholder relative aspect-video w-full overflow-hidden border border-line"
    >
      {src ? (
        <LazyVideo src={src} poster={poster} />
      ) : (
        <p className="absolute bottom-[6%] left-[5%] font-mono text-[9px] tracking-[0.12em] text-muted sm:text-[11px]">
          FOOTAGE PLACEHOLDER
        </p>
      )}
      <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
      <p className="absolute left-[5%] top-[6%] font-mono text-[9px] tracking-[0.12em] text-text sm:text-[11px]">
        {camera}
      </p>
      <p className="absolute right-[5%] top-[6%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-text sm:text-[11px]">
        <span aria-hidden="true" className="rec-dot size-1.5 rounded-full bg-red" />
        LIVE
      </p>
      {children}
    </div>
  );
}

type DetectionBoxProps = {
  label: string;
  className: string;
};

export function DetectionBox({ label, className }: DetectionBoxProps) {
  return (
    <div className={`absolute border border-cyan bg-cyan/5 ${className}`}>
      <span className="absolute bottom-full left-[-1px] whitespace-nowrap bg-cyan px-1.5 py-0.5 font-mono text-[8px] font-medium tracking-[0.08em] text-ink sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}
