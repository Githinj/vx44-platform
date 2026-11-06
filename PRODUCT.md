# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: small-business owners across the US** whose sites already have CCTV on a Hikvision or Dahua DVR: convenience stores, gas stations, warehouses, restaurants and offices.
  - They own cameras that record, but nobody watches the footage.
  - They aren't technical, and they're cautious about letting anyone see their cameras. Trust has to come before anything else.
  - They come to the marketing site to decide whether VX44 works with the cameras they already have, and to book a demo or a sales call.
  - They often don't know their DVR's admin password, or even its brand.
- **Admins: Morris (developer) and Amar (founder).** They use the admin back office to manage leads, clients, sites, subscriptions and the monthly reconciliation.
- **Clients (Phase 1C):** invited users who log in to the client portal to see their own sites, plan, billing status and documents, and to open "View my cameras".

## Product Purpose

VX44 adds AI monitoring to the cameras a business already owns, so events at their site get noticed, checked and acted on.

The marketing site has one job: earn trust and get a "Book a demo" or "Check my cameras" request.

Success has three parts:
- A visitor confirms their cameras are compatible and books a demo or sales call.
- An admin takes that lead from compatibility check to an active, correctly billed client.
- The client trusts that a real event reaches them, and that false alarms don't.

## Positioning

- **The client keeps their cameras.** VX44 ships a small cloud adapter that connects to the existing DVR, so there's no rip-and-replace.
- **A person checks every alert first.** AI flags people and vehicles, then a trained VX44 operator reviews each alert before anyone is contacted.
- **Operators coordinate the response.** For a real event, the operator follows the response plan agreed for that site and contacts the people the client chose. Every event is logged.

## Operating Context

- **Customer journey:**
  1. The visitor finds the site.
  2. They submit the demo or compatibility form, giving their DVR brand, camera count and whether they know the admin password.
  3. They book a 30-minute call through Calendly.
  4. Admins carry out a compatibility check and approve the system.
  5. The adapter is shipped and installed.
  6. Monitoring goes live.
- **Onboarding statuses:** lead → compatibility check → approved → adapter shipped → installed → active.
- **Market:** anywhere in the US. The business address is in Richmond Hill, NY.
- **Video provider:** recording, live view and alerts run on a white-labelled video provider (CCTV Connect), branded as VX44.
  - There's no integration with it: admins create clients in its partner portal by hand, then type the reference numbers into this app.
- **Billing:** recorded by hand in Phase 1, using Stripe Payment Links or invoices. Stripe Checkout comes in Phase 4, once the US LLC is registered.

## Capabilities and Constraints

- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind, Supabase (Auth, Postgres with RLS, Storage), SendGrid, Cloudflare Turnstile and Calendly, hosted on Vercel at www.vx44ai.com.
- **Video:** this app shows no video. It only links out with "View my cameras".
- **White-label rules:** never name Videoloft, or any other technology provider, in the UI, emails or copy.
  - Footage is described as stored by "a trusted cloud video storage provider (sub-processor)".
  - Never imply VX44 runs its own data centres.
- **Compatibility:** built for Hikvision and Dahua DVRs. Other brands get a compatibility check, never a promise.
- **Pricing:** custom per client, set on a sales call. The site publishes no prices or tiers.
- **Access:** there's no open sign-up. Clients are invited, and admins must use MFA.
- **Still to confirm with the founder:**
  - registered company name (the site currently says "VX44");
  - governing state for the Terms;
  - retention period for demo requests;
  - footage retention wording;
  - Terms effective date.

## Brand Commitments

- **Name:** "VX44 AI Monitoring". The wordmark is the text "VX44" (with "44" in gold) plus "AI MONITORING", until the final logo is chosen.
- **Feeling:** modern, calm, premium and confident, like a quiet control room at night. Never loud, cluttered or hyped. Simple beats busy.
- **Voice:** plain, calm and direct, e.g. "Your cameras see everything. Now someone's watching."
  - Copy says what happens. It doesn't hype the AI.
- **Brand palette and fonts:** fixed by the brand brief. DESIGN.md holds the values and the rules for each colour.
- **Contact:** info@vx44ai.com and +1 (917) 939-0403. The phone line is temporary.
- **Address:** 8564 114th Street, Richmond Hill, NY 11418.

## Evidence on Hand

- **Footage:** four temporary Pexels stock clips in `public/footage/`, cropped to remove faces, plates and logos (see `docs/footage-sources.md`).
  - Before launch, replace them with released or real-camera footage.
- **Pre-launch:** there are no clients, client logos, reviews, testimonials, case studies, detection-accuracy figures or response-time figures yet.
  - Never invent any statistic, logo, review or testimonial, and never imply existing customers.

## Product Principles

1. **Honest over impressive.** Claim only what VX44 does today. The AI flags events and a person verifies them, and nothing should imply more.
2. **Meet owners where they are.** Start from the cameras and DVR they already have, and make the compatibility question easy to answer.
3. **One clear next step.** Every public page leads to booking a demo, checking cameras or talking to sales.
4. **Trust is earned in the details.** Explain where footage is stored, who sees it and what happens with an alert, without exposing the white-labelled provider.
5. **Real numbers only.** Admin and client views show recorded data, never placeholders dressed up as metrics.

## Accessibility & Inclusion

- **Standard: WCAG AA.** All text must meet AA contrast (4.5:1 for body text, 3:1 for large text).
- **Phone width:** everything must work at phone width; many owners will first see the site on a phone.
- **Plain language:** owners aren't technical, so explain cameras, DVRs and access without jargon.
- **Video:** footage slots are muted, looping and decorative, with poster images. They're lazy-loaded to keep performance high.
