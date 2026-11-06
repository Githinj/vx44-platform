import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { pageHeading } from "./styles";

type LegalPageProps = {
  title: string;
  children: ReactNode;
};

type HeadingProps = { id?: string; children?: ReactNode };

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// The legal text is passed in unchanged. Each top-level <h2> gets an anchor id, and the same
// headings form the contents list, which stays in view beside the text on wide screens.
export function LegalPage({ title, children }: LegalPageProps) {
  const sections: { id: string; label: string }[] = [];
  const body = Children.map(children, (child) => {
    if (!isValidElement<HeadingProps>(child) || child.type !== "h2") return child;
    const label = textOf(child.props.children);
    const id = child.props.id ?? slug(label);
    sections.push({ id, label });
    return cloneElement(child as ReactElement<HeadingProps>, { id });
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className={`hero-rise max-w-3xl ${pageHeading}`}>{title}</h1>
      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[14rem_1fr] lg:gap-16">
        {sections.length > 2 && (
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-sm font-semibold text-text">On this page</p>
              <ol className="mt-3 max-h-[calc(100dvh-9rem)] space-y-1 overflow-y-auto border-l border-line text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-muted transition-colors duration-180 hover:border-gold hover:text-text"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        )}
        <article className="max-w-[70ch] space-y-4 leading-relaxed lg:col-start-2 [&_a]:text-text [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-gold [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2:first-child]:mt-0 [&_strong]:text-text [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-muted">
          {body}
        </article>
      </div>
    </main>
  );
}
