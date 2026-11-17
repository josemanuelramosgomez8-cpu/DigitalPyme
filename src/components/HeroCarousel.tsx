import React, { useCallback, useEffect, useState } from "react"
import {
  HERO_SLIDES,
  type CleanHeroSlide,
  type Currency,
} from "../data/heroSlides"
import HeroServiceMockup from "./HeroServiceMockup"
import { useCart } from "../context/CartContext"

interface HeroCarouselProps {
  onQuote: (service?: string, message?: string) => void
  hasProjects?: boolean
}

function CategoryIcon({ type }: { type: CleanHeroSlide["tabIcon"] }) {
  switch (type) {
    case "holiday":
      return <span aria-hidden="true" className="text-base leading-none">🎄</span>
    case "web":
      return (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path
            strokeWidth="2"
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
      )
    case "store":
      return (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      )
    case "growth":
      return (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      )
    case "brand":
      return (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      )
  }
}

/**
 * CurrencyToggle Component:
 * Clean, interactive pill switch with explicit styling to prevent any dark-on-dark cascade conflicts.
 */
export function CurrencyToggle({
  currency,
  onCurrencyChange,
}: {
  currency: Currency
  onCurrencyChange: (newCurrency: Currency) => void
}) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-white p-1 border-2 border-stone-200/90 shadow-md select-none"
      role="group"
      aria-label="Selector de Moneda"
    >
      <button
        type="button"
        onClick={() => onCurrencyChange("PEN")}
        aria-pressed={currency === "PEN"}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
          currency === "PEN"
            ? "bg-[#102c2c] text-white shadow-sm ring-1 ring-[#102c2c]"
            : "bg-transparent text-stone-700 hover:text-black hover:bg-stone-100"
        }`}
        style={{
          color: currency === "PEN" ? "#ffffff" : "#334155",
          backgroundColor: currency === "PEN" ? "#102c2c" : "transparent",
        }}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          🇵🇪
        </span>
        <span className="font-extrabold whitespace-nowrap">PEN S/</span>
      </button>

      <button
        type="button"
        onClick={() => onCurrencyChange("USD")}
        aria-pressed={currency === "USD"}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
          currency === "USD"
            ? "bg-[#102c2c] text-white shadow-sm ring-1 ring-[#102c2c]"
            : "bg-transparent text-stone-700 hover:text-black hover:bg-stone-100"
        }`}
        style={{
          color: currency === "USD" ? "#ffffff" : "#334155",
          backgroundColor: currency === "USD" ? "#102c2c" : "transparent",
        }}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          🌎
        </span>
        <span className="font-extrabold whitespace-nowrap">USD $</span>
      </button>
    </div>
  )
}

/**
 * ServiceTabs Component:
 * Restores horizontal bottom tabs with clear active/inactive contrast and legible labels.
 */
