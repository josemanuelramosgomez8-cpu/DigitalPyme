export type Currency = "PEN" | "USD"

export interface PaymentSeal {
  id: string
  name: string
  type: "local" | "international"
  bgColor: string
  textColor: string
  label: string
}

export interface HeroSlideTheme {
  bgGradient: string
  ctaBg: string
  accentGlow: string
  badgeStyle: string
  tagColor: string
}

export interface CleanHeroSlide {
  id: number
  categoryKey: string
  tabLabel: string
  tabIcon: "holiday" | "web" | "store" | "growth" | "brand"
  badgeText: string
  badgeDiscount?: string
  headlinePrefix: string
  headlineHighlight: string
  headlineSuffix: string
  subtitle: string
  ctaLabel: string
  serviceTarget: string
  pricePEN: string
  priceUSD: string
  amountPEN: number
  amountUSD: number
  image: string
  imageAlt: string
  deviceTag: string
  theme: HeroSlideTheme
}

export const PAYMENT_SEALS: PaymentSeal[] = [
  {
    id: "yape",
    name: "Yape",
    type: "local",
    bgColor: "#742284",
    textColor: "#ffffff",
    label: "Yape QR",
  },
  {
    id: "plin",
    name: "Plin",
    type: "local",
    bgColor: "#00b4d8",
    textColor: "#ffffff",
    label: "Plin",
  },
  {
    id: "visa",
    name: "Visa",
    type: "international",
    bgColor: "#1a1f71",
    textColor: "#ffffff",
    label: "Visa / MC",
  },
  {
    id: "stripe",
    name: "Stripe",
    type: "international",
    bgColor: "#635bff",
    textColor: "#ffffff",
    label: "Stripe",
  },
  {
    id: "paypal",
    name: "PayPal",
    type: "international",
    bgColor: "#003087",
    textColor: "#ffffff",
    label: "PayPal",
  },
]

