import type { CSSProperties } from "react";

type SectionHeadingProps = {
  id?: string;
  title: string;
  intro?: string;
};

export function SectionHeading({ id, title, intro }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <h2
        id={id}
        data-reveal="focus"
        className="text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
      >
        {title}
      </h2>
      {intro && (
        <p data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-5 text-lg text-pretty">
          {intro}
        </p>
      )}
    </div>
  );
}
