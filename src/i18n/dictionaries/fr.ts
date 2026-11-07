import type { Dictionary } from "./en";

// French. AI-drafted; have a native speaker review before launch.
const fr: Dictionary = {
  meta: {
    title: "VX44 AI Monitoring | Vos caméras voient tout. Désormais, quelqu’un regarde.",
    description:
      "Une surveillance par IA pour les caméras que vous possédez déjà. Détecter, vérifier, intervenir et rendre compte de ce qui se passe sur votre site.",
    ogDescription: "Vos caméras voient tout. Désormais, quelqu’un regarde.",
    demo: {
      title: "Réserver une démo",
      description: "Réservez une démo VX44 et découvrez si vos caméras actuelles sont compatibles.",
    },
    check: {
      title: "Vérifier mes caméras",
      description:
        "Trois questions rapides pour savoir si VX44 fonctionne avec vos caméras et votre DVR actuels.",
    },
    sales: {
      title: "Parler à un conseiller",
      description:
        "Réservez un appel de 30 minutes avec VX44 pour obtenir un tarif adapté à vos caméras et à vos sites.",
    },
    privacy: {
      title: "Politique de confidentialité",
      description: "Ce que VX44 AI Monitoring collecte, pourquoi, et comment ces données sont traitées.",
    },
    terms: {
      title: "Conditions générales",
      description:
        "Les conditions applicables au site VX44 AI Monitoring, aux services de surveillance et à l’assistance associée.",
    },
    notFound: "Page introuvable",
  },

  common: {
    skipToContent: "Aller au contenu",
    homeLabel: "Accueil VX44 AI Monitoring",
    bookDemo: "Réserver une démo",
    checkCameras: "Vérifier mes caméras",
    talkToSales: "Parler à un conseiller",
    mainNav: "Principal",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    language: "Langue",
    stockFootage: "Vidéo d’illustration",
  },

  nav: {
    howItWorks: "Fonctionnement",
    liveAi: "IA en direct",
    features: "Atouts",
    pricing: "Tarifs",
    faq: "FAQ",
  },

  home: {
    headline: ["Vos caméras voient tout.", "Désormais, quelqu’un regarde."],
    sub: "L’IA surveille les caméras que vous possédez déjà. Un opérateur VX44 formé vérifie chaque alerte avant de contacter qui que ce soit.",
    alert: {
      event: "Personne détectée sur le parvis",
      verified: "Vérifié. Contact du site prévenu.",
    },
    compatibility:
      "Compatible avec vos DVR {hikvision} et {dahua} actuels. Une autre marque ? {link}.",
    compatibilityLink: "Demandez-nous de vérifier",
    compatibilityLabel: "Compatibilité",
    how: {
      title: "Fonctionnement",
      intro: "Du moment où une caméra voit quelque chose au moment où vous êtes informé.",
      steps: [
        {
          title: "Détecter",
          body: "L’IA surveille vos caméras et signale les personnes et les véhicules dès leur apparition.",
        },
        {
          title: "Vérifier",
          body: "Un opérateur VX44 formé vérifie chaque alerte : les fausses alarmes s’arrêtent là.",
        },
        {
          title: "Intervenir",
          body: "Si c’est réel, nous contactons les personnes que vous avez choisies, selon le plan convenu pour votre site.",
        },
        {
          title: "Rendre compte",
          body: "Chaque événement est consigné : vous voyez ce qui s’est passé et ce qui a été fait.",
        },
      ],
    },
    live: {
      title: "Ce que l’IA repère",
      intro: "Elle signale les moments importants, pour qu’une personne ne vérifie que l’essentiel.",
      slots: [
        {
          title: "Personnes",
          body: "Signale les personnes à l’image, pour vous éviter de passer en revue chaque ombre et chaque phare.",
        },
        { title: "Véhicules", body: "Signale les voitures et camions qui entrent dans les zones qui comptent pour vous." },
        {
          title: "Hors horaires",
          body: "Redouble d’attention quand votre site devrait être vide, aux heures que vous fixez.",
        },
      ],
    },
    features: {
      title: "Ce que vous obtenez",
      items: [
        {
          title: "Gardez vos caméras",
          body: "Fonctionne avec votre DVR et vos caméras actuels. Nous ajoutons seulement un petit adaptateur.",
        },
        {
          title: "Détection par IA",
          body: "La détection des personnes et des véhicules transforme des heures de vidéo en moments qui comptent.",
        },
        {
          title: "Une surveillance à vos horaires",
          body: "Choisissez les heures de surveillance de chaque site, selon vos heures d’ouverture et de fermeture.",
        },
        {
          title: "Accès depuis n’importe où",
          body: "Consultez vos caméras depuis votre téléphone ou votre ordinateur, à tout moment.",
        },
        {
          title: "Enregistrement dans le cloud",
          body: "Les vidéos sont stockées hors site par un prestataire de stockage vidéo cloud de confiance, loin de l’enregistreur.",
        },
        {
          title: "Tous vos sites dans un seul compte",
          body: "Ajoutez des sites au fil de votre croissance et gérez-les tous au même endroit.",
        },
      ],
    },
    pricing: {
      title: "Des tarifs adaptés à vos sites",
      intro:
        "Chaque site est différent. Dites-nous combien de caméras et de sites vous avez, et nous vous proposerons un tarif adapté.",
      cardTitle: "Tarif sur mesure",
      summary: "Selon vos caméras et vos sites",
      includesTitle: "Ce que votre offre peut inclure",
      includes: [
        "Alertes de mouvement par IA",
        "Enregistrement dans le cloud",
        "Vos caméras, où que vous soyez",
        "Vérification des alertes",
        "Un plan d’intervention convenu",
        "Horaires de surveillance par site",
        "Un seul compte pour tous vos sites",
        "Facturation regroupée",
      ],
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Est-ce compatible avec mes caméras ?",
          answer:
            "VX44 est conçu pour les DVR Hikvision et Dahua. Une autre marque, ou vous n’êtes pas sûr ? Envoyez-nous les détails et nous vérifierons avant tout engagement.",
        },
        {
          question: "Comment se passe l’installation ?",
          answer:
            "En trois étapes. Nous vérifions que votre système est compatible. Nous vous envoyons un petit adaptateur cloud qui se branche sur votre DVR. Une fois installé, la surveillance démarre. Le mot de passe administrateur de votre DVR est généralement nécessaire. Si vous ne l’avez pas, dites-le-nous et nous verrons les solutions ensemble.",
        },
        {
          question: "Où mes vidéos sont-elles stockées ?",
          answer:
            "Les vidéos sont stockées par un prestataire de stockage vidéo cloud de confiance, qui agit en tant que sous-traitant. Notre politique de confidentialité explique ce que nous collectons et comment nous le traitons.",
        },
        {
          question: "Comment fonctionnent les tarifs ?",
          answer:
            "Chaque tarif est établi pour votre entreprise. Dites-nous combien de caméras et de sites vous avez, et nous préparerons un devis, généralement après une rapide vérification de compatibilité.",
        },
      ],
    },
    cta: {
      title: "Vos caméras sont-elles prêtes ?",
      body: "Parlez-nous de votre installation. Nous vérifierons qu’elle fonctionne avant tout engagement.",
    },
  },

  footer: {
    tagline:
      "Une surveillance par IA pour les caméras que vous possédez déjà. Chaque alerte est vérifiée par un opérateur VX44 formé.",
    explore: "Découvrir",
    getStarted: "Commencer",
    contact: "Contact",
    email: "E-mail",
    phone: "Téléphone",
    address: "Adresse",
    rights: "Tous droits réservés.",
    legal: "Mentions légales",
    privacy: "Confidentialité",
    terms: "Conditions",
    footerNav: "Pied de page",
  },

  demo: {
    heading: "Vérifions vos caméras",
    intro: "Parlez-nous un peu de votre site et du système que vous avez aujourd’hui.",
    nextTitle: "La suite",
    nextSteps: [
      "Nous examinons vos informations et vérifions la compatibilité de votre DVR.",
      "Nous vous montrons comment fonctionne la surveillance et établissons un tarif pour vos caméras et vos sites.",
      "Une fois votre dossier approuvé, nous vous envoyons un adaptateur cloud pour votre DVR et la surveillance démarre.",
    ],
  },

  sales: {
    heading: "Obtenez un tarif pour vos sites",
    intro:
      "Choisissez un créneau pour un appel de 30 minutes. Nous découvrirons votre installation et établirons un tarif adapté.",
    bringTitle: "Utile à avoir sous la main",
    bring: [
      "Le nombre de caméras",
      "Le nombre de sites couverts",
      "La marque de votre DVR ou NVR, si vous la connaissez",
    ],
  },

  check: {
    heading: "VX44 fonctionne-t-il avec votre équipement ?",
    intro: "Répondez à trois questions et obtenez la réponse tout de suite. Aucune coordonnée demandée.",
    q1: "1. De quelle marque est votre DVR ou NVR ?",
    brandHint: "La marque est généralement inscrite sur la façade de l’enregistreur.",
    q2: "2. Combien de caméras avez-vous, environ ?",
    q3: "3. Connaissez-vous le mot de passe administrateur de votre DVR ?",
    passwordHint: "Oui ou non suffit. Nous ne demandons jamais le mot de passe lui-même.",
    submit: "Vérifier mes caméras",
    compatible: "SEMBLE COMPATIBLE",
    needsCheck: "VÉRIFICATION RAPIDE NÉCESSAIRE",
    goodNews: "Bonne nouvelle : VX44 est conçu pour les DVR {brand}.",
    weWillCheck: "Nous vérifierons votre système avant tout engagement.",
    stillConfirm: "Nous confirmons tout de même chaque système par une vérification de compatibilité avant de l’approuver.",
    sendDetails: "Envoyez-nous les détails et nous vérifierons la compatibilité de votre DVR.",
    passwordKnown: "Vous connaissez le mot de passe administrateur de votre DVR, ce dont l’installation a généralement besoin.",
    passwordUnknown:
      "L’installation nécessite généralement le mot de passe administrateur du DVR. C’est fréquent, et nous verrons les solutions ensemble.",
    pricing:
      "Le tarif est adapté à chaque entreprise. Nous établirons un prix pour vos caméras ({count}) et les sites qu’elles couvrent.",
    bookWithDetails: "Réserver une démo avec ces informations",
    changeAnswers: "Modifier mes réponses",
  },

  options: {
    brands: { Hikvision: "Hikvision", Dahua: "Dahua", Other: "Autre", "Not sure": "Je ne sais pas" },
    password: { yes: "Oui", no: "Non", unsure: "Je ne sais pas" },
  },

  leadForm: {
    name: "Nom",
    business: "Entreprise",
    email: "E-mail",
    phone: "Téléphone",
    city: "Ville",
    state: "État",
    cameras: "Caméras (environ)",
    brand: "Marque du DVR",
    selectBrand: "Choisir une marque",
    passwordLegend: "Connaissez-vous le mot de passe administrateur de votre DVR ?",
    passwordHint: "Répondez simplement oui ou non. Ne nous envoyez pas le mot de passe.",
    message: "Message (facultatif)",
    submit: "Réserver ma démo",
    sending: "Envoi...",
    privacyNote: "Nous utilisons ces informations pour répondre à votre demande. Consultez notre {link}.",
    privacyLink: "politique de confidentialité",
    received: "DEMANDE REÇUE",
    thanks: "Merci. Nous avons bien reçu vos informations.",
    thanksBody:
      "Choisissez dès maintenant un créneau pour votre démo, ou nous vous contacterons pour en fixer un. Dans tous les cas, nous vérifierons d’abord la compatibilité de vos caméras.",
    pickTime: "Choisissez un créneau pour votre démo",
    pickTimeBody: "Choisissez un créneau de 30 minutes et parlez-nous de vos caméras lors de la réservation.",
    errors: {
      securityCheck: "Veuillez effectuer la vérification de sécurité.",
      network: "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.",
      checkFields: "Veuillez vérifier les champs signalés.",
      tooMany: "Trop de demandes depuis cette connexion. Veuillez réessayer plus tard.",
      generic: "Votre demande n’a pas pu être envoyée. Veuillez réessayer dans un instant.",
      fields: {
        fullName: "Indiquez votre nom.",
        businessName: "Indiquez le nom de votre entreprise.",
        email: "Indiquez une adresse e-mail valide.",
        phone: "Indiquez un numéro de téléphone valide.",
        city: "Indiquez votre ville.",
        state: "Indiquez votre État.",
        cameraCount: "Indiquez environ combien de caméras vous avez.",
        dvrBrand: "Choisissez une marque de DVR.",
        knowsDvrPassword: "Choisissez une réponse.",
        message: "Votre message doit faire moins de 4000 caractères.",
        turnstileToken: "Veuillez effectuer la vérification de sécurité.",
      },
    },
  },

  calendly: {
    loading: "CHARGEMENT DES CRÉNEAUX",
    label: "Réserver un créneau",
    failed: "Le calendrier ne s’est pas chargé.",
    openPage: "Ouvrir la page de réservation",
  },

  legal: {
    onThisPage: "Sur cette page",
    translationNotice:
      "Cette traduction est fournie pour votre commodité. En cas de différence avec la version anglaise, la version anglaise prévaut.",
    effectiveDate: "Date d’entrée en vigueur :",
  },

  notFound: {
    heading: "Page introuvable",
    body: "Le lien est peut-être obsolète, ou l’adresse contient une faute de frappe.",
    home: "Retour à l’accueil",
  },
};

export default fr;
