import React, { useMemo, useState } from "react"
import type { ApiService } from "../../lib/api"
import { useCart } from "../../context/CartContext"

export interface ServiceItem {
  id: string | number
  slug: string
  nombre: string
  categoria: string
  categoryTag: string
  numero: string
  descripcion: string
  puntosClave: [string, string, string]
  precioPen: number
  precioUsd: number
  isMonthly?: boolean
  isFeatured?: boolean
  icon: "storefront" | "laptop" | "rocket" | "palette" | "campaign" | "security"
  activo: boolean
}

export interface ServicesSectionProps {
  onQuote: (service?: string, message?: string) => void
  onNavigate: (path: string) => void
  initialServices?: ApiService[]
}

const CANONICAL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    slug: "tiendas-en-linea",
    nombre: "Tiendas en línea",
    categoria: "E-commerce",
    categoryTag: "E-COMMERCE",
    numero: "01",
    descripcion:
      "Diseño y desarrollo de tiendas virtuales con pasarelas de pago integradas, catálogo dinámico y gestión de pedidos centralizada.",
    puntosClave: [
      "Pasarelas de pago (Yape/Plin/Cards)",
      "Catálogo autoadministrable intuitivo",
      "Optimizado para conversión CRO",
    ],
    precioPen: 1850,
    precioUsd: 510,
    isFeatured: true,
    icon: "storefront",
    activo: true,
  },
  {
    id: 2,
    slug: "paginas-web",
    nombre: "Páginas corporativas",
    categoria: "Desarrollo Web",
    categoryTag: "DESARROLLO WEB",
    numero: "02",
    descripcion:
      "Presencia institucional sólida y moderna, orientada a generar confianza empresarial y captar prospectos calificados.",
    puntosClave: [
      "Diseño adaptable 100% a móviles",
      "SEO técnico base y Google Index",
      "Formularios y WhatsApp directo",
    ],
    precioPen: 1200,
    precioUsd: 320,
    icon: "laptop",
    activo: true,
  },
  {
    id: 3,
    slug: "landing-pages",
    nombre: "Landing Pages",
    categoria: "Desarrollo Web",
    categoryTag: "DESARROLLO WEB",
    numero: "03",
    descripcion:
      "Páginas de aterrizaje de impacto creadas con un único objetivo: maximizar el retorno de inversión en tus campañas de anuncios.",
    puntosClave: [
      "Carga ultrarrápida (< 1.5s)",
      "Enfoque en pauta publicitaria",
      "A/B Testing y analítica preparada",
    ],
    precioPen: 760,
    precioUsd: 205,
    icon: "rocket",
    activo: true,
  },
  {
    id: 4,
    slug: "branding",
    nombre: "Branding & Identidad",
    categoria: "Branding",
    categoryTag: "BRANDING",
    numero: "04",
    descripcion:
      "Desarrollo de un universo visual coherente, memorable y preparado para competir con autoridad en el mercado digital.",
    puntosClave: [
      "Manual de marca normativo",
      "Logotipo y variantes vectoriales",
      "Kit para redes y tipografía",
    ],
    precioPen: 950,
    precioUsd: 255,
    icon: "palette",
    activo: true,
  },
  {
    id: 5,
    slug: "marketing-digital",
    nombre: "Marketing Digital & Ads",
    categoria: "Marketing",
    categoryTag: "MARKETING",
    numero: "05",
    descripcion:
      "Estrategia integral de pauta digital y adquisición orientada a generar oportunidades comerciales medibles mes a mes.",
    puntosClave: [
      "Campañas Meta & Google Ads",
      "Estrategia de embudo comercial",
      "Reportes mensuales con ROAS",
    ],
    precioPen: 1100,
    precioUsd: 295,
    isMonthly: true,
    icon: "campaign",
    activo: true,
  },
  {
    id: 6,
    slug: "mantenimiento",
    nombre: "Mantenimiento y Soporte",
    categoria: "Mantenimiento",
    categoryTag: "SOPORTE",
    numero: "06",
    descripcion:
      "Tranquilidad operativa continua para tu plataforma con monitoreo activo de seguridad, copias y actualizaciones.",
    puntosClave: [
      "Copias de seguridad semanales",
      "Parches de seguridad y plugins",
      "Soporte prioritario por WhatsApp",
    ],
    precioPen: 380,
    precioUsd: 100,
    isMonthly: true,
    icon: "security",
    activo: true,
  },
]