export const HERO_SLIDES: CleanHeroSlide[] = [
  {
    id: 0,
    categoryKey: "navidad",
    tabLabel: "Navidad 20% OFF",
    tabIcon: "holiday",
    badgeText: "Campaña Navideña & Cierre de Año 2026",
    badgeDiscount: "20% OFF",
    headlinePrefix: "Impulsa tus ventas",
    headlineHighlight: "esta Navidad",
    headlineSuffix: "con tu web lista.",
    subtitle:
      "Asegura tu sitio web corporativo o tienda virtual antes del cierre del año. Sitios ultra optimizados para captar más compradores en temporada alta.",
    ctaLabel: "Aprovechar 20% OFF Navideño",
    serviceTarget: "Páginas web",
    pricePEN: "Desde S/ 760",
    priceUSD: "Desde $ 210 USD",
    amountPEN: 760,
    amountUSD: 210,
    image: "/images/banners/campana-navidena.png",
    imageAlt: "Campaña Navideña 2026 DigitalPyme",
    deviceTag: "🎄 Especial Navidad 2026 · Entrega Rápida",
    theme: {
      bgGradient:
        "linear-gradient(135deg, #7f1d1d 0%, #991b1b 45%, #b91c1c 100%)",
      ctaBg: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold",
      accentGlow: "rgba(251, 191, 36, 0.35)",
      badgeStyle: "bg-black/35 border-amber-300/60 text-amber-200",
      tagColor: "text-amber-300",
    },
  },
  {
    id: 1,
    categoryKey: "paginas-web",
    tabLabel: "Páginas Web",
    tabIcon: "web",
    badgeText: "Presencia Corporativa Sólida",
    headlinePrefix: "Páginas web profesionales",
    headlineHighlight: "que generan confianza",
    headlineSuffix: "y nuevos clientes.",
    subtitle:
      "Desarrollo a medida con arquitectura moderna, carga ultrarrápida (99/100 PageSpeed) y conexión directa a WhatsApp para cerrar prospectos al instante.",
    ctaLabel: "Solicitar cotización web",
    serviceTarget: "Páginas web",
    pricePEN: "Desde S/ 1,250",
    priceUSD: "Desde $ 340 USD",
    amountPEN: 1250,
    amountUSD: 340,
    image: "/images/banners/paginas-web.jpg",
    imageAlt: "Diseño y desarrollo de páginas web corporativas",
    deviceTag: "⚡ Google PageSpeed 99/100 · SEO Incluido",
    theme: {
      bgGradient:
        "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #0d9488 100%)",
      ctaBg: "bg-[var(--lime)] hover:bg-[var(--lime-dark)] text-[#102c2c] font-extrabold",
      accentGlow: "rgba(201, 244, 91, 0.35)",
      badgeStyle: "bg-black/30 border-emerald-300/50 text-emerald-100",
      tagColor: "text-[var(--lime)]",
    },
  },
  {
    id: 2,
    categoryKey: "tiendas",
    tabLabel: "Tiendas en Línea",
    tabIcon: "store",
    badgeText: "E-commerce & Cobros Automáticos",
    badgeDiscount: "Top Ventas",
    headlinePrefix: "Vende 24/7 con tu propia",
    headlineHighlight: "tienda virtual",
    headlineSuffix: "sin comisiones extra.",
    subtitle:
      "Catálogo autoadministrable, carrito dinámico y pasarelas de pago integradas: cobra al instante con Yape, Plin, tarjetas locales e internacionales.",
    ctaLabel: "Iniciar mi tienda en línea",
    serviceTarget: "Tiendas en línea",
    pricePEN: "Desde S/ 1,950",
    priceUSD: "Desde $ 530 USD",
    amountPEN: 1950,
    amountUSD: 530,
    image: "/images/banners/tiendas-en-linea.png",
    imageAlt: "Tiendas virtuales e-commerce con pasarelas de pago",
    deviceTag: "💳 Yape, Plin y Tarjetas · 0% Comisiones",
    theme: {
      bgGradient:
        "linear-gradient(135deg, #0f2b48 0%, #173f67 45%, #1e558a 100%)",
      ctaBg: "bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-extrabold",
      accentGlow: "rgba(34, 211, 238, 0.35)",
      badgeStyle: "bg-black/30 border-cyan-300/50 text-cyan-100",
      tagColor: "text-cyan-300",
    },
  },
  {
    id: 3,
    categoryKey: "landing-pages",
    tabLabel: "Landing Pages",
    tabIcon: "growth",
    badgeText: "Alta Conversión CRO",
    headlinePrefix: "Landing Pages que",
    headlineHighlight: "multiplican prospectos",
    headlineSuffix: "para tus campañas.",
    subtitle:
      "Páginas de aterrizaje estratégicas diseñadas para campañas de Google Ads y redes sociales. Copywriting persuasivo que convierte clics en ventas.",
    ctaLabel: "Cotizar Landing Page",
    serviceTarget: "Páginas web",
    pricePEN: "Desde S/ 890",
    priceUSD: "Desde $ 240 USD",
    amountPEN: 890,
    amountUSD: 240,
    image: "/images/banners/marketing-digital.jpg",
    imageAlt: "Landing pages de alta conversión para Google y Meta Ads",
    deviceTag: "🎯 Optimizado para Google Ads y WhatsApp",
    theme: {
      bgGradient:
        "linear-gradient(135deg, #134e4a 0%, #0f766e 45%, #14b8a6 100%)",
      ctaBg: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold",
      accentGlow: "rgba(251, 191, 36, 0.35)",
      badgeStyle: "bg-black/30 border-teal-300/50 text-teal-100",
      tagColor: "text-amber-300",
    },
  },
  {
    id: 4,
    categoryKey: "branding",
    tabLabel: "Branding",
    tabIcon: "brand",
    badgeText: "Identidad Digital & UI/UX",
    headlinePrefix: "Branding e imagen de marca",
    headlineHighlight: "para destacar",
    headlineSuffix: "en el mercado digital.",
    subtitle:
      "Diseño de logotipos vectoriales, manuales de marca, tipografías y recursos gráficos de alto impacto para diferenciarte con autoridad.",
    ctaLabel: "Cotizar diseño de marca",
    serviceTarget: "Páginas web",
    pricePEN: "Desde S/ 650",
    priceUSD: "Desde $ 180 USD",
    amountPEN: 650,
    amountUSD: 180,
    image: "/images/banners/branding.jpg",
    imageAlt: "Identidad corporativa y diseño gráfico para PYMEs",
    deviceTag: "🎨 Manual de Marca + Vectoriales SVG",
    theme: {
      bgGradient:
        "linear-gradient(135deg, #2e1065 0%, #4c1d95 45%, #6d28d9 100%)",
      ctaBg: "bg-fuchsia-400 hover:bg-fuchsia-300 text-stone-950 font-extrabold",
      accentGlow: "rgba(232, 121, 249, 0.35)",
      badgeStyle: "bg-black/30 border-purple-300/50 text-purple-100",
      tagColor: "text-fuchsia-300",
    },
  },
]
