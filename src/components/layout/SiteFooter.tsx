import React from "react"
import Brand from "../common/Brand"
import type { SiteSettings } from "../../lib/api"

export default function SiteFooter({
  settings,
  onNavigate,
  onOpenLegal,
}: {
  settings: SiteSettings
  onNavigate: (path: string) => void
  onOpenLegal: (kind: "privacy" | "warranty" | "terms" | "returns") => void
}) {
  const whatsapp = settings.contact.whatsapp_phone?.replace(/\D/g, "")
  const coverage =
    settings.coverage.digital_mode === "virtual"
      ? "Atención virtual en todo el Perú"
      : "Lima, Perú · Atención en todo el país"

  const navigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div className="site-footer-brand">
          <a
            href="/#inicio"
            aria-label="DigitalPyme, ir al inicio"
            onClick={(event) => navigate(event, "/#inicio")}
          >
            <Brand light />
          </a>
          <p>Soluciones digitales simples para negocios que quieren crecer.</p>
        </div>

        <nav
          className="site-footer-column"
          aria-label="Navegación del pie de página"
        >
          <h2>Explora</h2>
          <a
            href="/#servicios"
            onClick={(event) => navigate(event, "/#servicios")}
          >
            Servicios
          </a>
          <a href="/precios" onClick={(event) => navigate(event, "/precios")}>
            Precios
          </a>
          <a
            href="/catalogo-servicios"
            onClick={(event) => navigate(event, "/catalogo-servicios")}
          >
            Catálogo de servicios
          </a>
          <a
            href="/#proyectos"
            onClick={(event) => navigate(event, "/#proyectos")}
          >
            Proyectos
          </a>
          <a href="/#agenda" onClick={(event) => navigate(event, "/#agenda")}>
            Agenda
          </a>
          <a
            href="/#contacto"
            onClick={(event) => navigate(event, "/#contacto")}
          >
            Contacto
          </a>
        </nav>

        <div className="site-footer-column">
          <h2>Hablemos</h2>
          <a href="mailto:hola@digitalpyme.pe">hola@digitalpyme.pe</a>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: {settings.contact.whatsapp_phone}
            </a>
          )}
          <span>{coverage}</span>
        </div>

        <nav className="site-footer-column" aria-label="Información legal">
          <h2>Información</h2>
          <button type="button" onClick={() => onOpenLegal("warranty")}>
            Garantía
          </button>
          <button type="button" onClick={() => onOpenLegal("terms")}>
            Términos y condiciones
          </button>
          {settings.legal.privacy_published &&
            settings.legal.privacy?.trim() && (
              <button type="button" onClick={() => onOpenLegal("privacy")}>
                Privacidad
              </button>
            )}
          {settings.legal.returns?.trim() && (
            <button type="button" onClick={() => onOpenLegal("returns")}>
              Cambios y devoluciones
            </button>
          )}
        </nav>

        <div className="site-footer-bottom">
          <span>
            © {new Date().getFullYear()} DigitalPyme. Todos los derechos
            reservados.
          </span>
          <span>Hecho en Perú</span>
        </div>
      </div>
    </footer>
  )
}
