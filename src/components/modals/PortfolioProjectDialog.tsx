import { useEffect, useRef } from "react"
import Icon from "../common/Icon"
import type { ApiPortfolioProject } from "../../lib/api"

export default function PortfolioProjectDialog({
  project,
  onClose,
}: {
  project: ApiPortfolioProject
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
        return
      }
      if (event.key !== "Tab") return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()
    window.addEventListener("keydown", handleDialogKeys)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleDialogKeys)
      previouslyFocused?.focus()
    }
  }, [onClose])

  const isSample = project.categoria === "Concepto de muestra"
  const deliverables = project.entregables ?? []
  const technologies = project.tecnologias ?? []

  return (
    <div
      className="modal-backdrop project-detail-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="project-detail-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        aria-describedby="project-detail-description"
      >
        <button
          ref={closeButtonRef}
          className="modal-close"
          type="button"
          aria-label="Cerrar detalle del proyecto"
          onClick={onClose}
        >
          <Icon name="x" />
        </button>
        <img
          className="project-detail-image"
          src={project.imagen}
          alt={project.imagen_alt || `Vista de ${project.nombre}`}
        />
        <div className="project-detail-content">
          <div className="project-detail-eyebrow">
            <span className="project-detail-category">{project.categoria}</span>
            {isSample && (
              <span className="project-detail-disclaimer">
                Concepto visual; no es un proyecto de cliente.
              </span>
            )}
            {isSample && (
              <span className="project-detail-photo-note">
                Fotografía ilustrativa de Unsplash.
              </span>
            )}
          </div>
          <h2 id="project-detail-title">{project.nombre}</h2>
          <p id="project-detail-description" className="project-detail-summary">
            {project.descripcion_larga || project.resultado}
          </p>

          <div className="project-detail-result">
            <span>
              {isSample ? "Enfoque del concepto" : "Resumen del proyecto"}
            </span>
            <p>{project.resultado}</p>
          </div>

          {(project.desafio || project.solucion) && (
            <div className="project-detail-story">
              {project.desafio && (
                <section>
                  <h3>{isSample ? "Necesidad que explora" : "Desafío"}</h3>
                  <p>{project.desafio}</p>
                </section>
              )}
              {project.solucion && (
                <section>
                  <h3>{isSample ? "Propuesta conceptual" : "Solución"}</h3>
                  <p>{project.solucion}</p>
                </section>
              )}
            </div>
          )}

          {deliverables.length > 0 && (
            <section className="project-detail-list">
              <h3>{isSample ? "Elementos ilustrados" : "Entregables"}</h3>
              <ul>
                {deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {technologies.length > 0 && (
            <section className="project-detail-list">
              <h3>
                {isSample ? "Enfoque de diseño" : "Tecnologías y herramientas"}
              </h3>
              <div className="project-detail-tags">
                {technologies.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </section>
          )}

          <div className="project-detail-actions">
            <button className="button" type="button" onClick={onClose}>
              Volver al portafolio
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
