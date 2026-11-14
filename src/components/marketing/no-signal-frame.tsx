import type { CSSProperties } from "react";

const hud = "font-mono text-[10px] tracking-[0.12em] text-text sm:text-[11px]";

// A camera frame with no feed: the site's HUD language for "nothing to show here". Used by the
// 404 and error pages. Plain markup with no server imports, so Client Components can use it too.
export function NoSignalFrame({ cam, status, label }: { cam: string; status: string; label: string }) {
  return (
    <div
      data-ambient
      dir="ltr"
      className="hero-rise relative aspect-video w-full overflow-hidden rounded-frame border border-line bg-footage"
      style={{ "--i": 3 } as CSSProperties}
    >
      <div aria-hidden="true" className="no-signal absolute inset-0" />
      <div aria-hidden="true" className="footage-glass absolute inset-0" />
      <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
      <p aria-hidden="true" className={`absolute top-[6%] left-[5%] ${hud}`}>
        {cam}
      </p>
      <p aria-hidden="true" className={`absolute top-[6%] right-[5%] flex items-center gap-1.5 ${hud}`}>
        <span className="size-1.5 rounded-full bg-muted" />
        {status}
      </p>
      <p className="absolute inset-0 flex items-center justify-center font-mono text-sm tracking-[0.3em] text-muted">
        {label}
      </p>
    </div>
  );
}