const QUICK_FILTER_PILLS = [
  "Todos",
  "E-commerce",
  "Desarrollo Web",
  "Branding",
  "Marketing",
  "Mantenimiento",
] as const

type FilterCategory = (typeof QUICK_FILTER_PILLS)[number]

function ServiceIcon({
  name,
  className = "w-6 h-6",
}: {
  name: ServiceItem["icon"]
  className?: string
}) {
  switch (name) {
    case "storefront":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9l2-5h14l2 5M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7"
          />
        </svg>
      )
    case "laptop":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 20h20M7 20v-4M17 20v-4"
          />
        </svg>
      )
    case "rocket":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2c2.5 2.5 4 6 4 9 0 2-1 3.5-2 4.5l-2-2-2 2c-1-1-2-2.5-2-4.5 0-3 1.5-6.5 4-9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 14l-2 3v3h3l3-2M19 14l2 3v3h-3l-3-2M12 17v4"
          />
        </svg>
      )
    case "palette":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3a9 9 0 100 18c1.5 0 2.5-1 2.5-2.2 0-.6-.2-1.1-.6-1.5-.4-.4-.6-.9-.6-1.5 0-1.2 1-2.2 2.2-2.2H17a4 4 0 004-4c0-4.5-4-6.6-9-6.6z"
          />
          <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
          <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
        </svg>
      )
    case "campaign":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5L6 9H3a1 1 0 00-1 1v4a1 1 0 001 1h3l5 4V5zM15 9.5a4 4 0 010 5M18.5 7a7 7 0 010 10M6 15v4a2 2 0 002 2h1"
          />
        </svg>
      )
    case "security":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4"
          />
        </svg>
      )
  }
}

