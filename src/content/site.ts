// Every value awaiting confirmation lives here (build spec section 7), so filling them in
// is a one-file change.
export const placeholders = {
  price: "[PRICE]",
  contactEmail: "[CONTACT EMAIL]",
  phone: "[PHONE]",
  legalEntity: "[LEGAL ENTITY NAME]",
  governingLaw: "[GOVERNING STATE]",
  retentionPeriod: "[RETENTION PERIOD]",
};

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#live-ai", label: "Live AI" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

// Bar colours follow the design spec: cyan for AI, gold for the brand, green for resolved.
export const steps = [
  {
    title: "Detect",
    accent: "bg-cyan",
    body: "AI watches your existing camera feeds and flags people and vehicles as they appear.",
  },
  {
    title: "Verify",
    accent: "bg-gold",
    body: "Each alert is reviewed to separate a real event from a false alarm.",
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

export const liveAiSlots = [
  {
    title: "Person",
    camera: "CAM 02 · LOADING BAY",
    detection: "PERSON",
    box: "left-[38%] top-[26%] h-[58%] w-[20%]",
    body: "Spots people on camera, so you aren’t sorting through every shadow and passing headlight.",
  },
  {
    title: "Vehicle",
    camera: "CAM 03 · CAR PARK",
    detection: "VEHICLE",
    box: "left-[24%] top-[42%] h-[38%] w-[46%]",
    body: "Flags cars and trucks entering the areas you care about.",
  },
  {
    title: "After-hours",
    camera: "CAM 04 · REAR DOOR",
    detection: "AFTER-HOURS",
    box: "left-[52%] top-[24%] h-[60%] w-[20%]",
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

export const plans = [
  {
    name: "Essentials",
    summary: "AI detection and cloud recording for your existing cameras.",
    highlights: ["AI motion alerts", "Cloud recording", "View my cameras, anywhere"],
    featured: false,
  },
  {
    name: "Monitored",
    summary: "Everything in Essentials, with alerts verified and acted on.",
    highlights: ["Everything in Essentials", "Alert verification", "Agreed response plan"],
    featured: true,
  },
  {
    name: "Multi-site",
    summary: "One account for businesses running more than one location.",
    highlights: ["Multiple locations", "Monitoring hours per site", "Combined billing"],
    featured: false,
  },
];

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
      "Plans are priced per camera, per month, so you only pay for the cameras you put under monitoring. We confirm your exact price after the compatibility check.",
  },
];
