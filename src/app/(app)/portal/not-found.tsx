import Link from "next/link";
import { secondaryButtonClass } from "@/components/admin/ui";
import { getAppText } from "@/i18n/app-text";

// The portal's 404. It renders inside the portal layout, so the client keeps the portal menu, and
// its way out is the overview rather than the back office.
export default async function PortalNotFound() {
  const { t } = await getAppText();
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">{t.notFound.heading}</h1>
      <p className="mt-4">{t.notFound.body}</p>
      <div className="mt-6">
        <Link href="/portal" className={secondaryButtonClass}>
          {t.portal.backToOverview}
        </Link>
      </div>
    </div>
  );
}
