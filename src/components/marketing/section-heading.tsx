type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

export function SectionHeading({ eyebrow, title, intro }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[13px] tracking-[0.14em] text-gold">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lg text-pretty">{intro}</p>}
    </div>
  );
}
