import React from "react"
import type { CleanHeroSlide } from "../data/heroSlides"
import { PAYMENT_SEALS } from "../data/heroSlides"

interface HeroServiceMockupProps {
  slide: CleanHeroSlide
  onQuote?: (service?: string, message?: string) => void
}

function PaymentBadgeIcon({ id }: { id: string }) {
  switch (id) {
    case "yape":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#742284] text-white text-[10px] font-black tracking-wider shadow-sm">
          <span>YAPE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d1d5]" />
        </span>
      )
    case "plin":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#00b4d8] text-white text-[10px] font-black tracking-wider shadow-sm">
          PLIN
        </span>
      )
    case "visa":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#1a1f71] text-white text-[10px] font-extrabold tracking-wider shadow-sm">
          VISA
        </span>
      )
    case "stripe":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#635bff] text-white text-[10px] font-extrabold tracking-wider shadow-sm">
          STRIPE
        </span>
      )
    case "paypal":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#003087] text-white text-[10px] font-extrabold tracking-wider shadow-sm">
          PAYPAL
        </span>
      )
    default:
      return null
  }
}

export default function HeroServiceMockup({
  slide,
  onQuote,
}: HeroServiceMockupProps) {
  return (
    <div className="relative w-full max-w-[500px] flex flex-col items-center select-none group">
      {/* Sleek Laptop / Display Chassis */}
      <div className="w-full rounded-2xl bg-gradient-to-b from-stone-800 to-stone-950 p-2 sm:p-2.5 shadow-2xl border border-white/20 transition-transform duration-500 group-hover:scale-[1.01]">
        {/* Device Screen Bezel */}
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-stone-900 border border-black/40">
          {/* Top Browser Bar */}
          <div className="absolute top-0 inset-x-0 h-6 bg-stone-950/85 backdrop-blur-md border-b border-white/10 px-2.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
              <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
              <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
            </div>
            <div className="text-[10px] font-mono text-stone-300 font-medium px-2 py-0.5 rounded bg-white/10 max-w-[200px] truncate">
              digitalpyme.pe/demo
            </div>
            <div className="w-8" />
          </div>

          {/* Local Service Screenshot */}
          <img
            src={slide.image}
            alt={slide.imageAlt}
            loading="eager"
            className="w-full h-full object-cover object-center pt-6 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Device Tag Pill */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-lg">
              {slide.deviceTag}
            </span>
          </div>
        </div>

        {/* Laptop Stand Base Reflection */}
        <div className="h-1.5 w-24 mx-auto bg-stone-700/80 rounded-b-md mt-1 shadow-inner" />
      </div>

      {/* Clean Single-Row Payment Seals Strip */}
      <div className="mt-3.5 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-md">
        <span className="text-[11px] font-semibold text-stone-200 uppercase tracking-wider">
          Pasarelas:
        </span>
        <div className="flex items-center gap-1.5">
          {PAYMENT_SEALS.map((seal) => (
            <PaymentBadgeIcon key={seal.id} id={seal.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
