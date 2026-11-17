import React, { useEffect, useState } from "react"
import Button from "../common/Button"
import Icon from "../common/Icon"
import {
  getAgendaSlots,
  reserveAgendaSlot,
  type AgendaSlot,
} from "../../lib/api"
import { separarContacto } from "../../constants/siteData"
import { useScrollLock } from "../../hooks/useScrollLock"

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function AgendaScheduler() {
  const today = new Date()
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [slots, setSlots] = useState<AgendaSlot[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refresh, setRefresh] = useState(0)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingState, setBookingState] =
    useState<"idle" | "sending" | "success" | "error">("idle")
  const [bookingError, setBookingError] = useState("")
  const [nombre, setNombre] = useState("")
  const [contacto, setContacto] = useState("")
  const [reservationMessage, setReservationMessage] = useState("")
  const [reservationWhatsappUrl, setReservationWhatsappUrl] =
    useState<string | null>(null)

  useScrollLock(bookingOpen)

  const key = monthKey(month)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    setSelectedSlot(null)

    void getAgendaSlots(key)
      .then((result) => {
        if (!active) return
        setSlots(result.slots)
        setSelectedDate((current) =>
          result.slots.some(
            (slot) => slot.date === current && slot.available > 0,
          )
            ? current
            : (result.slots.find((slot) => slot.available > 0)?.date ?? ""),
        )
      })
      .catch((loadError) => {
        if (!active) return
        setSlots([])
        setSelectedDate("")
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la agenda.",
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [key, refresh])

  useEffect(() => {
    if (!bookingOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && bookingState !== "sending") {
        setBookingOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [bookingOpen, bookingState])

  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() + 6, 1)
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate()
  const mondayOffset =
    (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7
  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7
  const calendarDays = Array.from({ length: totalCells }, (_, index) => {
    const day = index - mondayOffset + 1
    return day > 0 && day <= daysInMonth ? day : null
  })
  const availableDates = new Set(
    slots.filter((slot) => slot.available > 0).map((slot) => slot.date),
  )
  const selectedDaySlots = slots.filter((slot) => slot.date === selectedDate)
  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Selecciona una fecha disponible"

  const moveMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    )
    setSelectedDate("")
  }

  const confirmarReserva = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSlot) return
    setBookingState("sending")
    setBookingError("")

    try {
      const result = await reserveAgendaSlot({
        agenda_slot_id: selectedSlot.id,
        nombre,
        ...separarContacto(contacto),
      })
      setReservationMessage(
        [
          result.mensaje,
          !result.email_enviado ? "El aviso por correo no pudo enviarse." : "",
        ]
          .filter(Boolean)
          .join(" "),
      )
      setReservationWhatsappUrl(result.whatsapp_url)
      setBookingState("success")
      setRefresh((version) => version + 1)
    } catch (bookingSubmitError) {
      setBookingError(
        bookingSubmitError instanceof Error
          ? bookingSubmitError.message
          : "No se pudo reservar el horario.",
      )
      setBookingState("error")
    }
  }

  return (
    <>
      <div className="scheduler">
        <div className="calendar-pane">
          <div className="calendar-head">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={month <= currentMonth}
              onClick={() => moveMonth(-1)}
            >
              ‹
            </button>
            <b>
              {month.toLocaleDateString("es-PE", {
                month: "long",
                year: "numeric",
              })}
            </b>
            <button
              type="button"
              aria-label="Mes siguiente"
              disabled={month >= lastMonth}
              onClick={() => moveMonth(1)}
            >
              ›
            </button>
          </div>
          <div className="weekdays">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="days">
            {calendarDays.map((day, index) => {
              const date =
                day === null
                  ? ""
                  : dateKey(
                      new Date(month.getFullYear(), month.getMonth(), day),
                    )
              const available = Boolean(date && availableDates.has(date))
              const isSelected = date === selectedDate

              return (
                <button
                  key={`${date || "empty"}-${index}`}
                  type="button"
                  disabled={!available || loading}
                  className={isSelected ? "selected" : ""}
                  aria-label={date ? `Seleccionar ${date}` : undefined}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedSlot(null)
                  }}
                >
                  {day ?? ""}
                </button>
              )
            })}
          </div>
        </div>
        <div className="time-pane">
          <b>{selectedDateLabel}</b>
          <span>Hora de Lima (GMT-5)</span>
          {loading && <span>Cargando horarios disponibles...</span>}
          {!loading && error && <p className="form-status error">{error}</p>}
          {!loading && !error && selectedDaySlots.length === 0 && (
            <span>No hay horarios disponibles para esta fecha.</span>
          )}
          {selectedDaySlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              disabled={slot.available === 0}
              className={selectedSlot?.id === slot.id ? "selected" : ""}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.time}
              <span>
                {slot.available <= 2
                  ? `Quedan ${slot.available}`
                  : `${slot.available} disponibles`}
              </span>
            </button>
          ))}
          <button
            className="button"
            type="button"
            disabled={!selectedSlot || loading}
            onClick={() => {
              setBookingOpen(true)
              setBookingState("idle")
            }}
          >
            Confirmar horario
          </button>
        </div>
      </div>

      {bookingOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              bookingState !== "sending"
            )
              setBookingOpen(false)
          }}
        >
          <section
            className="quote-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Cerrar"
              disabled={bookingState === "sending"}
              onClick={() => setBookingOpen(false)}
            >
              <Icon name="x" />
            </button>
            {bookingState === "success" ? (
              <div className="quote-success">
                <span>
                  <Icon name="check" size={32} />
                </span>
                <h2 id="booking-title">Horario confirmado</h2>
                <p>
                  {reservationMessage} {selectedDateLabel}, {selectedSlot?.time}
                  .
                </p>
                {reservationWhatsappUrl && (
                  <p>
                    <a
                      href={reservationWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enviar aviso por WhatsApp
                    </a>
                  </p>
                )}
                <Button onClick={() => setBookingOpen(false)}>Cerrar</Button>
              </div>
            ) : (
              <form onSubmit={confirmarReserva}>
                <span className="kicker">Agenda una llamada</span>
                <h2 id="booking-title">Confirma tus datos</h2>
                <p>
                  {selectedDateLabel}, {selectedSlot?.time} · Hora de Lima
                  (GMT-5)
                </p>
                <div className="quote-fields">
                  <label>
                    <span>Nombre</span>
                    <input
                      required
                      maxLength={255}
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Correo o WhatsApp</span>
                    <input
                      required
                      value={contacto}
                      onChange={(event) => setContacto(event.target.value)}
                    />
                  </label>
                </div>
                {bookingError && (
                  <p className="form-status error">{bookingError}</p>
                )}
                <div className="quote-nav">
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={bookingState === "sending"}
                    onClick={() => setBookingOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button"
                    type="submit"
                    disabled={bookingState === "sending"}
                  >
                    {bookingState === "sending"
                      ? "Confirmando..."
                      : "Confirmar horario"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  )
}
