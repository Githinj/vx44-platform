// English copy for the public site. Every other language file must match this shape exactly
// (TypeScript enforces it through the Dictionary type).
//
// Placeholders in braces, such as {brand}, are filled in by the page. Keep them in every
// translation, moved to wherever the language puts them.

const en = {
  meta: {
    title: "VX44 AI Monitoring | Your cameras see everything. Now someone's watching.",
    description:
      "AI monitoring for the cameras you already own. Detect, verify, respond and report on what happens at your site.",
    ogDescription: "Your cameras see everything. Now someone's watching.",
    demo: {
      title: "Book a demo",
      description: "Book a VX44 demo and find out whether your existing cameras are compatible.",
    },
    check: {
      title: "Check my cameras",
      description:
        "Three quick questions to see whether VX44 works with the cameras and DVR you already have.",
    },
    sales: {
      title: "Talk to sales",
      description:
        "Book a 30-minute call with VX44 to get pricing built around your cameras and sites.",
    },
    privacy: {
      title: "Privacy policy",
      description: "What VX44 AI Monitoring collects, why, and how it's handled.",
    },
    terms: {
      title: "Terms & Conditions",
      description:
        "The terms that apply to the VX44 AI Monitoring website, monitoring services and related support.",
    },
    notFound: "Page not found",
  },

  common: {
    skipToContent: "Skip to content",
    homeLabel: "VX44 AI Monitoring home",
    bookDemo: "Book a demo",
    checkCameras: "Check my cameras",
    talkToSales: "Talk to sales",
    mainNav: "Main",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    stockFootage: "Stock footage for illustration",
  },

  nav: {
    howItWorks: "How it works",
    liveAi: "Live AI",
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
  },

  home: {
    headline: ["Your cameras see everything.", "Now someone’s watching."],
    sub: "AI watches the cameras you already own. A trained VX44 operator checks every alert before anyone is contacted.",
    alert: {
      event: "Person detected on the forecourt",
      verified: "Verified. Site contact notified.",
    },
    compatibility: "Works with the {hikvision} and {dahua} DVRs you already have. Different brand? {link}.",
    compatibilityLink: "Ask us to check",
    compatibilityLabel: "Compatibility",
    how: {
      title: "How it works",
      intro: "From the moment a camera sees something to the moment you know about it.",
      steps: [
        {
          title: "Detect",
          body: "AI watches your camera feeds and flags people and vehicles the moment they appear.",
        },
        {
          title: "Verify",
          body: "A trained VX44 operator checks every alert, so false alarms stop here.",
        },
        {
          title: "Respond",
          body: "If it's real, we contact the people you chose, following the plan agreed for your site.",
        },
        {
          title: "Report",
          body: "Every event is logged, so you can see what happened and what was done.",
        },
      ],
    },
    live: {
      title: "What the AI looks for",
      intro: "It flags the moments that matter, so a person only reviews what counts.",
      slots: [
        {
          title: "Person",
          body: "Flags people on camera, so you aren’t sorting through every shadow and passing headlight.",
        },
        { title: "Vehicle", body: "Flags cars and trucks entering the areas you care about." },
        {
          title: "After-hours",
          body: "Watches most closely when your site should be empty, during the hours you set.",
        },
      ],
    },
    features: {
      title: "What you get",
      items: [
        {
          title: "Keep your cameras",
          body: "Works with the DVR and cameras you already have. We add one small adapter.",
        },
        {
          title: "AI detection",
          body: "Person and vehicle detection turns hours of footage into the moments that matter.",
        },
        {
          title: "Monitoring on your schedule",
          body: "Choose the hours each site is watched, around when you open and close.",
        },
        {
          title: "View from anywhere",
          body: "Check your cameras from your phone or laptop, any time.",
        },
        {
          title: "Cloud recording",
          body: "Footage is stored off site by a trusted cloud video storage provider, away from the recorder.",
        },
        {
          title: "Every site in one account",
          body: "Add locations as you grow and manage them all in one place.",
        },
      ],
    },
    pricing: {
      title: "Pricing built around your sites",
      intro:
        "Every site is different. Tell us how many cameras and locations you have, and we’ll quote a price that fits.",
      cardTitle: "Custom pricing",
      summary: "Based on your cameras and sites",
      includesTitle: "What your plan can include",
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
    },
    faq: {
      title: "Common questions",
      items: [
        {
          question: "Will this work with my cameras?",
          answer:
            "VX44 is built for Hikvision and Dahua DVRs. Another brand, or not sure? Send us the details and we’ll check before you commit to anything.",
        },
        {
          question: "What does setup involve?",
          answer:
            "Three steps. We check your system is compatible. We ship a small cloud adapter that plugs into your DVR. Once it’s installed, monitoring goes live. You’ll usually need your DVR admin password. If you don’t have it, tell us and we’ll talk through the options.",
        },
        {
          question: "Where is my footage stored?",
          answer:
            "Footage is stored by a trusted cloud video storage provider acting as our sub-processor. Our privacy policy explains what we collect and how it’s handled.",
        },
        {
          question: "How does pricing work?",
          answer:
            "Every price is built for your business. Tell us how many cameras and sites you have, and we’ll put together a quote, usually after a quick compatibility check.",
        },
      ],
    },
    cta: {
      title: "Are your cameras ready?",
      body: "Tell us about your setup. We’ll check it works before you commit to anything.",
    },
  },

  footer: {
    tagline: "AI monitoring for the cameras you already own. Every alert is checked by a trained VX44 operator.",
    explore: "Explore",
    getStarted: "Get started",
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    address: "Address",
    rights: "All rights reserved.",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    footerNav: "Footer",
  },

  demo: {
    heading: "Let’s check your cameras",
    intro: "Tell us a little about your site and the system you have now.",
    nextTitle: "What happens next",
    nextSteps: [
      "We review your details and run a compatibility check on your DVR.",
      "We show you how monitoring works and put together pricing for your cameras and sites.",
      "Once you’re approved, we ship a cloud adapter for your DVR and get you live.",
    ],
  },

  sales: {
    heading: "Get pricing for your sites",
    intro:
      "Pick a time for a 30-minute call. We’ll learn about your setup and put together a price that fits.",
    bringTitle: "Helpful to have ready",
    bring: [
      "How many cameras you have",
      "How many sites they cover",
      "The brand of your DVR or NVR, if you know it",
    ],
  },

  check: {
    heading: "Will VX44 work with what you have?",
    intro: "Answer three questions and see straight away. No contact details needed.",
    q1: "1. What brand is your DVR or NVR?",
    brandHint: "The brand name is usually printed on the front of the recorder.",
    q2: "2. Roughly how many cameras do you have?",
    q3: "3. Do you know your DVR admin password?",
    passwordHint: "Just yes or no. We never ask for the password itself.",
    submit: "Check my cameras",
    compatible: "LOOKS COMPATIBLE",
    needsCheck: "NEEDS A QUICK CHECK",
    goodNews: "Good news: VX44 is built for {brand} DVRs.",
    weWillCheck: "We’ll check your system before you commit to anything.",
    stillConfirm: "We still confirm every system with a compatibility check before you’re approved.",
    sendDetails: "Send us the details and we’ll run a compatibility check on your DVR.",
    passwordKnown: "You know your DVR admin password, which is what setup usually needs.",
    passwordUnknown:
      "Setup usually needs your DVR admin password. That’s common, and we’ll talk through the options.",
    pricing:
      "Pricing is tailored to each business. We’ll put together a price for your cameras ({count}) and the sites they cover.",
    bookWithDetails: "Book a demo with these details",
    changeAnswers: "Change my answers",
  },

  // Labels for the answers people choose. The submitted values stay in English.
  options: {
    brands: { Hikvision: "Hikvision", Dahua: "Dahua", Other: "Other", "Not sure": "Not sure" },
    password: { yes: "Yes", no: "No", unsure: "Not sure" },
  },

  leadForm: {
    name: "Name",
    business: "Business",
    email: "Email",
    phone: "Phone",
    city: "City",
    state: "State",
    cameras: "Approx. cameras",
    brand: "DVR brand",
    selectBrand: "Select a brand",
    passwordLegend: "Do you know your DVR admin password?",
    passwordHint: "Just tell us yes or no. Please don’t send us the password itself.",
    message: "Message (optional)",
    submit: "Book my demo",
    sending: "Sending...",
    privacyNote: "We use these details to respond to your request. See our {link}.",
    privacyLink: "privacy policy",
    received: "REQUEST RECEIVED",
    thanks: "Thanks. We’ve got your details.",
    thanksBody:
      "Pick a time for your demo now, or we’ll be in touch to arrange one. Either way, we’ll check that your cameras are compatible first.",
    pickTime: "Pick a time for your demo",
    pickTimeBody: "Choose a 30-minute slot and tell us about your cameras when you book.",
    errors: {
      securityCheck: "Please complete the security check.",
      network: "We couldn't reach the server. Check your connection and try again.",
      checkFields: "Please check the highlighted fields.",
      tooMany: "Too many requests from this connection. Please try again later.",
      generic: "We couldn't send your request. Please try again in a moment.",
      fields: {
        fullName: "Enter your name.",
        businessName: "Enter your business name.",
        email: "Enter a valid email address.",
        phone: "Enter a valid phone number.",
        city: "Enter your city.",
        state: "Enter your state.",
        cameraCount: "Enter roughly how many cameras you have.",
        dvrBrand: "Choose a DVR brand.",
        knowsDvrPassword: "Choose an answer.",
        message: "Keep your message under 4000 characters.",
        turnstileToken: "Please complete the security check.",
      },
    },
  },

  calendly: {
    loading: "LOADING AVAILABLE TIMES",
    label: "Book a time",
    failed: "The calendar didn’t load.",
    openPage: "Open the booking page",
  },

  legal: {
    onThisPage: "On this page",
    // Shown above translated legal pages only.
    translationNotice: "",
    effectiveDate: "Effective Date:",
  },

  notFound: {
    heading: "We couldn’t find that page",
    body: "The link may be out of date, or the address may have a typo.",
    home: "Back to the homepage",
  },
};

export type Dictionary = typeof en;
export default en;
