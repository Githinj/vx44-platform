import type { Dictionary } from "./en";

// Portuguese (Brazil). AI-drafted; have a native speaker review before launch.
const pt: Dictionary = {
  meta: {
    title: "VX44 AI Monitoring | Suas câmeras veem tudo. Agora alguém está de olho.",
    description:
      "Monitoramento com IA para as câmeras que você já tem. Detectar, verificar, responder e relatar o que acontece no seu local.",
    ogDescription: "Suas câmeras veem tudo. Agora alguém está de olho.",
    demo: {
      title: "Agendar uma demonstração",
      description: "Agende uma demonstração da VX44 e descubra se as suas câmeras atuais são compatíveis.",
    },
    check: {
      title: "Verificar minhas câmeras",
      description:
        "Três perguntas rápidas para saber se a VX44 funciona com as câmeras e o DVR que você já tem.",
    },
    sales: {
      title: "Falar com vendas",
      description:
        "Agende uma ligação de 30 minutos com a VX44 e receba um preço pensado para as suas câmeras e unidades.",
    },
    privacy: {
      title: "Política de privacidade",
      description: "O que a VX44 AI Monitoring coleta, por quê e como esses dados são tratados.",
    },
    terms: {
      title: "Termos e condições",
      description:
        "Os termos que se aplicam ao site da VX44 AI Monitoring, aos serviços de monitoramento e ao suporte relacionado.",
    },
    notFound: "Página não encontrada",
  },

  common: {
    skipToContent: "Pular para o conteúdo",
    homeLabel: "Início da VX44 AI Monitoring",
    bookDemo: "Agendar uma demo",
    checkCameras: "Verificar minhas câmeras",
    talkToSales: "Falar com vendas",
    mainNav: "Principal",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    language: "Idioma",
    stockFootage: "Vídeo ilustrativo de banco de imagens",
  },

  nav: {
    howItWorks: "Como funciona",
    liveAi: "IA ao vivo",
    features: "Recursos",
    pricing: "Preços",
    faq: "Dúvidas",
  },

  home: {
    headline: ["Suas câmeras veem tudo.", "Agora alguém está de olho."],
    sub: "A IA vigia as câmeras que você já tem. Um operador treinado da VX44 confere cada alerta antes de qualquer contato.",
    alert: {
      event: "Pessoa detectada na entrada",
      verified: "Verificado. Contato do local avisado.",
    },
    compatibility:
      "Funciona com os DVRs {hikvision} e {dahua} que você já tem. Outra marca? {link}.",
    compatibilityLink: "Peça para verificarmos",
    compatibilityLabel: "Compatibilidade",
    how: {
      title: "Como funciona",
      intro: "Do momento em que uma câmera vê algo até o momento em que você fica sabendo.",
      steps: [
        {
          title: "Detectar",
          body: "A IA vigia as suas câmeras e sinaliza pessoas e veículos assim que aparecem.",
        },
        {
          title: "Verificar",
          body: "Um operador treinado da VX44 confere cada alerta, e os alarmes falsos param por aqui.",
        },
        {
          title: "Responder",
          body: "Se for real, avisamos as pessoas que você escolheu, seguindo o plano combinado para o seu local.",
        },
        {
          title: "Relatar",
          body: "Cada evento fica registrado, para você ver o que aconteceu e o que foi feito.",
        },
      ],
    },
    live: {
      title: "O que a IA procura",
      intro: "Ela sinaliza os momentos importantes, para que uma pessoa revise só o que conta.",
      slots: [
        {
          title: "Pessoas",
          body: "Sinaliza pessoas na imagem, para você não ter que revisar cada sombra e cada farol que passa.",
        },
        { title: "Veículos", body: "Sinaliza carros e caminhões que entram nas áreas que importam para você." },
        {
          title: "Fora do horário",
          body: "Presta mais atenção quando o seu local deveria estar vazio, nos horários que você definir.",
        },
      ],
    },
    features: {
      title: "O que você recebe",
      items: [
        {
          title: "Mantenha suas câmeras",
          body: "Funciona com o DVR e as câmeras que você já tem. Só adicionamos um pequeno adaptador.",
        },
        {
          title: "Detecção por IA",
          body: "A detecção de pessoas e veículos transforma horas de vídeo nos momentos que importam.",
        },
        {
          title: "Monitoramento no seu horário",
          body: "Escolha os horários em que cada local é vigiado, conforme a abertura e o fechamento.",
        },
        {
          title: "Veja de qualquer lugar",
          body: "Confira suas câmeras pelo celular ou notebook, quando quiser.",
        },
        {
          title: "Gravação na nuvem",
          body: "O vídeo fica guardado fora do local, com um provedor confiável de armazenamento de vídeo em nuvem, longe do gravador.",
        },
        {
          title: "Todas as unidades em uma conta",
          body: "Adicione locais conforme você cresce e gerencie todos em um só lugar.",
        },
      ],
    },
    pricing: {
      title: "Preços pensados para os seus locais",
      intro:
        "Cada local é diferente. Diga quantas câmeras e unidades você tem, e faremos um orçamento sob medida.",
      cardTitle: "Preço sob medida",
      summary: "De acordo com suas câmeras e unidades",
      includesTitle: "O que o seu plano pode incluir",
      includes: [
        "Alertas de movimento com IA",
        "Gravação na nuvem",
        "Veja suas câmeras de qualquer lugar",
        "Verificação de alertas",
        "Um plano de resposta combinado",
        "Horário de monitoramento por local",
        "Uma conta para todas as unidades",
        "Cobrança unificada",
      ],
    },
    faq: {
      title: "Perguntas frequentes",
      items: [
        {
          question: "Vai funcionar com as minhas câmeras?",
          answer:
            "A VX44 foi feita para DVRs Hikvision e Dahua. Tem outra marca ou não tem certeza? Envie os detalhes e verificamos antes de qualquer compromisso.",
        },
        {
          question: "Como é a instalação?",
          answer:
            "São três passos. Verificamos se o seu sistema é compatível. Enviamos um pequeno adaptador de nuvem que se conecta ao seu DVR. Depois de instalado, o monitoramento começa. Normalmente você vai precisar da senha de administrador do DVR. Se não tiver, avise e veremos as opções juntos.",
        },
        {
          question: "Onde ficam guardados os meus vídeos?",
          answer:
            "Os vídeos são guardados por um provedor confiável de armazenamento de vídeo em nuvem, que atua como nosso suboperador. Nossa política de privacidade explica o que coletamos e como tratamos.",
        },
        {
          question: "Como funcionam os preços?",
          answer:
            "Cada preço é montado para o seu negócio. Diga quantas câmeras e unidades você tem, e preparamos um orçamento, normalmente depois de uma verificação rápida de compatibilidade.",
        },
      ],
    },
    cta: {
      title: "Suas câmeras estão prontas?",
      body: "Conte como é o seu sistema. Verificamos se funciona antes de qualquer compromisso.",
    },
  },

  footer: {
    tagline:
      "Monitoramento com IA para as câmeras que você já tem. Cada alerta é conferido por um operador treinado da VX44.",
    explore: "Explorar",
    getStarted: "Começar",
    contact: "Contato",
    email: "E-mail",
    phone: "Telefone",
    address: "Endereço",
    rights: "Todos os direitos reservados.",
    legal: "Jurídico",
    privacy: "Privacidade",
    terms: "Termos",
    footerNav: "Rodapé",
  },

  demo: {
    heading: "Vamos verificar suas câmeras",
    intro: "Conte um pouco sobre o seu local e o sistema que você tem hoje.",
    nextTitle: "O que acontece depois",
    nextSteps: [
      "Analisamos seus dados e verificamos a compatibilidade do seu DVR.",
      "Mostramos como o monitoramento funciona e montamos um preço para suas câmeras e unidades.",
      "Depois da aprovação, enviamos um adaptador de nuvem para o seu DVR e colocamos tudo para funcionar.",
    ],
  },

  sales: {
    heading: "Receba um preço para os seus locais",
    intro:
      "Escolha um horário para uma ligação de 30 minutos. Vamos conhecer o seu sistema e montar um preço sob medida.",
    bringTitle: "Bom ter em mãos",
    bring: [
      "Quantas câmeras você tem",
      "Quantas unidades elas cobrem",
      "A marca do seu DVR ou NVR, se souber",
    ],
  },

  check: {
    heading: "A VX44 funciona com o que você tem?",
    intro: "Responda três perguntas e veja na hora. Não pedimos dados de contato.",
    q1: "1. Qual é a marca do seu DVR ou NVR?",
    brandHint: "A marca costuma estar impressa na frente do gravador.",
    q2: "2. Quantas câmeras você tem, mais ou menos?",
    q3: "3. Você sabe a senha de administrador do seu DVR?",
    passwordHint: "Só sim ou não. Nunca pedimos a senha em si.",
    submit: "Verificar minhas câmeras",
    compatible: "PARECE COMPATÍVEL",
    needsCheck: "PRECISA DE UMA VERIFICAÇÃO RÁPIDA",
    goodNews: "Boa notícia: a VX44 foi feita para DVRs {brand}.",
    weWillCheck: "Vamos verificar o seu sistema antes de qualquer compromisso.",
    stillConfirm: "Mesmo assim, confirmamos cada sistema com uma verificação de compatibilidade antes da aprovação.",
    sendDetails: "Envie os detalhes e verificamos a compatibilidade do seu DVR.",
    passwordKnown: "Você sabe a senha de administrador do DVR, que é o que a instalação costuma precisar.",
    passwordUnknown:
      "A instalação costuma precisar da senha de administrador do DVR. Isso é comum, e veremos as opções juntos.",
    pricing:
      "O preço é feito para cada negócio. Vamos montar um preço para as suas câmeras ({count}) e as unidades que elas cobrem.",
    bookWithDetails: "Agendar uma demo com esses dados",
    changeAnswers: "Alterar minhas respostas",
  },

  options: {
    brands: { Hikvision: "Hikvision", Dahua: "Dahua", Other: "Outra", "Not sure": "Não sei" },
    password: { yes: "Sim", no: "Não", unsure: "Não sei" },
  },

  leadForm: {
    name: "Nome",
    business: "Empresa",
    email: "E-mail",
    phone: "Telefone",
    city: "Cidade",
    state: "Estado",
    cameras: "Câmeras (aprox.)",
    brand: "Marca do DVR",
    selectBrand: "Escolha uma marca",
    passwordLegend: "Você sabe a senha de administrador do seu DVR?",
    passwordHint: "É só dizer sim ou não. Por favor, não nos envie a senha.",
    message: "Mensagem (opcional)",
    submit: "Agendar minha demo",
    sending: "Enviando...",
    privacyNote: "Usamos esses dados para responder à sua solicitação. Veja nossa {link}.",
    privacyLink: "política de privacidade",
    received: "SOLICITAÇÃO RECEBIDA",
    thanks: "Obrigado. Recebemos seus dados.",
    thanksBody:
      "Escolha agora um horário para a sua demo, ou entraremos em contato para combinar. De qualquer forma, primeiro verificamos se as suas câmeras são compatíveis.",
    pickTime: "Escolha um horário para a sua demo",
    pickTimeBody: "Escolha um horário de 30 minutos e conte sobre as suas câmeras ao agendar.",
    errors: {
      securityCheck: "Conclua a verificação de segurança.",
      network: "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.",
      checkFields: "Confira os campos destacados.",
      tooMany: "Muitas solicitações desta conexão. Tente novamente mais tarde.",
      generic: "Não conseguimos enviar sua solicitação. Tente de novo em instantes.",
      fields: {
        fullName: "Informe seu nome.",
        businessName: "Informe o nome da empresa.",
        email: "Informe um e-mail válido.",
        phone: "Informe um telefone válido.",
        city: "Informe sua cidade.",
        state: "Informe seu estado.",
        cameraCount: "Informe mais ou menos quantas câmeras você tem.",
        dvrBrand: "Escolha uma marca de DVR.",
        knowsDvrPassword: "Escolha uma resposta.",
        message: "A mensagem deve ter menos de 4000 caracteres.",
        turnstileToken: "Conclua a verificação de segurança.",
      },
    },
  },

  calendly: {
    loading: "CARREGANDO HORÁRIOS DISPONÍVEIS",
    label: "Agendar um horário",
    failed: "O calendário não carregou.",
    openPage: "Abrir a página de agendamento",
  },

  legal: {
    onThisPage: "Nesta página",
    translationNotice:
      "Esta é uma tradução oferecida para sua conveniência. Se houver diferença em relação à versão em inglês, prevalece a versão em inglês.",
    effectiveDate: "Data de vigência:",
  },

  notFound: {
    heading: "Não encontramos essa página",
    body: "O link pode estar desatualizado, ou o endereço pode ter um erro de digitação.",
    home: "Voltar ao início",
  },

  errorPage: {
    heading: "Algo deu errado",
    body: "Esta página não carregou corretamente. Tente de novo ou volte em alguns minutos.",
    retry: "Tentar de novo",
    home: "Voltar ao início",
    reference: "Referência:",
  },
};

export default pt;
