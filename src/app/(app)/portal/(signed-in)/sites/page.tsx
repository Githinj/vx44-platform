import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading, PageTitle, Panel, primaryButtonClass } from "@/components/admin/ui";
import { Detail, type HeadingLevel, NoOrganization, OrgGroups, SiteStatus } from "@/components/portal/ui";
import type { AppDictionary } from "@/i18n/app/en";
import { getAppText } from "@/i18n/app-text";
import { groupByOrg, httpsLink, labelFor } from "@/lib/portal/logic";
import { type PortalSite, loadOrganizations, loadSites } from "@/lib/portal/queries";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.sites };
}

function address(site: PortalSite) {
  return [site.address, site.city, site.state, site.country].filter(Boolean).join(", ");
}

function SiteCard({ site, t, heading: Heading }: { site: PortalSite; t: AppDictionary; heading: HeadingLevel }) {
  const p = t.portal;
  // Only a full https:// link is shown: the address is typed in by an admin.
  const cameraLink = httpsLink(site.camera_access_url);
  return (
    <Panel>
      <Heading className="font-semibold text-text">{site.name}</Heading>
      <dl className="mt-3 text-sm">
        {address(site) && <Detail term={p.address}>{address(site)}</Detail>}
        <Detail term={p.cameras}>
          <span className="tabular-nums">{site.camera_count}</span>
        </Detail>
        <Detail term={p.status}>
          <SiteStatus status={site.status} label={labelFor(t.status.site, site.status)} />
        </Detail>
        {site.monitoring_hours && <Detail term={p.monitoringHours}>{site.monitoring_hours}</Detail>}
      </dl>
      {cameraLink && (
        <a href={cameraLink} target="_blank" rel="noopener noreferrer" className={`mt-4 ${primaryButtonClass}`}>
          {p.viewCameras}
          <span className="sr-only"> {p.opensInNewTab}</span>
        </a>
      )}
    </Panel>
  );
}

async function Sites() {
  const [{ t }, organizations, sites] = await Promise.all([getAppText(), loadOrganizations(), loadSites()]);
  if (organizations.length === 0) return <NoOrganization text={t.portal.noOrganization} />;

  return (
    <OrgGroups
      groups={groupByOrg(organizations, sites)}
      render={(items, heading) =>
        items.length === 0 ? (
          <p className="text-sm">{t.portal.noSites}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((site) => (
              <li key={site.id}>
                <SiteCard site={site} t={t} heading={heading} />
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}

export default async function SitesPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.sites}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <Sites />
      </Suspense>
    </>
  );
}
