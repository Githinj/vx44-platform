import Link from "next/link";
import { EmailLink, PhoneLink } from "@/components/marketing/contact-links";
import { formatAddress, placeholders } from "@/content/site";
import type { LegalContent } from "./types";

// The English Privacy Policy and Terms. This is the governing text: translations follow it.

export const legal: LegalContent = {
  privacy: () => (
    <>
        <p>
          This policy explains how {placeholders.legalEntity} (&quot;we&quot;)
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
            <strong>Demo bookings:</strong> when you book a time, your name, email, the time you
            chose and anything you add to the booking. A scheduling provider handles the booking for
            us.
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
          website hosting, database hosting, email delivery, meeting scheduling and bot protection. They handle data on
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
          <EmailLink />
          <br />
          <PhoneLink />
        </p>
    </>
  ),
  terms: () => (
    <>
        <p className="text-muted">Effective Date: {placeholders.termsEffectiveDate}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>Welcome to VX44 AI Monitoring (“VX44,” “we,” “our,” or “us”).</p>
        <p>
          By accessing our website or subscribing to our services, you agree to these Terms &amp;
          Conditions and any applicable customer service agreement.
        </p>
        <p>
          These Terms govern the use of our website, security monitoring services, and related
          operational support.
        </p>

        <h2>2. Our Services</h2>
        <p>
          VX44 AI Monitoring provides professional security monitoring solutions combining advanced
          artificial intelligence with trained human monitoring personnel.
        </p>
        <p>Depending on the selected service package, services may include:</p>
        <ul>
          <li>AI-powered video monitoring.</li>
          <li>Human monitoring and security activity review.</li>
          <li>Suspicious activity identification and alert evaluation.</li>
          <li>Incident notifications and escalation.</li>
          <li>Dispatch and response coordination.</li>
          <li>Monitoring operations and customer support.</li>
          <li>Security activity reporting where included in the service agreement.</li>
        </ul>
        <p>
          Service coverage, operating hours, response procedures, and specific responsibilities are
          established in each customer’s service agreement.
        </p>

        <h2>3. AI Technology and Human Monitoring</h2>
        <p>
          VX44 combines intelligent monitoring technology with trained human monitoring
          professionals.
        </p>
        <p>
          Our systems assist in identifying potential security threats, while authorized monitoring
          personnel review relevant events and coordinate appropriate actions.
        </p>
        <p>
          This combined approach is designed to improve security awareness, incident assessment, and
          operational response.
        </p>
        <p>
          Although VX44 strives to provide reliable and professional monitoring services, no
          security system can detect every event or prevent every incident.
        </p>
        <p>False alerts, missed events, technical interruptions, and human errors may occur.</p>
        <p>
          VX44 does not guarantee the prevention of theft, violence, unauthorized access, property
          damage, or other security incidents.
        </p>

        <h2>4. Dispatch and Incident Escalation</h2>
        <p>
          When included in the customer’s service package, VX44 coordinates incident notifications
          and escalation according to established monitoring procedures.
        </p>
        <p>
          These procedures may include contacting designated customer representatives, authorized
          security personnel, or emergency response services when appropriate.
        </p>
        <p>Dispatch coordination does not guarantee a specific arrival time or outcome.</p>
        <p>VX44 does not replace public emergency services.</p>

        <h2>5. Customer Privacy and Business Confidentiality</h2>
        <p>
          VX44 recognizes that customers may operate businesses containing sensitive, private,
          proprietary, and confidential information.
        </p>
        <p>
          We are committed to protecting the confidentiality of customer information and maintaining
          professional security practices.
        </p>
        <p>Customer information may include:</p>
        <ul>
          <li>Business operations and internal activities.</li>
          <li>Security camera views and monitoring information.</li>
          <li>Employee and customer activity visible through authorized monitoring.</li>
          <li>Business contact information.</li>
          <li>Security procedures and operational instructions.</li>
          <li>Payment and account management information.</li>
        </ul>
        <p>
          VX44 will use customer information only for authorized business and service-related
          purposes, subject to applicable law.
        </p>
        <p>
          Customer information must not be used for unauthorized personal, commercial, or unrelated
          purposes.
        </p>

        <h2>6. Confidentiality and Restricted Access</h2>
        <p>
          VX44 maintains a policy of restricted access to customer monitoring systems and business
          information.
        </p>
        <p>Under this policy:</p>
        <ul>
          <li>
            Only authorized personnel may access information required for their assigned
            responsibilities.
          </li>
          <li>Monitoring personnel must respect customer confidentiality.</li>
          <li>Unauthorized viewing, copying, sharing, or disclosure of customer information is prohibited.</li>
          <li>Customer monitoring access must be restricted according to assigned permissions.</li>
          <li>Customer information must not be disclosed to unrelated customers.</li>
          <li>
            Personnel with access to confidential information are subject to applicable
            confidentiality obligations.
          </li>
          <li>Access permissions may be reviewed, restricted, or revoked when no longer necessary.</li>
        </ul>
        <p>
          Access or disclosure may occur where authorized by the customer, necessary to provide
          contracted services, or required or permitted by applicable law.
        </p>

        <h2>7. Customer Account Separation</h2>
        <p>
          VX44 is committed to maintaining appropriate separation between customer accounts and
          monitoring access.
        </p>
        <p>
          Each customer should be able to access only the information and services authorized for
          their account.
        </p>
        <p>Customers are not permitted to access another customer’s:</p>
        <ul>
          <li>Camera feeds.</li>
          <li>Security monitoring information.</li>
          <li>Business management information.</li>
          <li>Account or billing records.</li>
          <li>Confidential operational information.</li>
        </ul>
        <p>
          Unauthorized attempts to access another customer’s systems or information are strictly
          prohibited.
        </p>

        <h2>8. Information Security</h2>
        <p>
          VX44 seeks to implement appropriate administrative, technical, and organizational
          safeguards to protect information under its responsibility.
        </p>
        <p>
          Security practices may include access controls, authentication, personnel authorization
          procedures, and operational oversight.
        </p>
        <p>
          Customers are responsible for maintaining the confidentiality of their own account
          credentials and promptly reporting suspected unauthorized access.
        </p>
        <p>No electronic system or security procedure can be guaranteed completely secure.</p>

        <h2>9. Customer Responsibilities</h2>
        <p>Customers agree to:</p>
        <ul>
          <li>Maintain compatible and properly functioning security equipment unless otherwise agreed.</li>
          <li>Provide reliable electrical power and internet connectivity.</li>
          <li>Maintain accurate emergency contact information.</li>
          <li>Provide authorized access necessary for monitoring services.</li>
          <li>Notify VX44 of changes affecting security operations.</li>
          <li>Obtain legally required surveillance notices, permissions, and consents.</li>
          <li>Comply with applicable privacy, employment, and surveillance laws.</li>
          <li>Protect their account credentials against unauthorized use.</li>
        </ul>

        <h2>10. Service Availability</h2>
        <p>
          VX44 provides monitoring services according to the coverage hours and service levels
          specified in the applicable customer agreement.
        </p>
        <p>
          Service interruptions may result from equipment failures, internet outages, power
          interruptions, maintenance, or other operational circumstances.
        </p>
        <p>Any specific availability or response-time commitments must be expressly established in writing.</p>

        <h2>11. Payments and Subscriptions</h2>
        <p>
          Service pricing, activation fees, billing schedules, and payment obligations will be
          provided in the applicable order or customer service agreement.
        </p>
        <p>Customers agree to pay authorized charges associated with their selected services.</p>
        <p>
          Late or unpaid balances may result in service restrictions or suspension as permitted by
          applicable law and the governing agreement.
        </p>

        <h2>12. Cancellation and Termination</h2>
        <p>
          Cancellation procedures, notice periods, refunds, and any early termination charges will
          be governed by the applicable customer service agreement.
        </p>
        <p>
          VX44 may suspend or terminate services for material violations of contractual obligations,
          subject to applicable law and agreement terms.
        </p>

        <h2>13. Privacy and Data Protection</h2>
        <p>
          VX44 maintains payment history and general administrative information necessary for
          customer account and service management.
        </p>
        <p>
          Customer video recordings are not independently stored within VX44’s internal business
          management platform.
        </p>
        <p>Access to monitoring information is limited to authorized operational purposes.</p>
        <p>
          Personal information is handled in accordance with our{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-gold">
          Privacy Policy
        </Link>{" "}
          and applicable legal requirements.
        </p>

        <h2>14. Limitation of Liability</h2>
        <p>
          VX44 provides monitoring and coordination services intended to improve security awareness
          and support incident response.
        </p>
        <p>
          These services are not insurance and do not guarantee the prevention of financial loss,
          criminal activity, property damage, or personal injury.
        </p>
        <p>
          Any contractual limitations of liability will be governed by the applicable customer
          service agreement and enforceable only to the extent permitted by law.
        </p>
        <p>Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited.</p>

        <h2>15. Intellectual Property</h2>
        <p>
          The VX44 AI Monitoring name, branding, website content, software interfaces, and
          proprietary materials are protected under applicable intellectual property laws.
        </p>
        <p>
          Unauthorized copying, modification, distribution, or commercial use is prohibited except
          as permitted by law or written authorization.
        </p>

        <h2>16. Changes to Terms</h2>
        <p>
          VX44 may update these Terms &amp; Conditions to reflect changes in its services, business
          operations, or applicable legal requirements.
        </p>
        <p>
          Material changes affecting existing contractual services will be addressed in accordance
          with applicable agreements and law.
        </p>

        <h2>17. Governing Law</h2>
        <p>
          These Terms are governed by the laws of {placeholders.governingLaw}, subject to applicable
          mandatory legal protections.
        </p>
        <p>Any separately agreed dispute resolution procedures will apply where legally enforceable.</p>

        <h2>18. Contact Information</h2>
        <p>
          VX44 AI Monitoring
          <br />
          Website:{" "}
          <a href="https://vx44ai.com" className="underline-offset-4 hover:text-gold hover:underline">
            https://vx44ai.com
          </a>
          <br />
          Email: <EmailLink />
          <br />
          Legal Business Name: {placeholders.legalEntity}
          <br />
          Business Address: {formatAddress()}
        </p>
        <p>For questions regarding these Terms &amp; Conditions, please contact us by email.</p>
    </>
  ),
};
