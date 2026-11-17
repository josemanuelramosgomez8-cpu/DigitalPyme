import React, { useEffect, useState } from "react"
import Button from "../common/Button"
import Icon from "../common/Icon"
import { submitLead, type ApiService } from "../../lib/api"
import {
  fallbackServices,
  formatCurrency,
  separarContacto,
} from "../../constants/siteData"

export default function ContactForm({ services }: { services: ApiService[] }) {
  const [nombre, setNombre] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [servicio, setServicio] = useState(fallbackServices[0].nombre)
  const [contacto, setContacto] = useState("")
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle",
  )
  const [error, setError] = useState("")
  const [respuesta, setRespuesta] = useState<{
    emailEnviado: boolean
    whatsappUrl: string | null
  } | null>(null)

  const servicioSeleccionado = services.find((item) => item.nombre === servicio)
  const inversionEstimada =
    servicioSeleccionado?.precio_desde == null
      ? null
      : Number(servicioSeleccionado.precio_desde)

  useEffect(() => {
    if (
      services.length > 0 &&
      !services.some((item) => item.nombre === servicio)
    ) {
      setServicio(services[0].nombre)
    }
  }, [services, servicio])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!nombre.trim()) {
      setEstado("error")
      setError("Escribe tu nombre para poder registrar la solicitud.")
      return
    }
    if (!contacto.trim()) {
      setEstado("error")
      setError("Escribe un correo o número de WhatsApp para poder contactarte.")
      return
    }
    if (
      contacto.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.trim())
    ) {
      setEstado("error")
      setError(
        "Revisa el formato del correo electrónico o ingresa tu número de WhatsApp.",
      )
      return
    }
    setEstado("enviando")

    try {
      const result = await submitLead({
        nombre: nombre.trim(),
        empresa: empresa.trim(),
        servicio,
        ...separarContacto(contacto),
      })
      setRespuesta({
        emailEnviado: result.email_enviado,
        whatsappUrl: result.whatsapp_url,
      })
      setEstado("ok")
      setNombre("")
      setEmpresa("")
      setServicio(services[0]?.nombre ?? "")
      setContacto("")
    } catch (submitError) {
      setRespuesta(null)
      setEstado("error")
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar la solicitud. Verifica tu conexión e inténtalo otra vez.",
      )
    }
  }

  return (
    <form className="contact-form" onSubmit={enviar}>
      <div className="field-row">
        <label>
          <span>Nombre</span>
          <input
            required
            maxLength={255}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>
        <label>
          <span>Empresa</span>
          <input
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nombre de tu negocio"
          />
        </label>
      </div>

      <label>
        <span>Servicio</span>
        <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
          {services.map((item) => (
            <option key={item.id ?? item.nombre} value={item.nombre}>
              {item.nombre}
            </option>
          ))}
        </select>
        <small>
          Inversión estimada:{" "}
          {inversionEstimada === null
            ? "A cotizar"
            : `S/ ${formatCurrency(inversionEstimada)}`}
        </small>
      </label>

      <label>
        <span>Correo o WhatsApp</span>
        <input
          required
          maxLength={255}
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          placeholder="ej. hola@digitalpyme.pe o 987654321"
        />
      </label>

      {estado === "ok" && (
        <p className="form-status success">
          ¡Gracias! Tu solicitud fue enviada correctamente.
          {respuesta &&
            !respuesta.emailEnviado &&
            " No pudimos enviar el aviso por correo."}
          {respuesta?.whatsappUrl && (
            <>
              {" "}
              <a href={respuesta.whatsappUrl} target="_blank" rel="noreferrer">
                Continuar por WhatsApp
              </a>
            </>
          )}
        </p>
      )}
      {estado === "error" && (
        <p className="form-status error">
          {error || "No pudimos enviar tu mensaje. Inténtalo otra vez."}
        </p>
      )}

      <Button
        type="submit"
        className="full-width-btn"
        disabled={estado === "enviando"}
      >
        <Icon name="send" size={17} />
        {estado === "enviando" ? "Enviando..." : "Solicitar presupuesto"}
      </Button>
    </form>
  )
}
