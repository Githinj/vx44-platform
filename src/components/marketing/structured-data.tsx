import { businessAddress, contact, placeholders } from "@/content/site";
import { brandName, siteUrl } from "@/content/seo";

// Placeholders such as [LEGAL ENTITY NAME] stay out of the schema until real values replace them.
function confirmed(value: string) {
  return value && !value.startsWith("[") ? value : undefined;
}

export function organizationSchema() {
  const email = contact.email;
  // Schema.org expects the dialable form, e.g. +19179390403.
  const telephone = contact.phoneHref.replace(/^tel:/, "");
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
    address: {
      "@type": "PostalAddress",
      streetAddress: businessAddress.street,
      addressLocality: businessAddress.city,
      addressRegion: businessAddress.region,
      postalCode: businessAddress.postalCode,
      addressCountry: businessAddress.country,
    },
    contactPoint: { "@type": "ContactPoint", contactType: "sales", email, telephone },
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
