export function SkipLink({ label, target = "content" }: { label: string; target?: string }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-3 focus:font-semibold focus:text-ink"
    >
      {label}
    </a>
  );
}
