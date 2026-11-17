import { useEffect, useRef, useState, type FormEvent } from "react"
import Icon from "../common/Icon"
import {
  submitServiceReview,
  type ApiService,
  type ServiceReview,
} from "../../lib/api"

export default function ReviewSubmissionDialog({
  services,
  onClose,
  onSubmitted,
}: {
  services: ApiService[]
  onClose: () => void
  onSubmitted: (review: ServiceReview) => void
}) {
  const [serviceId, setServiceId] = useState(() =>
    String(services.find((service) => service.id)?.id ?? ""),
  )
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const availableServices = services.filter(
    (service): service is ApiService & { id: number } =>
      typeof service.id === "number",
  )
  const firstServiceId = availableServices[0]?.id

  useEffect(() => {
    if (!serviceId && firstServiceId !== undefined)
      setServiceId(String(firstServiceId))
  }, [firstServiceId, serviceId])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submittingRef.current) onClose()
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
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
      previouslyFocused?.focus()
    }
  }, [onClose])

  const submitReview = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setStatus("")
    const selectedService = availableServices.find(
      (service) => String(service.id) === serviceId,
    )
    if (!selectedService) {
      setError(
        "Selecciona el servicio sobre el que quieres compartir tu experiencia.",
      )
      return
    }

    setSubmitting(true)
    submittingRef.current = true
    try {
      const result = await submitServiceReview(selectedService.id, {
        nombre: name,
        email,
        calificacion: rating,
        titulo: title,
        comentario: comment,
      })
      setStatus(result.mensaje)
      onSubmitted({
        id: result.id,
        servicio_id: selectedService.id,
        nombre: name.trim(),
        calificacion: rating,
        titulo: title.trim() || null,
        comentario: comment.trim(),
        aprobada: false,
        created_at: new Date().toISOString(),
        service: { id: selectedService.id, nombre: selectedService.nombre },
      })
      setName("")
      setEmail("")
      setTitle("")
      setComment("")
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar la reseña. Intenta nuevamente.",
      )
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="review-submit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-submit-title"
      >
        <button
          ref={closeButtonRef}
          className="modal-close"
          type="button"
          aria-label="Cerrar formulario de reseña"
          onClick={onClose}
          disabled={submitting}
        >
          <Icon name="x" />
        </button>
        <span className="kicker">Tu experiencia cuenta</span>
        <h2 id="review-submit-title">Escribe una reseña</h2>
        <p>
          Cuéntanos sobre un servicio que recibiste. Revisaremos tu comentario
          antes de publicarlo.
        </p>
        {status ? (
          <div className="review-submit-success" role="status">
            <strong>¡Gracias por compartir tu experiencia!</strong>
            <p>{status}</p>
            <button className="button" type="button" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : availableServices.length === 0 ? (
          <div className="review-submit-error" role="alert">
            <p>
              No se pudieron cargar los servicios para asociar tu reseña.
              Intenta de nuevo más tarde.
            </p>
          </div>
        ) : (
          <form
            className="review-submit-form"
            onSubmit={(event) => void submitReview(event)}
          >
            <label>
              Servicio
              <select
                required
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                <option value="" disabled>
                  Selecciona un servicio
                </option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nombre}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="review-submit-rating">
              <legend>Calificación</legend>
              <div>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    key={value}
                    title={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                  >
                    <input
                      type="radio"
                      name="review-rating"
                      value={value}
                      checked={rating === value}
                      onChange={() => setRating(value)}
                    />
                    <span aria-hidden="true">
                      {value <= rating ? "★" : "☆"}
                    </span>
                    <span className="sr-only">
                      {value} {value === 1 ? "estrella" : "estrellas"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              Nombre
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Correo electrónico
              <input
                required
                type="email"
                maxLength={255}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Título (opcional)
              <input
                maxLength={160}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              Tu reseña
              <textarea
                required
                maxLength={2000}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>
            {error && (
              <p className="review-submit-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar reseña"}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
