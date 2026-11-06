// Shared class lists, so every call to action looks and responds the same way.
//
// Shape system: actions are pills, fields are 12px, cards are 20px, footage frames are 16px.
// The sheen, lift and bloom on the gold button live in globals.css under `.btn-gold`.

export const primaryButton =
  "btn-gold inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-center font-semibold text-ink";

export const compactButton =
  "btn-gold inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold whitespace-nowrap text-ink";

export const outlineButton =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.02] px-7 py-3 text-center font-semibold text-text transition duration-180 ease-out hover:border-gold/80 hover:bg-gold/[0.06] hover:text-gold";

export const textLink = "link-draw inline-flex min-h-11 items-center font-semibold text-text";

export const pageHeading =
  "text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl";

// Fields and the cards that hold them.
export const fieldClass =
  "mt-2 min-h-11 w-full rounded-field border border-white/20 bg-white/[0.03] px-3.5 py-2.5 text-base text-text transition-[border-color,background-color,box-shadow] duration-180 placeholder:text-muted hover:border-white/35 focus:border-gold focus:bg-white/[0.045] focus:shadow-[0_0_0_4px_rgba(207,162,58,0.14)] focus:outline-none";

export const cardClass = "surface spotlight rounded-card";
