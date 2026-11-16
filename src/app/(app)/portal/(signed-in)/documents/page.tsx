import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading, PageTitle, formatDate } from "@/components/admin/ui";
import { NoOrganization, OrgGroups } from "@/components/portal/ui";
import { getAppText } from "@/i18n/app-text";
import { fill } from "@/i18n/format";
import { groupByOrg } from "@/lib/portal/logic";
import { loadDocuments, loadOrganizations } from "@/lib/portal/queries";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.documents };
}

async function Documents() {
  const [{ t, format }, organizations, documents] = await Promise.all([
    getAppText(),
    loadOrganizations(),
    loadDocuments(),
  ]);
  const p = t.portal;
  if (organizations.length === 0) return <NoOrganization text={p.noOrganization} />;

  return (
    <OrgGroups
      groups={groupByOrg(organizations, documents)}
      render={(items) =>
        items.length === 0 ? (
          <p className="text-sm">{p.noDocuments}</p>
        ) : (
          <ul className="text-sm">
            {items.map((document) => (
              <li key={document.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line py-3">
                <div>
                  <p className="text-text">{document.title}</p>
                  <p className="text-muted">{fill(p.added, { date: formatDate(document.created_at, format) })}</p>
                </div>
                {/* A route, not a page: it checks access and redirects to a short-lived file link. */}
                <a href={`/portal/documents/${document.id}`} className="font-semibold underline underline-offset-4 hover:text-gold">
                  {p.download}
                  <span className="sr-only">: {document.title}</span>
                </a>
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}

export default async function DocumentsPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.documents}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Documents />
      </Suspense>
    </>
  );
}
