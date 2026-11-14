import type { ReactNode } from "react";

// Shared pieces for the client portal. The portal uses the back office's quieter scale (8px
// controls, 12px panels) from src/components/admin/ui.tsx.

export function NoOrganization({ text }: { text: string }) {
  return <p className="mt-6 max-w-prose text-sm">{text}</p>;
}

export type HeadingLevel = "h2" | "h3";

/**
 * Sections for each of the client's organizations. A client normally has one, so its name is only
 * shown as a heading when there are several. `render` gets the heading level its cards should use,
 * so the outline never skips a level.
 */
export function OrgGroups<T>({
  groups,
  render,
}: {
  groups: { organization: { id: string; name: string }; items: T[] }[];
  render: (items: T[], heading: HeadingLevel) => ReactNode;
}) {
  if (groups.length === 1) return <div className="mt-6">{render(groups[0].items, "h2")}</div>;
  return groups.map(({ organization, items }) => (
    <section key={organization.id} aria-labelledby={`org-${organization.id}`} className="mt-8">
      <h2 id={`org-${organization.id}`} className="text-lg font-semibold">
        {organization.name}
      </h2>
      <div className="mt-3">{render(items, "h3")}</div>
    </section>
  ));
}

const dotColour: Record<string, string> = {
  online: "bg-green",
  offline: "bg-red",
};

/** A site's last recorded status: green for online, red for offline, grey otherwise. */
export function SiteStatus({ status, label }: { status: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={`size-1.5 rounded-full ${dotColour[status] ?? "bg-muted"}`} />
      {label}
    </span>
  );
}

/** A term and its value, one row of a description list. */
export function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-line py-2">
      <dt className="text-muted">{term}</dt>
      <dd className="text-text">{children}</dd>
    </div>
  );
}