export function ServiceTabs({
  slides,
  activeSlide,
  onSelectSlide,
}: {
  slides: CleanHeroSlide[]
  activeSlide: number
  onSelectSlide: (index: number) => void
}) {
  return (
    <div
      className="w-full flex items-center gap-2 overflow-x-auto pb-1 hero-scrollbar"
      role="tablist"
      aria-label="Pestañas de selección de servicios"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeSlide

        let activeBg = "#102c2c"
        let activeTextColor = "#ffffff"
        let activeBorder = "#102c2c"

        if (slide.categoryKey === "navidad") {
          activeBg = "#fbbf24"
          activeTextColor = "#0c0a09"
          activeBorder = "#f59e0b"
        }

        return (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectSlide(index)}
            className={`shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isActive
                ? "ring-2 ring-offset-2 ring-stone-400 scale-[1.02]"
                : "bg-white hover:bg-stone-100 border border-stone-300/80 text-stone-700 hover:text-black"
            }`}
            style={{
              backgroundColor: isActive ? activeBg : "#ffffff",
              color: isActive ? activeTextColor : "#292524",
              borderColor: isActive ? activeBorder : "#d6d3d1",
            }}
          >
            <CategoryIcon type={slide.tabIcon} />
            <span className="whitespace-nowrap font-bold">{slide.tabLabel}</span>
            {slide.categoryKey === "navidad" && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: "#e11d48", color: "#ffffff" }}
              >
                20% OFF
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function HeroCarousel({ onQuote }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState<number>(0)
  const { currency, setCurrency } = useCart()
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [autoplay, setAutoplay] = useState<boolean>(true)
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  const slideCount = HERO_SLIDES.length
  const currentSlide = HERO_SLIDES[activeSlide] ?? HERO_SLIDES[0]

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  const goToNext = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const goToPrev = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (isPaused || !autoplay || reducedMotion) return
    const interval = window.setInterval(goToNext, 6000)
    return () => window.clearInterval(interval)
  }, [isPaused, autoplay, reducedMotion, goToNext])

  // Price calculation
  const activePrice =
    currency === "USD" ? currentSlide.priceUSD : currentSlide.pricePEN

  return (
    <section
      id="inicio"
      aria-label="Banner principal de servicios y promociones"
      className="relative w-full bg-[#f6f4ed]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (
          !(e.relatedTarget instanceof Node) ||
          !e.currentTarget.contains(e.relatedTarget)
        ) {
          setIsPaused(false)
        }
      }}
    >
      {/* Top Header Row: Season Kicker & Single Currency Toggle Switch */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-700 font-sans">
            Plataformas Digitales PYME · Campaña 2026
          </span>
        </div>

        {/* Unified & Exclusive Currency Toggle Pill */}
        <CurrencyToggle
          currency={currency}
          onCurrencyChange={setCurrency}
        />
      </div>

      {/* Main Full-Width Panoramic Banner (Edge-to-edge full section) */}
      <div
        className="relative w-full overflow-hidden transition-all duration-700 shadow-md border-y border-stone-900/10 flex items-center min-h-[420px] lg:min-h-[460px]"
        style={{ background: currentSlide.theme.bgGradient }}
      >
        {/* Subtle Ambient Studio Glare */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at 75% 45%, rgba(255,255,255,0.45) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* Floating Navigation Arrows */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Diapositiva anterior"
          className="hidden sm:flex absolute left-3 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-stone-900 shadow-xl items-center justify-center hover:bg-white hover:scale-105 transition-all z-30 cursor-pointer border border-stone-200/50"
          style={{ color: "#1c1917", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Diapositiva siguiente"
          className="hidden sm:flex absolute right-3 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-stone-900 shadow-xl items-center justify-center hover:bg-white hover:scale-105 transition-all z-30 cursor-pointer border border-stone-200/50"
          style={{ color: "#1c1917", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Centered Panoramic Content Grid */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline, Badge, Subtitle, CTA + Dynamic Price */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            {/* Campaign Badge Pill */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${currentSlide.theme.badgeStyle}`}
              >
                <span>{currentSlide.badgeText}</span>
                {currentSlide.badgeDiscount && (
                  <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                    {currentSlide.badgeDiscount}
                  </span>
                )}
              </span>
            </div>

            {/* Contundent Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.12] tracking-tight">
              {currentSlide.headlinePrefix}{" "}
              <span className={currentSlide.theme.tagColor}>
                {currentSlide.headlineHighlight}
              </span>{" "}
              {currentSlide.headlineSuffix}
            </h1>

            {/* Brief Subtitle (Scannable in 3 seconds) */}
            <p className="text-sm sm:text-base text-white/90 max-w-lg leading-relaxed font-normal">
              {currentSlide.subtitle}
            </p>

            {/* Action Area: Single Prominent CTA + Dynamic Price Tag */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* ONE Large Primary CTA Button */}
              <button
                type="button"
                onClick={() =>
                  onQuote(
                    currentSlide.serviceTarget,
                    `Interés en ${currentSlide.tabLabel} (${currency}) - Inversión: ${activePrice}`,
                  )
                }
                className={`px-8 py-3.5 rounded-full text-base font-black shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 ${currentSlide.theme.ctaBg}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>{currentSlide.ctaLabel}</span>
              </button>

              {/* Clean Dynamic Price Pill */}
              <div className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-white font-extrabold text-sm sm:text-base shadow-md self-start sm:self-auto">
                <span className="text-stone-300 font-medium text-xs">
                  Inversión:
                </span>
                <span className="text-amber-300 font-mono tracking-tight font-black">
                  {activePrice}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Device Showcase (Laptop with Payment Gateways) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <HeroServiceMockup
              slide={currentSlide}
              onQuote={onQuote}
            />
          </div>
        </div>

        {/* Bottom Center Indicator Dots */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30"
          role="group"
          aria-label="Indicador de diapositivas"
        >
          {HERO_SLIDES.map((_, index) => {
            const isActive = index === activeSlide
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Ir al banner ${index + 1}`}
                className={`transition-all cursor-pointer ${
                  isActive
                    ? "w-7 h-2 rounded-full bg-white shadow-md"
                    : "w-2 h-2 rounded-full bg-white/50 hover:bg-white/80"
                }`}
                style={{ backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.5)" }}
              />
            )
          })}
        </div>
      </div>

      {/* Bottom Horizontal Service Tabs (Pestañas Inferiores de Servicios) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <ServiceTabs
          slides={HERO_SLIDES}
          activeSlide={activeSlide}
          onSelectSlide={setActiveSlide}
        />

        {/* Autoplay Pause/Play Status Indicator */}
        <button
          type="button"
          onClick={() => setAutoplay((prev) => !prev)}
          className="shrink-0 text-xs font-bold text-stone-600 hover:text-black flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm cursor-pointer"
          aria-label={autoplay ? "Pausar rotación automática" : "Reanudar rotación"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              autoplay ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
            }`}
          />
          <span>{autoplay ? "Rotación activa" : "En pausa"}</span>
        </button>
      </div>
    </section>
  )
}
