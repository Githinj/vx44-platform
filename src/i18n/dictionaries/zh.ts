import type { Dictionary } from "./en";

// Chinese (Simplified). AI-drafted; have a native speaker review before launch.
const zh: Dictionary = {
  meta: {
    title: "VX44 AI Monitoring | 您的摄像头看见一切。现在，有人在看着。",
    description: "为您现有的摄像头加上 AI 监控。对您场所发生的事情进行检测、核实、响应和记录。",
    ogDescription: "您的摄像头看见一切。现在，有人在看着。",
    demo: {
      title: "预约演示",
      description: "预约 VX44 演示，了解您现有的摄像头是否兼容。",
    },
    check: {
      title: "检查我的摄像头",
      description: "三个简单问题，看看 VX44 能否与您现有的摄像头和硬盘录像机（DVR）配合使用。",
    },
    sales: {
      title: "联系销售",
      description: "预约与 VX44 的 30 分钟通话，获取根据您的摄像头和场所量身定制的报价。",
    },
    privacy: {
      title: "隐私政策",
      description: "VX44 AI Monitoring 收集哪些信息、为什么收集以及如何处理。",
    },
    terms: {
      title: "条款与条件",
      description: "适用于 VX44 AI Monitoring 网站、监控服务及相关支持的条款。",
    },
    notFound: "未找到页面",
  },

  common: {
    skipToContent: "跳到正文",
    homeLabel: "VX44 AI Monitoring 首页",
    bookDemo: "预约演示",
    checkCameras: "检查我的摄像头",
    talkToSales: "联系销售",
    mainNav: "主导航",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    language: "语言",
    stockFootage: "图库视频，仅作示意",
  },

  nav: {
    howItWorks: "工作原理",
    liveAi: "实时 AI",
    features: "功能",
    pricing: "价格",
    faq: "常见问题",
  },

  home: {
    headline: ["您的摄像头看见一切。", "现在，有人在看着。"],
    sub: "AI 看守您现有的摄像头。每一条警报都会先由受过培训的 VX44 值班员核实，然后才会联系任何人。",
    alert: {
      event: "前院检测到人员",
      verified: "已核实。已通知场所联系人。",
    },
    compatibility: "适用于您现有的 {hikvision} 和 {dahua} 硬盘录像机。其他品牌？{link}。",
    compatibilityLink: "请我们帮您检查",
    compatibilityLabel: "兼容性",
    how: {
      title: "工作原理",
      intro: "从摄像头看到情况，到您得知消息。",
      steps: [
        { title: "检测", body: "AI 看守您的摄像头画面，人员和车辆一出现就会标记。" },
        { title: "核实", body: "受过培训的 VX44 值班员核实每一条警报，误报到此为止。" },
        { title: "响应", body: "如果情况属实，我们会按照为您场所约定的方案，联系您指定的人员。" },
        { title: "记录", body: "每个事件都有记录，您可以看到发生了什么、采取了哪些措施。" },
      ],
    },
    live: {
      title: "AI 关注什么",
      intro: "它标记重要时刻，让值班员只需查看真正要紧的内容。",
      slots: [
        { title: "人员", body: "标记画面中的人员，您不必再逐一查看每个影子和路过的车灯。" },
        { title: "车辆", body: "标记驶入您关注区域的轿车和卡车。" },
        { title: "非营业时间", body: "在您设定的时段内，场所本应无人时，会格外留意。" },
      ],
    },
    features: {
      title: "您将获得",
      items: [
        { title: "保留现有摄像头", body: "适用于您现有的硬盘录像机和摄像头。我们只需加装一个小型适配器。" },
        { title: "AI 检测", body: "人员和车辆检测，把数小时的录像浓缩成真正重要的时刻。" },
        { title: "按您的时间表监控", body: "根据开门和关门时间，为每个场所选择监控时段。" },
        { title: "随时随地查看", body: "随时用手机或笔记本电脑查看您的摄像头。" },
        { title: "云端录像", body: "录像由值得信赖的云视频存储服务商异地保存，与录像机分开存放。" },
        { title: "所有场所，一个账户", body: "业务扩展时随时添加地点，并在同一处统一管理。" },
      ],
    },
    pricing: {
      title: "按您的场所定价",
      intro: "每个场所都不一样。告诉我们您有多少摄像头和地点，我们会给出合适的报价。",
      cardTitle: "定制价格",
      summary: "根据您的摄像头和场所",
      includesTitle: "您的方案可以包括",
      includes: [
        "AI 移动警报",
        "云端录像",
        "随时随地查看摄像头",
        "警报核实",
        "约定的响应方案",
        "每个场所单独设定监控时段",
        "一个账户管理所有地点",
        "合并账单",
      ],
    },
    faq: {
      title: "常见问题",
      items: [
        {
          question: "能用在我的摄像头上吗？",
          answer: "VX44 专为海康威视（Hikvision）和大华（Dahua）硬盘录像机打造。其他品牌或者不确定？把详细信息发给我们，在您做出任何承诺之前我们会先检查。",
        },
        {
          question: "安装需要做什么？",
          answer: "共三步。我们检查您的系统是否兼容。我们寄出一个连接到您硬盘录像机的小型云端适配器。安装完成后，监控即刻启动。通常需要您的硬盘录像机管理员密码。如果您没有，请告诉我们，我们一起商量办法。",
        },
        {
          question: "我的录像存放在哪里？",
          answer: "录像由值得信赖的云视频存储服务商保存，该服务商作为我们的次级处理方。我们的隐私政策说明了我们收集哪些信息以及如何处理。",
        },
        {
          question: "价格怎么算？",
          answer: "每个报价都根据您的业务制定。告诉我们您有多少摄像头和场所，我们会为您准备报价，通常在快速兼容性检查之后。",
        },
      ],
    },
    cta: {
      title: "您的摄像头准备好了吗？",
      body: "告诉我们您的设备情况。在您做出任何承诺之前，我们会先确认它能用。",
    },
  },

  footer: {
    tagline: "为您现有的摄像头加上 AI 监控。每一条警报都由受过培训的 VX44 值班员核实。",
    explore: "浏览",
    getStarted: "开始使用",
    contact: "联系方式",
    email: "电子邮件",
    phone: "电话",
    address: "地址",
    rights: "保留所有权利。",
    legal: "法律信息",
    privacy: "隐私",
    terms: "条款",
    footerNav: "页脚",
  },

  demo: {
    heading: "我们来检查您的摄像头",
    intro: "简单介绍一下您的场所和现有的系统。",
    nextTitle: "接下来",
    nextSteps: [
      "我们查看您的信息，并检查您的硬盘录像机是否兼容。",
      "我们向您演示监控如何运作，并为您的摄像头和场所制定价格。",
      "通过审核后，我们会为您的硬盘录像机寄出云端适配器，帮您正式启用。",
    ],
  },

  sales: {
    heading: "获取您场所的报价",
    intro: "选择一个时间进行 30 分钟通话。我们会了解您的设备情况，并给出合适的价格。",
    bringTitle: "建议提前准备",
    bring: ["您有多少个摄像头", "它们覆盖多少个场所", "您的硬盘录像机（DVR 或 NVR）品牌，如果知道的话"],
  },

  check: {
    heading: "VX44 能和您现有的设备配合使用吗？",
    intro: "回答三个问题，立即知道结果。无需留下联系方式。",
    q1: "1. 您的硬盘录像机（DVR 或 NVR）是什么品牌？",
    brandHint: "品牌名称通常印在录像机正面。",
    q2: "2. 您大约有多少个摄像头？",
    q3: "3. 您知道硬盘录像机的管理员密码吗？",
    passwordHint: "只需回答是或否。我们从不索要密码本身。",
    submit: "检查我的摄像头",
    compatible: "看起来兼容",
    needsCheck: "需要快速检查",
    goodNews: "好消息：VX44 专为 {brand} 硬盘录像机打造。",
    weWillCheck: "在您做出任何承诺之前，我们会先检查您的系统。",
    stillConfirm: "在审核通过之前，我们仍会对每套系统进行兼容性检查。",
    sendDetails: "把详细信息发给我们，我们会检查您的硬盘录像机是否兼容。",
    passwordKnown: "您知道硬盘录像机的管理员密码，这正是安装通常需要的。",
    passwordUnknown: "安装通常需要硬盘录像机的管理员密码。这种情况很常见，我们会一起商量办法。",
    pricing: "价格根据每家企业量身定制。我们会为您的摄像头（{count} 个）及其覆盖的场所制定价格。",
    bookWithDetails: "用这些信息预约演示",
    changeAnswers: "修改我的回答",
  },

  options: {
    brands: { Hikvision: "海康威视 Hikvision", Dahua: "大华 Dahua", Other: "其他", "Not sure": "不确定" },
    password: { yes: "是", no: "否", unsure: "不确定" },
  },

  leadForm: {
    name: "姓名",
    business: "企业名称",
    email: "电子邮件",
    phone: "电话",
    city: "城市",
    state: "州",
    cameras: "摄像头数量（大约）",
    brand: "硬盘录像机品牌",
    selectBrand: "选择品牌",
    passwordLegend: "您知道硬盘录像机的管理员密码吗？",
    passwordHint: "只需告诉我们是或否。请不要把密码发给我们。",
    message: "留言（选填）",
    submit: "预约我的演示",
    sending: "正在发送…",
    privacyNote: "我们使用这些信息来回复您的请求。请参阅我们的{link}。",
    privacyLink: "隐私政策",
    received: "已收到请求",
    thanks: "谢谢，我们已收到您的信息。",
    thanksBody: "现在就为演示选择一个时间，或者等我们联系您安排。无论哪种方式，我们都会先检查您的摄像头是否兼容。",
    pickTime: "为您的演示选择时间",
    pickTimeBody: "选择一个 30 分钟的时段，并在预约时介绍一下您的摄像头。",
    errors: {
      securityCheck: "请完成安全验证。",
      network: "无法连接服务器。请检查网络后重试。",
      checkFields: "请检查标出的字段。",
      tooMany: "此网络的请求过多。请稍后再试。",
      generic: "您的请求未能发送。请稍后再试。",
      fields: {
        fullName: "请输入您的姓名。",
        businessName: "请输入企业名称。",
        email: "请输入有效的电子邮件地址。",
        phone: "请输入有效的电话号码。",
        city: "请输入您所在的城市。",
        state: "请输入您所在的州。",
        cameraCount: "请输入大约有多少个摄像头。",
        dvrBrand: "请选择硬盘录像机品牌。",
        knowsDvrPassword: "请选择一个答案。",
        message: "留言请少于 4000 个字符。",
        turnstileToken: "请完成安全验证。",
      },
    },
  },

  calendly: {
    loading: "正在加载可预约时间",
    label: "预约时间",
    failed: "日历未能加载。",
    openPage: "打开预约页面",
  },

  legal: {
    onThisPage: "本页内容",
    translationNotice: "本译文仅为方便阅读而提供。如与英文版本有任何不一致，以英文版本为准。",
    effectiveDate: "生效日期：",
  },

  notFound: {
    heading: "找不到该页面",
    body: "链接可能已过期，或者网址中有拼写错误。",
    home: "返回首页",
  },

  errorPage: {
    heading: "出现了问题",
    body: "此页面未能正常加载。请重试，或几分钟后再来。",
    retry: "重试",
    home: "返回首页",
    reference: "参考编号：",
  },
};

export default zh;
