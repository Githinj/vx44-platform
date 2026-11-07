import Link from "next/link";

export function Wordmark({ href = "/", label = "VX44 AI Monitoring home" }: { href?: string; label?: string }) {
  return (
    <Link href={href} aria-label={label} dir="ltr" className="flex min-h-11 shrink-0 items-center whitespace-nowrap">
      <span className="inline-flex items-baseline gap-2">
        <span className="font-display text-xl font-semibold tracking-tight text-text">
          VX<span className="font-bold text-gold">44</span>
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted max-[359px]:hidden">AI MONITORING</span>
      </span>
    </Link>
  );
}
