import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" aria-label="VX44 AI Monitoring home" className="inline-flex items-baseline gap-2">
      <span className="font-display text-xl font-semibold tracking-tight text-text">
        VX<span className="font-bold text-gold">44</span>
      </span>
      <span className="font-mono text-[10px] tracking-[0.18em] text-muted">AI MONITORING</span>
    </Link>
  );
}
