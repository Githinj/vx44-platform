// Every value awaiting confirmation lives here (build spec section 7), so filling them in
// is a one-file change.
export const placeholders = {
  legalEntity: "VX44",
  governingLaw: "[GOVERNING STATE]",
  retentionPeriod: "[RETENTION PERIOD]",
  // Set to the date the Terms & Conditions go live, e.g. "November 10, 2026".
  termsEffectiveDate: "[PUBLICATION DATE]",
};

// The business mailing address. Kept in parts so search engines can read it as an address.
export const businessAddress = {
  street: "8564 114th Street",
  city: "Richmond Hill",
  region: "NY",
  postalCode: "11418",
  country: "US",
};

export function formatAddress(address = businessAddress) {
  return `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`;
}

// The phone number is temporary until the company has its own line. Change both phone values
// together: `phone` is what visitors read, `phoneHref` is what their phone dials.
export const contact = {
  email: "info@vx44ai.com",
  phone: "+1 (917) 939-0403",
  phoneHref: "tel:+19179390403",
};

// The 30-minute demo slot visitors book on the demo page.
export const bookingUrl = "https://calendly.com/vx44ai-info/30min";

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#live-ai", label: "Live AI" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

// Bar colours carry meaning: cyan is the AI, white is the person checking, gold is the action
// taken, green is resolved.
export const steps = [
  {
    title: "Detect",
    accent: "bg-cyan",
    body: "AI watches your existing camera feeds and flags people and vehicles as they appear.",
  },
  {
    title: "Verify",
    accent: "bg-text",
    body: "A trained VX44 operator reviews each alert to separate a real event from a false alarm.",
  },
  {
    title: "Respond",
    accent: "bg-gold",
    body: "Real events go straight to the contacts you chose, following the plan agreed for your site.",
  },
  {
    title: "Report",
    accent: "bg-green",
    body: "Every event is logged, so you can see what happened and what was done about it.",
  },
];

// Detection tracks are hand-matched to each clip. Re-check them if a clip is replaced or re-cut.
export const heroFootage = {
  camera: "CAM 01 · FORECOURT",
  src: "/footage/forecourt.mp4",
  poster: "/footage/forecourt.jpg",
  detection: {
    label: "PERSON",
    track: [
      { t: 0.23, left: 68, top: 27, width: 18, height: 55 },
      { t: 0.73, left: 60, top: 27, width: 14, height: 49 },
      { t: 1.23, left: 44, top: 21, width: 13, height: 49 },
      { t: 1.73, left: 31, top: 21, width: 15, height: 49 },
      { t: 2.23, left: 18, top: 21, width: 14, height: 48 },
      { t: 2.73, left: 4, top: 21, width: 15, height: 48 },
      { t: 2.95, left: 0, top: 21, width: 13, height: 48 },
    ],
  },
};

export const liveAiSlots = [
  {
    title: "Person",
    camera: "CAM 02 · WAREHOUSE",
    src: "/footage/warehouse.mp4",
    poster: "/footage/warehouse.jpg",
    detection: {
      label: "PERSON",
      track: [{ t: 0, left: 51, top: 8, width: 42, height: 90 }],
    },
    body: "Spots people on camera, so you aren’t sorting through every shadow and passing headlight.",
  },
  {
    title: "Vehicle",
    camera: "CAM 03 · CAR PARK",
    src: "/footage/car-park.mp4",
    poster: "/footage/car-park.jpg",
    detection: {
      label: "VEHICLE",
      track: [
        { t: 0, left: 19.1, top: 27, width: 10, height: 11 },
        { t: 0.83, left: 23.9, top: 39.8, width: 10, height: 11 },
        { t: 1.67, left: 28.4, top: 52.8, width: 10, height: 11 },
        { t: 2.5, left: 32.9, top: 66.8, width: 10, height: 11 },
        { t: 3.33, left: 37, top: 80.8, width: 10, height: 11 },
      ],
    },
    body: "Flags cars and trucks entering the areas you care about.",
  },
  {
    title: "After-hours",
    camera: "CAM 04 · PERIMETER",
    src: "/footage/perimeter.mp4",
    poster: "/footage/perimeter.jpg",
    detection: {
      label: "AFTER-HOURS",
      track: [
        { t: 0, left: 55, top: 31, width: 18, height: 69 },
        { t: 1, left: 53.5, top: 33, width: 16.5, height: 66 },
        { t: 2, left: 53, top: 35.5, width: 15.5, height: 64 },
        { t: 3, left: 51, top: 37, width: 14.5, height: 61 },
        { t: 4, left: 51, top: 39, width: 13.5, height: 57 },
        { t: 5, left: 51, top: 41, width: 12.5, height: 53 },
      ],
    },
    body: "Pays closest attention when your site should be empty, during the hours you set.",
  },
];

export const features = [
  {
    title: "Keep your cameras",
    body: "Built to work with the DVR and cameras already on your walls.",
  },
  {
    title: "AI detection",
    body: "Person and vehicle detection turns hours of footage into the moments that matter.",
  },
  {
    title: "After-hours coverage",
    body: "Monitoring hours set per site, around when you are open and closed.",
  },
  {
    title: "View from anywhere",
    body: "Open your cameras from your phone or laptop whenever you want to check in.",
  },
  {
    title: "Cloud recording",
    body: "Footage is kept with a trusted cloud video storage provider, away from the recorder on site.",
  },
  {
    title: "Every site in one account",
    body: "Add locations as you grow and manage them all from a single account.",
  },
];

// One custom plan: every client gets a price built around their cameras and sites.
export const pricing = {
  summary: "Based on your cameras and sites",
  includes: [
    "AI motion alerts",
    "Cloud recording",
    "View your cameras, anywhere",
    "Alert verification",
    "An agreed response plan",
    "Monitoring hours set per site",
    "One account for all your locations",
    "Combined billing",
  ],
};

export const faqs = [
  {
    question: "Will this work with my cameras?",
    answer:
      "We’re built for existing Hikvision and Dahua DVRs. If you have another brand or aren’t sure, send us the details and we’ll run a compatibility check before you commit to anything.",
  },
  {
    question: "What does setup involve?",
    answer:
      "We check your system is compatible, approve it, and ship you a small cloud adapter that connects to your DVR. Once it’s installed, monitoring goes live. You’ll usually need your DVR admin password, so tell us if you don’t have it and we’ll talk through the options.",
  },
  {
    question: "Where is my footage stored?",
    answer:
      "Footage is stored by a trusted cloud video storage provider acting as our sub-processor. Our privacy policy explains what we collect and how it’s handled.",
  },
  {
    question: "How does pricing work?",
    answer:
      "There’s no one-size-fits-all price. Tell us how many cameras and sites you have, and our team will put together pricing that fits your business, usually after a quick compatibility check.",
  },
];
