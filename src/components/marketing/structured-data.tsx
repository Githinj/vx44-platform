import { placeholders } from "@/content/site";
import { brandName, siteUrl } from "@/content/seo";

// Placeholders such as [PHONE] stay out of the schema until real values replace them.
function confirmed(value: string) {
  return value && !value.startsWith("[") ? value : undefined;
}

export function organizationSchema() {
  const email = confirmed(placeholders.contactEmail);
  const telephone = confirmed(placeholders.phone);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    alternateName: "VX44",
    legalName: confirmed(placeholders.legalEntity),
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description:
      "AI monitoring for the cameras you already own. Detect, verify, respond and report on what happens at your site.",
    email,
    telephone,
    contactPoint:
      email || telephone
        ? { "@type": "ContactPoint", contactType: "sales", email, telephone }
        : undefined,
  };
}

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // Escaping < stops a value from closing the script tag (Next.js JSON-LD guide).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()).replace(/</g, "\\u003c") }}
    />
  );
}
