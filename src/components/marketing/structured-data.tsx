import { businessAddress, contact, placeholders, socialProfiles } from "@/content/site";
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
    // A square raster logo: Google wants one it can crawl, at least 112 px. Made by `npm run icons`.
    logo: `${siteUrl}/icon4.png`,
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
    // Filled from `socialProfiles` in src/content/site.ts once the company's profiles exist.
    sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
  };
}

// The site name Google shows above a result. It reads it from WebSite data on the home page: the
// short brand first, with the full name as an alternative.
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VX44",
    alternateName: [brandName],
    url: `${siteUrl}/`,
  };
}

// Escaping < stops a value from closing the script tag (Next.js JSON-LD guide).
function jsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// On the home page, in every language.
export function StructuredData() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema()) }} />
    </>
  );
}
