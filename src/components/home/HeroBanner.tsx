import { useEffect, useRef, useState } from "react"
import Icon from "../common/Icon"
import TrustLine from "../common/TrustLine"
import { heroImages } from "../../constants/siteData"

export default function HeroBanner({
  onQuote,
  hasProjects,
}: {
  onQuote: (service?: string, message?: string) => void
  hasProjects: boolean
}) {
  const [activeSlide, setActiveSlide] = useState(1)
  const [paused, setPaused] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const slideCount = heroImages.length + 1

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (paused || reducedMotion) return
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [paused, reducedMotion, slideCount])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (activeSlide === 0 && !reducedMotion) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [activeSlide, reducedMotion])

  const showSlide = (index: number) => {
    setActiveSlide((index + slideCount) % slideCount)
  }

  return (
    <section
      className="hero"
      id="inicio"
      aria-label="Banner principal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setPaused(false)
        }
      }}
    >
      <div className="hero-backgrounds" aria-hidden="true">
        <video
          ref={videoRef}
          className={`hero-backdrop hero-video${
            activeSlide === 0 ? " is-active" : ""
          }`}
          autoPlay={!reducedMotion}
          muted={videoMuted}
          playsInline
          preload="metadata"
          poster={heroImages[0]}
          style={{ display: activeSlide === 0 ? "block" : "none" }}
        >
          <source src="/videos/banner.mp4" type="video/mp4" />
        </video>

        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero-backdrop${
              index + 1 === activeSlide ? " is-active" : ""
            }`}
            style={{ backgroundImage: `url("${image}")` }}
          />
        ))}
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <span /> Soluciones digitales que convierten
          </span>
          <h1>
            Tu <em>negocio</em> necesita una web que trabaje por ti.
          </h1>
          <p>
            Creamos soluciones digitales para negocios que quieren fortalecer su
            presencia y sus procesos en línea.
          </p>
          <div className="hero-actions">
            <button type="button" className="button" onClick={() => onQuote()}>
              Solicitar cotización
            </button>
            <a
              href={hasProjects ? "#proyectos" : "#servicios"}
              className="button button-secondary"
            >
              {hasProjects ? "Ver proyectos" : "Ver servicios"}
            </a>
          </div>
          <TrustLine />
        </div>
      </div>

      <div
        className="container hero-controls"
        aria-label="Controles del banner"
      >
        <button
          type="button"
          className="hero-arrow"
          aria-label="Diapositiva anterior"
          onClick={() => showSlide(activeSlide - 1)}
        >
          <Icon name="arrow" size={18} />
        </button>

        {activeSlide === 0 && (
          <button
            type="button"
            className="hero-sound"
            aria-pressed={!videoMuted}
            onClick={() => setVideoMuted((muted) => !muted)}
          >
            {videoMuted ? "Activar sonido" : "Silenciar"}
          </button>
        )}

        <div
          className="hero-dots"
          role="group"
          aria-label="Seleccionar diapositiva"
        >
          {Array.from({ length: slideCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`hero-dot${index === activeSlide ? " is-active" : ""}`}
              aria-label={
                index === 0 ? "Mostrar video" : `Mostrar imagen ${index}`
              }
              aria-pressed={index === activeSlide}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>

        <button
          type="button"
          className="hero-arrow"
          aria-label="Diapositiva siguiente"
          onClick={() => showSlide(activeSlide + 1)}
        >
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </section>
  )
}
