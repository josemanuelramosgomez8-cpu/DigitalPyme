import React, { useMemo, useState } from "react"
import type { ApiService } from "./lib/api"
import { useCart } from "./context/CartContext"
import { serviceSlug } from "./constants/siteData"
import { serviceImage } from "./utils/serviceCartStorage"
import Icon from "./components/common/Icon"

export interface CatalogoServiciosProps {
  services: ApiService[]
  onQuote: (serviceNames: string[]) => void
  onNavigate: (path: string) => void
}

export default function CatalogoServicios({
  services,
  onQuote,
  onNavigate,
}: CatalogoServiciosProps) {
  const {
    addToCart,
    removeFromCart,
    isInCart,
    totalItems,
    openCart,
    currency,
    formatPrice,
  } = useCart()

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const activeServices = useMemo(
    () => services.filter((service) => service.activo),
    [services],
  )

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const service of activeServices) {
      const cat = service.category?.nombre ?? service.categoria
      if (cat) set.add(cat)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"))
  }, [activeServices])

  const query = search.trim().toLocaleLowerCase("es")

  const filteredServices = useMemo(() => {
    return activeServices.filter((service) => {
      const cat = service.category?.nombre ?? service.categoria ?? ""
      const matchesCategory = !selectedCategory || cat === selectedCategory
      const matchesSearch =
        !query ||
        `${service.nombre} ${service.descripcion ?? ""} ${cat}`
          .toLocaleLowerCase("es")
          .includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeServices, selectedCategory, query])

  const handleToggleCart = (service: ApiService) => {
    const slug = serviceSlug(service)
    if (isInCart(slug)) {
      removeFromCart(slug)
    } else {
      addToCart(service, 1)
    }
  }

  return (
    <div className="catalogo-page py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Top Banner / Breadcrumbs */}
      <div className="mb-8">
        <nav
          className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3"
          aria-label="Migas de pan"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              onNavigate("/")
            }}
            className="hover:text-stone-900 transition-colors"
          >
            Inicio
          </a>
          <span>/</span>
          <span className="text-emerald-900 font-bold" aria-current="page">
            Catálogo de Servicios
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/90 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Soluciones Digitales Especializadas
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102c2c] mt-2 font-serif tracking-tight">
              Catálogo de Servicios Tecnológicos
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mt-2 leading-relaxed">
              Selecciona las soluciones que tu empresa necesita. Puedes agregar
              múltiples servicios a tu carrito y solicitar una propuesta formal
              consolidada y personalizada.
            </p>
          </div>

          {/* Quick Cart CTA Status */}
          <div className="shrink-0 flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#102c2c] text-white flex items-center justify-center font-bold">
              <Icon name="cart" size={20} />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">
                Servicios seleccionados
              </p>
              <p className="text-sm font-bold text-[#102c2c]">
                {totalItems} {totalItems === 1 ? "servicio" : "servicios"}
              </p>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="ml-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Ver Carrito
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path strokeWidth="2" d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción de servicio..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
          />
        </div>

        {/* Category Pills / Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === ""
                ? "bg-[#102c2c] text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Todos ({activeServices.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#102c2c] text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 shadow-xs px-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
            <Icon name="file" size={28} />
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-1">
            No se encontraron servicios
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
            Intenta con otros términos de búsqueda o selecciona otra categoría.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setSelectedCategory("")
            }}
            className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const slug = serviceSlug(service)
            const inCart = isInCart(slug)

            return (
              <article
                key={slug}
                className={`flex flex-col justify-between bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-lg ${
                  inCart
                    ? "border-emerald-600 ring-2 ring-emerald-500/20"
                    : "border-stone-200/90 hover:border-emerald-300"
                }`}
              >
                {/* Card Top: Image & Badges */}
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={serviceImage(service)}
                      alt={service.nombre}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          "/images/services/servicio-digital.jpg"
                      }}
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#102c2c]/90 backdrop-blur-sm text-white text-[11px] font-bold">
                        {service.category?.nombre ??
                          service.categoria ??
                          "Servicio Digital"}
                      </span>
                      {service.etiqueta && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-xs">
                          {service.etiqueta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-medium">
                      <span>Código: #{String(service.orden || 1).padStart(2, "0")}</span>
                      {service.duracion && (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Icon name="clock" size={13} />
                          {service.duracion}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#102c2c] font-serif leading-snug">
                      <a
                        href={`/servicios/${slug}`}
                        onClick={(e) => {
                          e.preventDefault()
                          onNavigate(`/servicios/${slug}`)
                        }}
                        className="hover:text-emerald-700 transition-colors"
                      >
                        {service.nombre}
                      </a>
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                      {service.descripcion ||
                        "Desarrollo e implementación especializada adaptada a los objetivos comerciales de tu empresa."}
                    </p>

                    {/* Feature Bullets (if any) */}
                    {service.incluye && service.incluye.length > 0 && (
                      <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                        {service.incluye.slice(0, 3).map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-stone-600"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Card Bottom / Price & CTA */}
                <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 mt-auto bg-stone-50/50">
                  <div className="flex items-baseline justify-between mb-4 pt-3">
                    <span className="text-xs font-semibold text-stone-500">
                      Inversión referencial:
                    </span>
                    <strong className="text-base font-extrabold text-[#102c2c]">
                      {formatPrice(
                        service.precio_desde != null
                          ? Number(service.precio_desde)
                          : null,
                      )}
                    </strong>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCart(service)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                        inCart
                          ? "bg-emerald-700 hover:bg-rose-700 text-white"
                          : "bg-[#102c2c] hover:bg-[#294545] text-white"
                      }`}
                    >
                      <Icon name={inCart ? "check" : "cart"} size={16} />
                      {inCart ? "En tu carrito (Quitar)" : "Añadir al carrito"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuote([service.nombre])}
                      className="py-3 px-3 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-700 hover:text-black font-bold text-xs transition-colors cursor-pointer"
                      title="Cotizar directamente este servicio"
                    >
                      Cotizar
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Informative Guidance Banner */}
      <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#102c2c] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c9f45b]">
            ¿Tienes dudas o necesitas asesoría técnica?
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold">
            Evaluamos tu proyecto sin costo
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Nuestros especialistas analizan los requerimientos de tu PYME y te
            proponen el plan de servicios digitales ideal para maximizar tus
            resultados y ventas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onQuote(filteredServices.map((s) => s.nombre))}
            className="px-6 py-3 rounded-xl bg-[#c9f45b] text-[#102c2c] font-extrabold text-xs uppercase tracking-wider hover:bg-[#a9d835] transition-all shadow-md cursor-pointer"
          >
            Solicitar propuesta integral
          </button>
          <a
            href="/#contacto"
            onClick={(e) => {
              e.preventDefault()
              onNavigate("/#contacto")
            }}
            className="px-6 py-3 rounded-xl border border-white/40 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors text-center"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
