import type { Metadata } from "next";
import Link from "next/link";
import { EmailLink, PhoneLink } from "@/components/marketing/contact-links";
import { LegalPage } from "@/components/marketing/legal-page";
import { placeholders } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply to using the VX44 AI Monitoring website.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        These terms apply to your use of vx44ai.com, operated by {placeholders.legalEntity}
        {" "}(&quot;VX44&quot;, &quot;we&quot;). Monitoring services are provided under a separate
        written agreement, which takes priority over these terms if the two conflict.
      </p>

      <h2>Using this website</h2>
      <p>
        You agree to give accurate information when you contact us, and not to misuse the site,
        interfere with how it runs, or try to access areas you aren&apos;t authorized to use.
      </p>

      <h2>Information on this site</h2>
      <p>
        We describe our service in general terms here. Availability, compatibility and pricing are
        confirmed for your site before you sign up. Example images and alerts on this site are
        illustrative.
      </p>

      <h2>Not an emergency service</h2>
      <p>
        VX44 doesn&apos;t replace emergency services. In an emergency, call your local emergency
        number.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The content, branding and design of this site belong to us or our licensors. You may not
        reuse them without our written permission.
      </p>

      <h2>Disclaimer and liability</h2>
      <p>
        This site is provided &quot;as is&quot;. To the extent the law allows, we disclaim implied
        warranties and aren&apos;t liable for indirect or consequential losses arising from your use
        of the site.
      </p>

      <h2>Privacy</h2>
      <p>
        Our{" "}
        <Link href="/privacy" className="text-text underline underline-offset-4">
          privacy policy
        </Link>{" "}
        explains how we handle personal information.
      </p>

      <h2>Changes and governing law</h2>
      <p>
        We may update these terms by posting a new version here. These terms are governed by the
        laws of {placeholders.governingLaw}.
      </p>

      <h2>Contact</h2>
      <p>
        {placeholders.legalEntity}
        <br />
        <EmailLink />
        <br />
        <PhoneLink />
      </p>
    </LegalPage>
  );
}
