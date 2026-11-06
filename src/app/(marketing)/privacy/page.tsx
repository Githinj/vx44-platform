import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { placeholders } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What VX44 AI Monitoring collects, why, and how it's handled.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        This policy explains how {placeholders.legalEntity} (&quot;VX44&quot;, &quot;we&quot;)
        handles personal information when you use vx44ai.com and our monitoring service.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Demo requests:</strong> your name, business, email, phone, city, state, approximate
          camera count, DVR brand, whether you know your DVR admin password, and your message. We
          don&apos;t ask for the password itself.
        </li>
        <li>
          <strong>Client accounts:</strong> contact and billing details, site addresses, camera
          counts and service status.
        </li>
        <li>
          <strong>Video footage:</strong> for clients, footage from the cameras connected to the
          service.
        </li>
        <li>
          <strong>Technical data:</strong> your IP address, used for bot protection and to limit
          repeat form submissions. We keep only a scrambled (hashed) form of it for rate limiting,
          and delete that within about a day.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use this information to respond to your request, check system compatibility, provide
        and support the service, send service messages, and protect our site from abuse. We
        don&apos;t sell your personal information.
      </p>

      <h2>Sub-processors</h2>
      <p>
        Video footage is stored by a trusted cloud video storage provider acting as our
        sub-processor. We don&apos;t run our own data centres. We also use service providers for
        website hosting, database hosting, email delivery and bot protection. They handle data on
        our behalf, only as needed to provide those services.
      </p>

      <h2>Retention</h2>
      <p>
        We keep demo request details for {placeholders.retentionPeriod}, and client account records
        for as long as the service is active and as required afterwards for legal and accounting
        purposes. Footage is kept for the recording period of your plan.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to access, correct or delete your personal information using the contact
        details below. We may need to keep some records where the law requires it.
      </p>

      <h2>Security</h2>
      <p>
        We protect information with encryption in transit and access controls that limit it to
        authorized people. No online service can guarantee absolute security.
      </p>

      <h2>Contact</h2>
      <p>
        {placeholders.legalEntity}
        <br />
        {placeholders.contactEmail}
        <br />
        {placeholders.phone}
      </p>
    </LegalPage>
  );
}
