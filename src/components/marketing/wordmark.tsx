import Link from "next/link";

type WordmarkProps = {
  /**
   * Where it goes. Use `localePath(locale, "/")` for the home page, never "/": the proxy redirects
   * "/" to the visitor's language, and Next prefetches the link, so every page would pay for
   * that redirect (SEC-280 round 2, finding 12).
   */
  href: string;
  label?: string;
  /** Classes for the "AI MONITORING" tag, so a tight row can hide it below a width. */
  tagClassName?: string;
};

export function Wordmark({
  href,
  label = "VX44 AI Monitoring home",
  tagClassName = "max-[359px]:hidden",
}: WordmarkProps) {
  return (
    <Link href={href} aria-label={label} dir="ltr" className="flex min-h-11 shrink-0 items-center whitespace-nowrap">
      <span className="inline-flex items-baseline gap-2">
        <span className="font-display text-xl font-semibold tracking-tight text-text">
          VX<span className="font-bold text-gold">44</span>
        </span>
        {/* The space doesn't render between flex items, but it keeps the link's text as
            "VX44 AI MONITORING", so it matches the start of its aria-label (WCAG 2.5.3). */}{" "}
        <span className={`font-mono text-[10px] tracking-[0.18em] text-muted ${tagClassName}`}>AI MONITORING</span>
      </span>
    </Link>
  );
}
