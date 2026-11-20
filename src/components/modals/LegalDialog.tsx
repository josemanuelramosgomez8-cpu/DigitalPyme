import { useEffect } from "react"
import Icon from "../common/Icon"
import type { LegalKind, SiteSettings } from "../../lib/api"
import { useScrollLock } from "../../hooks/useScrollLock"

export default function LegalDialog({
  kind,
  settings,
  onClose,
}: {
  kind: LegalKind
  settings: SiteSettings
  onClose: () => void
}) {
  useScrollLock(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const { title, body } = getLegalPolicy(settings, kind)

  return (
    <div
      className="modal-backdrop legal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="legal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
        >
          <Icon name="x" />
        </button>
        <span className="kicker">Información para clientes</span>
        <h2 id="legal-title">{title}</h2>
        <p className="legal-policy-copy">{body}</p>
        <button className="button" type="button" onClick={onClose}>
          Entendido
        </button>
      </section>
    </div>
  )
}

export function getLegalPolicy(
  settings: SiteSettings,
  kind: LegalKind,
): { title: string; body: string } {
  const policies: Record<Exclude<LegalKind, "complaints">, { title: string; body: string }> = {
    privacy: {
      title: "Privacidad y protección de datos personales",
      body: settings.legal.privacy ?? "",
    },
    warranty: { title: "Garantía", body: settings.legal.warranty },
    terms: { title: "Términos y condiciones", body: settings.legal.terms },
    payments: {
      title: "Pagos y facturación",
      body: settings.legal.payments,
    },
    returns: {
      title: "Reembolsos y cancelaciones",
      body: settings.legal.returns,
    },
    revisions: {
      title: "Revisiones y entregas",
      body: settings.legal.revisions,
    },
    intellectual_property: {
      title: "Propiedad intelectual",
      body: settings.legal.intellectual_property,
    },
    promotions: {
      title: "Promociones",
      body: settings.legal.promotions,
    },
  }

  if (kind === "complaints") {
    return {
      title: "Libro de Reclamaciones virtual",
      body: settings.legal.complaints_url
        ? "Continúa al canal virtual configurado para registrar tu reclamación."
        : "El enlace oficial del Libro de Reclamaciones debe configurarse antes de recibir reclamaciones por este medio. Contacto provisional: hola@digitalpyme.pe.\n\n[REVISAR LEGAL: configurar el enlace oficial y los datos del proveedor/titular antes de publicar.]",
    }
  }

  return policies[kind]
}
