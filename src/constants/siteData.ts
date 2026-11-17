import type { ApiService, QuotePaymentPreference } from "../lib/api"

export function separarContacto(
  valor: string,
): { email?: string; telefono?: string } {
  const v = valor.trim()
  return v.includes("@") ? { email: v } : { telefono: v }
}

export function serviceSlug(service: ApiService): string {
  return (
    service.slug ||
    service.nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  )
}

export function formatServiceMeta(service: ApiService): string {
  const price =
    service.precio_desde === null
      ? null
      : Number(service.precio_desde).toLocaleString("en-US")

  if (price === null) {
    return `Cotización a medida${
      service.duracion ? ` · ${service.duracion}` : ""
    }`
  }

  if (service.duracion === "Plan mensual") {
    return `Planes desde S/ ${price} / mes`
  }

  return `Desde S/ ${price}${service.duracion ? ` · ${service.duracion}` : ""}`
}

export function formatCurrency(amount: number | string): string {
  return Number(amount).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const fallbackServices: ApiService[] = [
  {
    nombre: "Páginas web",
    descripcion:
      "Diseño y desarrollo de sitios web adaptables, con páginas acordadas, formulario de contacto y configuración SEO básica.",
    categoria: "Páginas web",
    descripcion_larga:
      "Planificamos y desarrollamos un sitio web adaptable a móviles y computadoras. El alcance se define según las páginas y necesidades acordadas para cada proyecto.",
    incluye: [
      "Estructura y diseño adaptable para las páginas acordadas.",
      "Desarrollo de las páginas incluidas en la propuesta.",
      "Formulario de contacto.",
      "Configuración SEO básica.",
    ],
    precio_desde: null,
    duracion: null,
    activo: true,
    orden: 1,
    slug: "paginas-web",
    category: {
      id: 1,
      nombre: "Páginas web",
      slug: "paginas-web",
      activo: true,
      orden: 1,
    },
  },
  {
    nombre: "Tiendas en línea",
    descripcion:
      "Diseño y desarrollo de tiendas en línea con catálogo, carrito y gestión de pedidos.",
    categoria: "Tiendas en línea",
    descripcion_larga:
      "Creamos una experiencia de compra en línea con catálogo de productos, carrito y flujo de pedidos. Los métodos de pago y envío se configuran según lo acordado para el proyecto.",
    incluye: [
      "Catálogo de productos y páginas de producto.",
      "Carrito y flujo de pedidos.",
      "Configuración de los métodos de pago acordados.",
      "Configuración de las opciones de envío acordadas.",
    ],
    precio_desde: null,
    duracion: null,
    activo: true,
    orden: 2,
    slug: "tiendas-en-linea",
    category: {
      id: 2,
      nombre: "Tiendas en línea",
      slug: "tiendas-en-linea",
      activo: true,
      orden: 2,
    },
  },
  {
    nombre: "Branding",
    descripcion:
      "Desarrollo de una identidad visual coherente con tu marca y las aplicaciones acordadas.",
    categoria: "Branding",
    descripcion_larga:
      "Definimos una línea visual para comunicar tu marca con coherencia. Las propuestas, revisiones y aplicaciones se detallan en el alcance aprobado antes de iniciar.",
    incluye: [
      "Definición de una línea visual para la marca.",
      "Logotipo y versiones en los formatos acordados.",
      "Paleta de colores y selección tipográfica.",
      "Aplicaciones de marca definidas en la propuesta.",
    ],
    precio_desde: null,
    duracion: null,
    activo: true,
    orden: 3,
    slug: "branding",
    category: {
      id: 3,
      nombre: "Branding",
      slug: "branding",
      activo: true,
      orden: 3,
    },
  },
  {
    nombre: "Marketing digital",
    descripcion:
      "Diagnóstico y planificación de acciones digitales según tus objetivos y los canales acordados.",
    categoria: "Marketing digital",
    descripcion_larga:
      "Revisamos los objetivos del negocio y preparamos un plan de acciones digitales. Los canales, la frecuencia y los entregables se definen en la propuesta de cada proyecto.",
    incluye: [
      "Diagnóstico inicial de objetivos y presencia digital.",
      "Plan de acciones para los canales acordados.",
      "Frecuencia y entregables definidos en la propuesta.",
    ],
    precio_desde: null,
    duracion: null,
    activo: true,
    orden: 4,
    slug: "marketing-digital",
    category: {
      id: 4,
      nombre: "Marketing digital",
      slug: "marketing-digital",
      activo: true,
      orden: 4,
    },
  },
  {
    nombre: "Mantenimiento",
    descripcion:
      "Actualizaciones y revisiones técnicas de tu sitio web, según la frecuencia y el alcance acordados.",
    categoria: "Mantenimiento",
    descripcion_larga:
      "Mantenemos y revisamos técnicamente tu sitio web con la frecuencia definida para el servicio. El alcance específico se acuerda antes de iniciar.",
    incluye: [
      "Actualizaciones contempladas en el alcance acordado.",
      "Revisiones técnicas con la frecuencia definida en la propuesta.",
    ],
    precio_desde: null,
    duracion: null,
    activo: true,
    orden: 5,
    slug: "mantenimiento",
    category: {
      id: 5,
      nombre: "Mantenimiento",
      slug: "mantenimiento",
      activo: true,
      orden: 5,
    },
  },
]

export const serviceProposalGuidance: Record<string, {
  description: string
  details: string[]
}> = {
  "paginas-web": {
    description:
      "La estructura y las funciones del sitio se ajustan a lo que necesita comunicar tu negocio y a las acciones que quieres que realicen tus visitantes.",
    details: [
      "Objetivo del sitio y páginas o secciones necesarias.",
      "Textos, fotografías y elementos de identidad disponibles.",
      "Formularios, integraciones u otras funciones que quieras evaluar.",
      "Necesidades de dominio, alojamiento o migración, si aplican.",
    ],
  },
  "tiendas-en-linea": {
    description:
      "La propuesta considera el recorrido de compra y la forma en que tu negocio administra productos y pedidos.",
    details: [
      "Cantidad aproximada de productos y variantes.",
      "Métodos de pago y opciones de envío que deseas ofrecer.",
      "Cómo se recibirán y gestionarán los pedidos.",
      "Integraciones o carga inicial de productos que quieras evaluar.",
    ],
  },
  branding: {
    description:
      "La identidad visual se plantea según la personalidad de tu marca, las personas a quienes se dirige y los usos que tendrá.",
    details: [
      "Público al que se dirige la marca y qué deseas comunicar.",
      "Logotipo, materiales o elementos visuales que ya utilizas.",
      "Referencias visuales y preferencias que quieras compartir.",
      "Formatos y aplicaciones de marca que necesitas.",
    ],
  },
  "marketing-digital": {
    description:
      "El plan se organiza en función de tus objetivos y los canales digitales que tengan sentido para tu negocio.",
    details: [
      "Objetivos principales y productos o servicios a promover.",
      "Público al que quieres llegar.",
      "Canales digitales que utilizas o deseas explorar.",
      "Frecuencia, entregables y criterios de seguimiento por definir.",
    ],
  },
  mantenimiento: {
    description:
      "El alcance se define según la plataforma de tu sitio, su estado actual y la frecuencia de revisión que necesitas.",
    details: [
      "Plataforma y proveedor de alojamiento de tu sitio.",
      "Problemas actuales o tareas técnicas que quieres atender.",
      "Frecuencia de actualizaciones y revisiones deseada.",
      "Tareas de respaldo o monitoreo que quieras incluir en la propuesta.",
    ],
  },
}

export const defaultServiceProposalGuidance = {
  description:
    "Cada propuesta se adapta al objetivo de tu negocio y al alcance que acordemos antes de comenzar.",
  details: [
    "Qué objetivo quieres alcanzar con este servicio.",
    "Qué materiales o información ya tienes disponibles.",
    "Qué funciones o entregables son prioritarios para ti.",
    "Cualquier requisito o fecha importante que debamos considerar.",
  ],
}

export const faqs: [string, string][] = [
  [
    "¿Cuánto cuesta trabajar con DigitalPyme?",
    "El costo depende del servicio, el alcance y los entregables que necesite tu negocio. Revisamos tu idea y te enviamos una propuesta con el alcance, el precio y los plazos antes de empezar.",
  ],
  [
    "¿Atienden empresas fuera de Lima?",
    "Sí, podemos conversar sobre proyectos desde otras ciudades y coordinar la atención de forma virtual. La modalidad para cada servicio se confirma en la propuesta.",
  ],
  [
    "¿Qué servicios ofrece DigitalPyme?",
    "Ofrecemos diseño y desarrollo de páginas web, tiendas en línea, branding, marketing digital y mantenimiento. Puedes revisar el catálogo y solicitar una propuesta según tus objetivos.",
  ],
  [
    "¿Cuánto cuesta una página web?",
    "No hay un precio único: depende de las páginas, funcionalidades, contenido e integraciones que necesites. Cuéntanos qué tienes en mente para preparar una cotización a medida.",
  ],
  [
    "¿Qué diferencia a DigitalPyme de otras agencias?",
    "Trabajamos con un alcance y próximos pasos claros. Si tu proyecto usa el portal de clientes, podrás revisar allí sus avances, entregas, documentos y pagos.",
  ],
  [
    "¿Seré dueño de mi página web?",
    "La propiedad, las cuentas y los archivos que se entregan se especifican en la propuesta del proyecto. Revisamos esos detalles contigo antes de iniciar.",
  ],
  [
    "¿Cómo puedo empezar mi proyecto con DigitalPyme?",
    "Solicita una cotización o agenda una conversación. Cuéntanos sobre tu negocio, qué quieres resolver y qué servicios te interesan; revisaremos contigo los siguientes pasos.",
  ],
]

export const demoReviewExamples = [
  {
    titulo: "Ejemplo de tienda en línea",
    comentario:
      "Ejemplo ficticio: “El catálogo es fácil de recorrer y ayuda a encontrar los productos con claridad.”",
    servicio: "Tienda en línea",
    calificacion: 5,
  },
  {
    titulo: "Ejemplo de página web",
    comentario:
      "Ejemplo ficticio: “La información del negocio queda organizada y es sencilla de consultar desde el celular.”",
    servicio: "Página web",
    calificacion: 5,
  },
  {
    titulo: "Ejemplo de identidad visual",
    comentario:
      "Ejemplo ficticio: “La propuesta visual comunica mejor la personalidad de la marca.”",
    servicio: "Branding",
    calificacion: 4,
  },
  {
    titulo: "Ejemplo de agenda digital",
    comentario:
      "Ejemplo ficticio: “El flujo de consulta permite entender los pasos para coordinar una cita.”",
    servicio: "Agenda y reservas",
    calificacion: 5,
  },
  {
    titulo: "Ejemplo de soporte web",
    comentario:
      "Ejemplo ficticio: “El plan de mantenimiento explica qué tareas se revisan y con qué frecuencia.”",
    servicio: "Mantenimiento",
    calificacion: 4,
  },
  {
    titulo: "Ejemplo de estrategia digital",
    comentario:
      "Ejemplo ficticio: “La propuesta ayuda a ordenar las prioridades de comunicación del negocio.”",
    servicio: "Marketing digital",
    calificacion: 5,
  },
]

export const reviewPageSize = 6

export type QuotePaymentChoice = "undecided" | "bank_transfer" | "yape"

export const quotePaymentOptions: {
  value: QuotePaymentChoice
  label: string
  description: string
  icon: "bank_transfer" | "yape" | "later"
  apiPreference: QuotePaymentPreference
}[] = [
  {
    value: "bank_transfer",
    label: "Transferencia bancaria BCP",
    description: "Verás los datos de la cuenta después de enviar la solicitud.",
    icon: "bank_transfer",
    apiPreference: "bank_transfer",
  },
  {
    value: "yape",
    label: "Yape",
    description:
      "Verás el QR y el monto estimado después de enviar la solicitud.",
    icon: "yape",
    apiPreference: "yape",
  },
  {
    value: "undecided",
    label: "Aún no lo sé",
    description: "Lo decidiré cuando revise la cotización final.",
    icon: "later",
    apiPreference: "undecided",
  },
]

export type PricingPlan = {
  name: string
  price: number
  regularPrice: number
  audience: string
  pages: string
  sections: string
  extras: string[]
  delivery: string
  renewal: number
}

export const pricingCategories: {
  title: string
  description: string
  service: string
  plans: PricingPlan[]
}[] = [
  {
    title: "Planes de páginas web",
    description:
      "Sitios administrables para presentar tu negocio y sus servicios.",
    service: "Páginas web",
    plans: [
      {
        name: "Profesional",
        price: 1250,
        regularPrice: 1500,
        audience: "Emprendedores y PYMES",
        pages: "1 página interna",
        sections: "10 bloques o secciones",
        extras: [
          "100% administrable",
          "WhatsApp y Google SEO",
          "Tema WordPress",
          "5 correos profesionales",
          "Hosting, dominio .COM y SSL",
          "Soporte y capacitación",
        ],
        delivery: "5 días",
        renewal: 450,
      },
      {
        name: "Empresarial",
        price: 1750,
        regularPrice: 2000,
        audience: "Negocios en crecimiento",
        pages: "5 páginas internas",
        sections: "25 bloques o secciones",
        extras: [
          "100% administrable",
          "WhatsApp y Google SEO",
          "Tema WordPress",
          "5 correos profesionales",
          "Hosting, dominio .COM y SSL",
          "Soporte y capacitación",
        ],
        delivery: "10 días",
        renewal: 450,
      },
      {
        name: "Corporativo",
        price: 2250,
        regularPrice: 2500,
        audience: "Empresas consolidadas",
        pages: "10 páginas internas",
        sections: "50 bloques o secciones",
        extras: [
          "100% administrable",
          "WhatsApp y Google SEO",
          "Tema WordPress",
          "5 correos profesionales",
          "Hosting, dominio .COM y SSL",
          "Soporte y capacitación",
        ],
        delivery: "15 días",
        renewal: 450,
      },
    ],
  },
  {
    title: "Planes de landing pages",
    description:
      "Páginas de aterrizaje para campañas, lanzamientos y captación de contactos.",
    service: "Páginas web",
    plans: [
      {
        name: "Profesional",
        price: 950,
        regularPrice: 1250,
        audience: "Emprendedores y PYMES",
        pages: "1 página",
        sections: "5 bloques o secciones",
        extras: [
          "1 correo profesional",
          "Formulario de contacto",
          "WhatsApp y Google SEO",
          "Tag Manager y Facebook Pixel",
          "Tema WordPress",
          "Hosting, dominio .COM y SSL",
        ],
        delivery: "5 días",
        renewal: 350,
      },
      {
        name: "Empresarial",
        price: 1450,
        regularPrice: 1850,
        audience: "Negocios en crecimiento",
        pages: "1 página",
        sections: "10 bloques o secciones",
        extras: [
          "1 correo profesional",
          "Formulario de contacto",
          "WhatsApp y Google SEO",
          "Tag Manager y Facebook Pixel",
          "Tema WordPress",
          "Hosting, dominio .COM y SSL",
        ],
        delivery: "5 días",
        renewal: 350,
      },
      {
        name: "Corporativo",
        price: 1850,
        regularPrice: 2250,
        audience: "Empresas consolidadas",
        pages: "1 página",
        sections: "15 bloques o secciones",
        extras: [
          "1 correo profesional",
          "Formulario de contacto",
          "WhatsApp y Google SEO",
          "Tag Manager y Facebook Pixel",
          "Tema WordPress",
          "Hosting, dominio .COM y SSL",
        ],
        delivery: "5 días",
        renewal: 350,
      },
    ],
  },
  {
    title: "Planes de tiendas virtuales",
    description:
      "Catálogo y flujo de compra en línea para vender tus productos.",
    service: "Tiendas en línea",
    plans: [
      {
        name: "Profesional",
        price: 1950,
        regularPrice: 2250,
        audience: "Emprendedores y PYMES",
        pages: "1 página interna",
        sections: "10 bloques o secciones",
        extras: [
          "10 productos iniciales",
          "100% administrable",
          "WhatsApp y Google SEO",
          "Tema WordPress",
          "5 correos profesionales",
          "Hosting, dominio .COM y SSL",
          "Soporte y capacitación",
        ],
        delivery: "10 días",
        renewal: 750,
      },
      {
        name: "Empresarial",
        price: 2450,
        regularPrice: 2750,
        audience: "Negocios en crecimiento",
        pages: "5 páginas internas",
        sections: "25 bloques o secciones",
        extras: [
          "10 productos iniciales",
          "100% administrable",
          "WhatsApp y Google SEO",
          "Tema WordPress",
          "5 correos profesionales",
          "Hosting, dominio .COM y SSL",
          "Soporte y capacitación",
        ],
        delivery: "15 días",
        renewal: 750,
      },
      {
        name: "Corporativo",
        price: 2950,
        regularPrice: 3250,
        audience: "Empresas consolidadas",
        pages: "10 páginas internas",
        sections: "50 bloques o secciones",
        extras: [
          "100% administrable",
          "WhatsApp y Google SEO",
          "Tema WordPress",
          "5 correos profesionales",
          "Hosting, dominio .COM y SSL",
          "Soporte y capacitación",
        ],
        delivery: "30 días",
        renewal: 750,
      },
    ],
  },
]

export const additionalDigitalServices = [
  {
    title: "Integración de pasarela de pago",
    label: "Pagos en línea",
    price: "S/ 550",
    service: "Tiendas en línea",
    description:
      "Configuración de una pasarela para recibir pagos en línea. Los métodos disponibles y las comisiones se confirman con el proveedor elegido.",
    details: [
      "Aceptación de tarjetas y métodos disponibles del proveedor (Izipay, según disponibilidad)",
      "Configuración y pruebas del flujo de pago",
      "Comisiones de referencia de la imagen: tarjetas nacionales 4.49% + IGV e internacionales 6.99% + IGV; confirmar tarifas vigentes con el proveedor",
    ],
  },
  {
    title: "Experiencia UI/UX",
    label: "Diseño centrado en tus clientes",
    price: "Cotización a medida",
    service: "Branding",
    description:
      "Diseño personalizado y adaptable para que tus clientes encuentren y usen mejor la información de tu negocio.",
    details: [
      "Diseño adaptable a móviles",
      "Accesos a WhatsApp y llamadas",
      "Integración con Google Maps y redes sociales",
      "Formularios de contacto y libro de reclamaciones virtual",
    ],
  },
  {
    title: "SEO para Google",
    label: "Visibilidad orgánica",
    price: "Cotización a medida",
    service: "Marketing digital",
    description:
      "Mejoras técnicas y de contenido para facilitar que los buscadores comprendan e indexen tu sitio. No se garantizan posiciones específicas.",
    details: [
      "Mapa del sitio e indexación en Search Console",
      "Configuración de Google Analytics",
      "Optimización de títulos, metadescripciones y URLs",
      "Revisión SEO de la página principal y páginas acordadas",
    ],
  },
  {
    title: "Hosting, dominio y correos",
    label: "Servicios cloud",
    price: "Incluidos según plan",
    service: "Mantenimiento",
    description:
      "Alojamiento web, dominio .COM y cuentas de correo profesional de acuerdo con el plan contratado.",
    details: [
      "Dominio .COM y correos profesionales según el plan",
      "Hosting dimensionado para el proyecto",
      "Certificado SSL y copias de seguridad según el plan",
      "Soporte técnico y renovaciones indicados en la propuesta",
    ],
  },
  {
    title: "Capacitación y soporte",
    label: "Acompañamiento",
    price: "Según propuesta",
    service: "Mantenimiento",
    description:
      "Acompañamiento para que puedas administrar tu sitio y resolver dudas sobre las herramientas entregadas.",
    details: [
      "Capacitación del panel administrativo (referencia: 1 hora para 1 persona)",
      "Orientación para las consultas acordadas",
      "Acceso al panel según el proyecto",
      "Seguimiento y alcance definidos en la propuesta",
    ],
  },
]

export const quoteTypes = [
  {
    id: "website",
    name: "Página web",
    service: "Páginas web",
    pricingCategory: "Planes de páginas web",
    icon: "🌐",
    description: "Sitio para presentar tu marca y servicios.",
  },
  {
    id: "store",
    name: "Tienda virtual",
    service: "Tiendas en línea",
    pricingCategory: "Planes de tiendas virtuales",
    icon: "🛒",
    description: "Vende en línea con catálogo y carrito.",
  },
  {
    id: "catalog",
    name: "Catálogo online",
    service: "Tiendas en línea",
    pricingCategory: null,
    icon: "▤",
    description: "Muestra tus productos para venta consultiva.",
  },
  {
    id: "landing",
    name: "Landing page",
    service: "Páginas web",
    pricingCategory: "Planes de landing pages",
    icon: "◎",
    description: "Página enfocada en una campaña u objetivo.",
  },
]

export const quoteModules = [
  {
    id: "maps",
    name: "Google Maps interactivo",
    description: "Ubicación y referencias para que tus clientes te encuentren.",
    price: null,
  },
  {
    id: "images",
    name: "Banco de imágenes con licencia",
    description: "Selección de imágenes para las páginas del proyecto.",
    price: null,
  },
  {
    id: "blog",
    name: "Blog / novedades",
    description: "Sección para publicar artículos y noticias.",
    price: null,
  },
  {
    id: "portfolio",
    name: "Portafolio",
    description: "Galería para mostrar proyectos, productos o trabajos.",
    price: null,
  },
  {
    id: "quote-form",
    name: "Cotizador personalizado",
    description: "Formulario configurado para las necesidades de tu negocio.",
    price: null,
  },
  {
    id: "payment",
    name: "Integración de pasarela de pago (Izipay)",
    description:
      "Configuración inicial; las comisiones del proveedor son aparte.",
    price: 550,
  },
]

export const quoteCountries = [
  { value: "Perú|+51", label: "Perú (+51)" },
  { value: "Argentina|+54", label: "Argentina (+54)" },
  { value: "Bolivia|+591", label: "Bolivia (+591)" },
  { value: "Chile|+56", label: "Chile (+56)" },
  { value: "Colombia|+57", label: "Colombia (+57)" },
  { value: "Ecuador|+593", label: "Ecuador (+593)" },
  { value: "España|+34", label: "España (+34)" },
  { value: "Estados Unidos|+1", label: "Estados Unidos (+1)" },
  { value: "México|+52", label: "México (+52)" },
]

export const heroImages = [
  "/images/hero-banner.png",
  "/images/hero-developer.png",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2200&q=85",
]
