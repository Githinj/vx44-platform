import type { CSSProperties } from "react";

type SectionHeadingProps = {
  id?: string;
  title: string;
  intro?: string;
};

export function SectionHeading({ id, title, intro }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} data-reveal="focus" className="display-tight text-4xl font-semibold text-balance sm:text-5xl">
        {title}
      </h2>
      {intro && (
        <p data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl">
          {intro}
        </p>
      )}
    </div>
  );
}
