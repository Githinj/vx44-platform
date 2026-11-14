import type { Dictionary } from "./en";

// Spanish (US). AI-drafted; have a native speaker review before launch.
const es: Dictionary = {
  meta: {
    title: "VX44 AI Monitoring | Sus cámaras lo ven todo. Ahora alguien está mirando.",
    description:
      "Monitoreo con IA para las cámaras que ya tiene. Detectamos, verificamos, respondemos e informamos lo que pasa en su negocio.",
    ogDescription: "Sus cámaras lo ven todo. Ahora alguien está mirando.",
    demo: {
      title: "Reservar una demostración",
      description: "Reserve una demostración de VX44 y sepa si sus cámaras actuales son compatibles.",
    },
    check: {
      title: "Revisar mis cámaras",
      description:
        "Tres preguntas rápidas para saber si VX44 funciona con las cámaras y el DVR que ya tiene.",
    },
    sales: {
      title: "Hablar con ventas",
      description:
        "Reserve una llamada de 30 minutos con VX44 y reciba un precio pensado para sus cámaras y locales.",
    },
    privacy: {
      title: "Política de privacidad",
      description: "Qué datos recopila VX44 AI Monitoring, para qué y cómo los trata.",
    },
    terms: {
      title: "Términos y condiciones",
      description:
        "Los términos que se aplican al sitio web de VX44 AI Monitoring, a sus servicios de monitoreo y al soporte relacionado.",
    },
    notFound: "Página no encontrada",
  },

  common: {
    skipToContent: "Saltar al contenido",
    homeLabel: "Inicio de VX44 AI Monitoring",
    bookDemo: "Reservar una demo",
    checkCameras: "Revisar mis cámaras",
    talkToSales: "Hablar con ventas",
    mainNav: "Principal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    stockFootage: "Video de archivo, solo ilustrativo",
  },

  nav: {
    howItWorks: "Cómo funciona",
    liveAi: "IA en vivo",
    features: "Funciones",
    pricing: "Precios",
    faq: "Preguntas",
  },

  home: {
    headline: ["Sus cámaras lo ven todo.", "Ahora alguien está mirando."],
    sub: "La IA vigila las cámaras que ya tiene. Un operador capacitado de VX44 revisa cada alerta antes de contactar a nadie.",
    alert: {
      event: "Persona detectada en la entrada",
      verified: "Verificado. Contacto del local avisado.",
    },
    compatibility:
      "Funciona con los DVR {hikvision} y {dahua} que ya tiene. ¿Otra marca? {link}.",
    compatibilityLink: "Pídanos que lo revisemos",
    compatibilityLabel: "Compatibilidad",
    how: {
      title: "Cómo funciona",
      intro: "Desde que una cámara ve algo hasta que usted se entera.",
      steps: [
        {
          title: "Detectar",
          body: "La IA vigila sus cámaras y marca personas y vehículos en cuanto aparecen.",
        },
        {
          title: "Verificar",
          body: "Un operador capacitado de VX44 revisa cada alerta, así las falsas alarmas se quedan aquí.",
        },
        {
          title: "Responder",
          body: "Si es real, avisamos a las personas que usted eligió, siguiendo el plan acordado para su local.",
        },
        {
          title: "Informar",
          body: "Cada evento queda registrado, para que vea qué pasó y qué se hizo.",
        },
      ],
    },
    live: {
      title: "Qué busca la IA",
      intro: "Marca los momentos importantes, para que una persona solo revise lo que cuenta.",
      slots: [
        {
          title: "Personas",
          body: "Marca a las personas en cámara, para que no tenga que revisar cada sombra y cada faro que pasa.",
        },
        { title: "Vehículos", body: "Marca autos y camiones que entran en las zonas que le importan." },
        {
          title: "Fuera de horario",
          body: "Vigila con más atención cuando su local debería estar vacío, en el horario que usted fije.",
        },
      ],
    },
    features: {
      title: "Lo que obtiene",
      items: [
        {
          title: "Conserve sus cámaras",
          body: "Funciona con el DVR y las cámaras que ya tiene. Solo agregamos un pequeño adaptador.",
        },
        {
          title: "Detección con IA",
          body: "La detección de personas y vehículos convierte horas de video en los momentos que importan.",
        },
        {
          title: "Monitoreo en su horario",
          body: "Elija las horas en que se vigila cada local, según cuándo abre y cierra.",
        },
        {
          title: "Véalo desde cualquier lugar",
          body: "Revise sus cámaras desde el teléfono o la laptop, cuando quiera.",
        },
        {
          title: "Grabación en la nube",
          body: "El video se guarda fuera del local, con un proveedor de confianza de almacenamiento de video en la nube, lejos del grabador.",
        },
        {
          title: "Todos sus locales en una cuenta",
          body: "Agregue ubicaciones a medida que crece y adminístrelas todas en un solo lugar.",
        },
      ],
    },
    pricing: {
      title: "Precios pensados para sus locales",
      intro:
        "Cada local es distinto. Díganos cuántas cámaras y ubicaciones tiene, y le daremos un precio a su medida.",
      cardTitle: "Precio a medida",
      summary: "Según sus cámaras y locales",
      includesTitle: "Lo que puede incluir su plan",
      includes: [
        "Alertas de movimiento con IA",
        "Grabación en la nube",
        "Vea sus cámaras desde cualquier lugar",
        "Verificación de alertas",
        "Un plan de respuesta acordado",
        "Horario de monitoreo por local",
        "Una cuenta para todas sus ubicaciones",
        "Facturación unificada",
      ],
    },
    faq: {
      title: "Preguntas frecuentes",
      items: [
        {
          question: "¿Funcionará con mis cámaras?",
          answer:
            "VX44 está hecho para DVR Hikvision y Dahua. ¿Tiene otra marca o no está seguro? Envíenos los datos y lo revisaremos antes de que se comprometa a nada.",
        },
        {
          question: "¿Qué implica la instalación?",
          answer:
            "Tres pasos. Revisamos que su sistema sea compatible. Le enviamos un pequeño adaptador a la nube que se conecta a su DVR. Una vez instalado, el monitoreo empieza. Normalmente necesitará la contraseña de administrador de su DVR. Si no la tiene, díganos y vemos las opciones juntos.",
        },
        {
          question: "¿Dónde se guarda mi video?",
          answer:
            "El video lo guarda un proveedor de confianza de almacenamiento de video en la nube, que actúa como nuestro subencargado. Nuestra política de privacidad explica qué recopilamos y cómo lo tratamos.",
        },
        {
          question: "¿Cómo funcionan los precios?",
          answer:
            "Cada precio se arma para su negocio. Díganos cuántas cámaras y locales tiene, y le prepararemos una cotización, normalmente después de una revisión rápida de compatibilidad.",
        },
      ],
    },
    cta: {
      title: "¿Sus cámaras están listas?",
      body: "Cuéntenos cómo es su sistema. Revisaremos que funcione antes de que se comprometa a nada.",
    },
  },

  footer: {
    tagline:
      "Monitoreo con IA para las cámaras que ya tiene. Un operador capacitado de VX44 revisa cada alerta.",
    explore: "Explorar",
    getStarted: "Empezar",
    contact: "Contacto",
    email: "Correo",
    phone: "Teléfono",
    address: "Dirección",
    rights: "Todos los derechos reservados.",
    legal: "Legal",
    privacy: "Privacidad",
    terms: "Términos",
    footerNav: "Pie de página",
  },

  demo: {
    heading: "Revisemos sus cámaras",
    intro: "Cuéntenos un poco sobre su local y el sistema que tiene ahora.",
    nextTitle: "Qué pasa después",
    nextSteps: [
      "Revisamos sus datos y comprobamos la compatibilidad de su DVR.",
      "Le mostramos cómo funciona el monitoreo y le preparamos un precio para sus cámaras y locales.",
      "Una vez aprobado, le enviamos un adaptador a la nube para su DVR y lo dejamos en marcha.",
    ],
  },

  sales: {
    heading: "Reciba un precio para sus locales",
    intro:
      "Elija un horario para una llamada de 30 minutos. Conoceremos su sistema y le prepararemos un precio a su medida.",
    bringTitle: "Conviene tener a mano",
    bring: [
      "Cuántas cámaras tiene",
      "Cuántos locales cubren",
      "La marca de su DVR o NVR, si la sabe",
    ],
  },

  check: {
    heading: "¿VX44 funciona con lo que ya tiene?",
    intro: "Responda tres preguntas y véalo al instante. No pedimos datos de contacto.",
    q1: "1. ¿De qué marca es su DVR o NVR?",
    brandHint: "La marca suele estar impresa en el frente del grabador.",
    q2: "2. ¿Cuántas cámaras tiene, más o menos?",
    q3: "3. ¿Sabe la contraseña de administrador de su DVR?",
    passwordHint: "Solo sí o no. Nunca le pedimos la contraseña.",
    submit: "Revisar mis cámaras",
    compatible: "PARECE COMPATIBLE",
    needsCheck: "NECESITA UNA REVISIÓN RÁPIDA",
    goodNews: "Buenas noticias: VX44 está hecho para DVR {brand}.",
    weWillCheck: "Revisaremos su sistema antes de que se comprometa a nada.",
    stillConfirm: "Aun así, confirmamos cada sistema con una revisión de compatibilidad antes de aprobarlo.",
    sendDetails: "Envíenos los datos y revisaremos la compatibilidad de su DVR.",
    passwordKnown: "Sabe la contraseña de administrador de su DVR, que es lo que suele necesitar la instalación.",
    passwordUnknown:
      "La instalación suele necesitar la contraseña de administrador del DVR. Es algo común y vemos las opciones juntos.",
    pricing:
      "El precio se adapta a cada negocio. Le prepararemos un precio para sus cámaras ({count}) y los locales que cubren.",
    bookWithDetails: "Reservar una demo con estos datos",
    changeAnswers: "Cambiar mis respuestas",
  },

  options: {
    brands: { Hikvision: "Hikvision", Dahua: "Dahua", Other: "Otra", "Not sure": "No estoy seguro" },
    password: { yes: "Sí", no: "No", unsure: "No estoy seguro" },
  },

  leadForm: {
    name: "Nombre",
    business: "Negocio",
    email: "Correo electrónico",
    phone: "Teléfono",
    city: "Ciudad",
    state: "Estado",
    cameras: "Cámaras (aprox.)",
    brand: "Marca del DVR",
    selectBrand: "Elija una marca",
    passwordLegend: "¿Sabe la contraseña de administrador de su DVR?",
    passwordHint: "Solo díganos sí o no. Por favor, no nos envíe la contraseña.",
    message: "Mensaje (opcional)",
    submit: "Reservar mi demo",
    sending: "Enviando...",
    privacyNote: "Usamos estos datos para responder a su solicitud. Vea nuestra {link}.",
    privacyLink: "política de privacidad",
    received: "SOLICITUD RECIBIDA",
    thanks: "Gracias. Ya tenemos sus datos.",
    thanksBody:
      "Elija ahora un horario para su demo, o nos pondremos en contacto para coordinarla. En cualquier caso, primero revisaremos que sus cámaras sean compatibles.",
    pickTime: "Elija un horario para su demo",
    pickTimeBody: "Elija un espacio de 30 minutos y cuéntenos sobre sus cámaras al reservar.",
    errors: {
      securityCheck: "Complete la verificación de seguridad.",
      network: "No pudimos conectar con el servidor. Revise su conexión e inténtelo de nuevo.",
      checkFields: "Revise los campos marcados.",
      tooMany: "Demasiadas solicitudes desde esta conexión. Inténtelo más tarde.",
      generic: "No pudimos enviar su solicitud. Inténtelo de nuevo en un momento.",
      fields: {
        fullName: "Escriba su nombre.",
        businessName: "Escriba el nombre de su negocio.",
        email: "Escriba un correo electrónico válido.",
        phone: "Escriba un número de teléfono válido.",
        city: "Escriba su ciudad.",
        state: "Escriba su estado.",
        cameraCount: "Escriba cuántas cámaras tiene, más o menos.",
        dvrBrand: "Elija una marca de DVR.",
        knowsDvrPassword: "Elija una respuesta.",
        message: "El mensaje debe tener menos de 4000 caracteres.",
        turnstileToken: "Complete la verificación de seguridad.",
      },
    },
  },

  calendly: {
    loading: "CARGANDO HORARIOS DISPONIBLES",
    label: "Reservar un horario",
    failed: "El calendario no se cargó.",
    openPage: "Abrir la página de reservas",
  },

  legal: {
    onThisPage: "En esta página",
    translationNotice:
      "Esta es una traducción ofrecida para su comodidad. Si difiere de la versión en inglés, prevalece la versión en inglés.",
    effectiveDate: "Fecha de entrada en vigor:",
  },

  notFound: {
    heading: "No encontramos esa página",
    body: "Puede que el enlace esté desactualizado o que la dirección tenga un error.",
    home: "Volver al inicio",
  },

  errorPage: {
    heading: "Algo salió mal",
    body: "Esta página no se cargó correctamente. Inténtelo de nuevo o vuelva en unos minutos.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
    reference: "Referencia:",
  },
};

export default es;