export default function ServicesSection({
  onQuote: _onQuote,
  onNavigate,
  initialServices: _initialServices,
}: ServicesSectionProps) {
  const { currency, addToCart, isInCart } = useCart()

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("Todos")
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Filter out any fictional or test services strictly as requested
  const servicesList = useMemo(() => {
    return CANONICAL_SERVICES.filter(
      (s) =>
        s.activo &&
        !s.nombre.toLowerCase().includes("prueba") &&
        !s.slug.toLowerCase().includes("prueba"),
    )
  }, [])

  // Filter by category and search term
  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    return servicesList.filter((service) => {
      const matchesCategory =
        selectedCategory === "Todos" ||
        service.categoria.toLowerCase() === selectedCategory.toLowerCase()

      const matchesSearch =
        !q ||
        service.nombre.toLowerCase().includes(q) ||
        service.descripcion.toLowerCase().includes(q) ||
        service.categoria.toLowerCase().includes(q) ||
        service.categoryTag.toLowerCase().includes(q) ||
        service.puntosClave.some((p) => p.toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [servicesList, selectedCategory, search])

  const handleShare = async (service: ServiceItem) => {
    const url = `${window.location.origin}/servicios/${service.slug}`
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopiedSlug(service.slug)
        window.setTimeout(() => setCopiedSlug(null), 2000)
      } else {
        const input = document.createElement("input")
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        document.body.removeChild(input)
        setCopiedSlug(service.slug)
        window.setTimeout(() => setCopiedSlug(null), 2000)
      }
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Hola, te comparto el servicio ${service.nombre} de DigitalPyme: ${url}`,
        )}`,
        "_blank",
      )
    }
  }

  const handleAddToCart = (service: ServiceItem) => {
    addToCart(
      {
        id: service.id,
        slug: service.slug,
        nombre: service.nombre,
        descripcion: service.descripcion,
        categoria: service.categoria,
        precio_desde: currency === "USD" ? service.precioUsd : service.precioPen,
        duracion: service.isMonthly ? "Mensual" : null,
        quantity: 1,
      },
      1,
    )
  }

  return (
    <section
      className="py-16 sm:py-24 bg-[#f9f6f0] border-t border-stone-200/60"
      id="servicios"
      aria-label="Catálogo de servicios y soluciones digitales"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ======================================================== */}
        {/* 1. CABECERA DE SECCIÓN EDITORIAL (2 Columnas en Desktop) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end pb-10 border-b border-stone-200/80 mb-8">
          {/* Columna Izquierda: Kicker con Verde Voltio + Título Serif */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-stone-200/90 shadow-2xs">
              <span
                className="w-2 h-2 rounded-full bg-[#bdf548] animate-pulse"
                aria-hidden="true"
              />
              <span className="text-xs font-bold tracking-wider uppercase text-stone-700 font-sans">
                Catálogo Oficial 2026
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1b3b32] tracking-tight leading-[1.15]">
              Soluciones digitales para tu negocio.
            </h2>
          </div>

          {/* Columna Derecha: Subtítulo con borde acento Verde Voltio */}
          <div className="lg:col-span-5 pb-1">
            <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed border-l-3 border-[#bdf548] pl-4">
              Conoce nuestros servicios y solicita una propuesta de acuerdo con
              las necesidades y el alcance de tu proyecto. Inversión
              transparente y entrega modular para potenciar tus ventas.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. BARRA UNIFICADA DE BÚSQUEDA Y FILTROS EN UNA FILA     */}
        {/* ======================================================== */}
        <div className="mb-10 bg-white border border-stone-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-center gap-3">
          {/* Input de Búsqueda en tiempo real */}
          <div className="flex items-center gap-2.5 flex-1 w-full px-3 py-1.5">
            <svg
              className="w-5 h-5 text-stone-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path strokeWidth="2" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              id="service-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar servicios (ej: e-commerce, SEO, landing)..."
              className="w-full bg-transparent border-none p-0 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0 text-xs sm:text-sm"
              aria-label="Buscar servicios"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Divisor Vertical */}
          <div
            className="hidden md:block w-px h-8 bg-stone-200"
            aria-hidden="true"
          />

          {/* Selector de Categorías Dropdown */}
          <div className="relative w-full md:w-56 px-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-stone-400 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as FilterCategory)
                }
                className="w-full bg-transparent border-none p-0 pr-6 text-stone-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-0 cursor-pointer"
                aria-label="Filtrar por categoría"
              >
                <option value="Todos">Todas las categorías</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Desarrollo Web">Desarrollo Web</option>
                <option value="Branding">Branding</option>
                <option value="Marketing">Marketing Digital</option>
                <option value="Mantenimiento">Soporte y Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Divisor Vertical */}
          <div
            className="hidden md:block w-px h-8 bg-stone-200"
            aria-hidden="true"
          />

          {/* Chips de Filtros Rápidos */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 px-1">
            {QUICK_FILTER_PILLS.map((pill) => {
              const isActive = selectedCategory === pill
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSelectedCategory(pill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer select-none ${
                    isActive
                      ? "bg-[#1b3b32] text-white shadow-xs"
                      : "bg-stone-50 border border-stone-200/90 text-stone-700 hover:text-[#1b3b32] hover:border-[#1b3b32] hover:bg-stone-100"
                  }`}
                  aria-pressed={isActive}
                >
                  {pill}
                </button>
              )
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. CUADRÍCULA DE SERVICIOS (Desktop 3 Columnas)           */}
        {/* ======================================================== */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1b3b32] mb-1">
              No encontramos servicios con esos criterios
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
              Prueba con otro término de búsqueda o selecciona otra categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedCategory("Todos")
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1b3b32] text-xs font-bold transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            id="services-grid"
          >
            {filteredServices.map((service) => {
              const inCart = isInCart(service.slug)
              const isCopied = copiedSlug === service.slug

              const formattedPrice =
                currency === "USD"
                  ? service.isMonthly
                    ? `Desde $ ${service.precioUsd} / mes`
                    : `Desde $ ${service.precioUsd} USD`
                  : service.isMonthly
                    ? `Desde S/ ${service.precioPen.toLocaleString("es-PE")} / mes`
                    : `Desde S/ ${service.precioPen.toLocaleString("es-PE")}`

              return (
                <article
                  key={service.slug}
                  className={`relative flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    service.isFeatured
                      ? "border-2 border-[#1b3b32] shadow-md"
                      : "border border-stone-200/90 shadow-xs"
                  }`}
                >
                  {/* Floating Badge para la Tarjeta Estrella */}
                  {service.isFeatured && (
                    <div className="absolute -top-3.5 left-6 bg-[#bdf548] text-[#1b3b32] font-sans text-[0.7rem] font-black px-3 py-0.5 rounded-md border border-[#1b3b32] tracking-wider flex items-center gap-1 shadow-2xs select-none">
                      <span>★ MÁS SOLICITADO</span>
                    </div>
                  )}

                  <div>
                    {/* Fila superior: Categoría + Botón Compartir */}
                    <div className="flex items-center justify-between pt-1 mb-4">
                      <span className="text-[0.72rem] font-extrabold tracking-wider text-stone-500 uppercase font-sans">
                        {service.categoryTag}
                      </span>

                      {/* Botón Compartir con Feedback Visual */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => handleShare(service)}
                          aria-label={`Compartir servicio ${service.nombre}`}
                          title="Copiar enlace del servicio"
                          className="text-stone-400 hover:text-[#1b3b32] transition-colors p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </button>

                        {isCopied && (
                          <span
                            className="absolute right-0 -top-7 bg-[#1b3b32] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-in fade-in zoom-in-90"
                            role="status"
                          >
                            ¡Copiado!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Identidad del servicio: Icono + Número + Título Serif */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          service.isFeatured
                            ? "bg-[#1b3b32] text-[#bdf548] shadow-xs"
                            : "bg-[#f0eee8] text-[#1b3b32] border border-stone-200/80"
                        }`}
                      >
                        <ServiceIcon name={service.icon} className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[0.7rem] font-bold text-stone-400 font-mono">
                          {service.numero}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-[#1b3b32] leading-tight">
                          <a
                            href={`/servicios/${service.slug}`}
                            onClick={(e) => {
                              e.preventDefault()
                              onNavigate(`/servicios/${service.slug}`)
                            }}
                            className="hover:underline"
                          >
                            {service.nombre}
                          </a>
                        </h3>
                      </div>
                    </div>

                    {/* Descripción Comercial */}
                    <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
                      {service.descripcion}
                    </p>

                    {/* Lista de 3 Puntos Clave / Beneficios con Checkmarks */}
                    <ul className="space-y-2 mb-6" aria-label="Beneficios incluidos">
                      {service.puntosClave.map((punto, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-medium"
                        >
                          <svg
                            className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{punto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pie de tarjeta (Conversión & Inversión referencial) */}
                  <div className="pt-4 border-t border-stone-200/80 space-y-3.5 mt-auto">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide font-sans">
                        Inversión referencial:
                      </span>
                      <strong className="font-serif text-lg font-bold text-[#1b3b32]">
                        {formattedPrice}
                      </strong>
                    </div>

                    {/* Dos botones lado a lado */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/servicios/${service.slug}`)
                        }
                        className="w-full py-2.5 px-3 rounded-xl border border-stone-300 hover:border-[#1b3b32] text-[#1b3b32] font-bold text-xs hover:bg-stone-50 transition-all text-center cursor-pointer"
                      >
                        Ver detalles
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(service)}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer ${
                          inCart
                            ? "bg-emerald-800 text-white hover:bg-emerald-900"
                            : "bg-[#1b3b32] text-white hover:bg-[#234b3f]"
                        }`}
                        title={`Añadir ${service.nombre} al carrito`}
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle cx="9" cy="20" r="1.5" />
                          <circle cx="18" cy="20" r="1.5" />
                          <path d="M1 2h3.5l2.6 12.8a2 2 0 002 1.6h9.8a2 2 0 002-1.6L23 6H6" />
                        </svg>
                        <span>{inCart ? "Añadido" : "Añadir"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
