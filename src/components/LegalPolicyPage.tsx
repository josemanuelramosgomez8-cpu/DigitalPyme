import { useEffect } from "react"
import type { LegalKind, SiteSettings } from "../lib/api"
import { getLegalPolicy } from "./modals/LegalDialog"

export default function LegalPolicyPage({
  kind,
  settings,
}: {
  kind: LegalKind
  settings: SiteSettings
}) {
  const { title, body } = getLegalPolicy(settings, kind)

  useEffect(() => {
    document.title = `${title} | DigitalPyme`
  }, [title])

  return (
    <main className="legal-page">
      <div className="container">
        <span className="kicker">Información para clientes</span>
        <h1>{title}</h1>
        {kind !== "complaints" && (
          <p className="legal-page-version">
            Versión {settings.legal.version}
          </p>
        )}
        {kind === "complaints" && settings.legal.complaints_url ? (
          <a
            className="button"
            href={settings.legal.complaints_url}
            target="_blank"
            rel="noreferrer"
          >
            Ir al Libro de Reclamaciones
          </a>
        ) : (
          <p className="legal-policy-copy">{body}</p>
        )}
      </div>
    </main>
  )
}
