import { useEffect } from "react"
import Icon from "../common/Icon"
import type { SiteSettings } from "../../lib/api"
import { useScrollLock } from "../../hooks/useScrollLock"

export default function LegalDialog({
  kind,
  settings,
  onClose,
}: {
  kind: "privacy" | "warranty" | "terms" | "returns"
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

  const title =
    kind === "privacy"
      ? "Política de privacidad"
      : kind === "warranty"
        ? "Garantía"
        : kind === "returns"
          ? "Política de devoluciones"
          : "Términos de contratación"

  const body =
    kind === "privacy"
      ? settings.legal.privacy
      : kind === "warranty"
        ? settings.legal.warranty
        : kind === "returns"
          ? settings.legal.returns
          : settings.legal.terms

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
        <p>{body}</p>
        <button className="button" type="button" onClick={onClose}>
          Entendido
        </button>
      </section>
    </div>
  )
}
