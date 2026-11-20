import React, { useEffect, useState } from "react"
import Icon from "../common/Icon"
import {
  requestQuoteVerificationCode,
  submitProposal,
  verifyQuoteEmailCode,
  type ApiService,
  type SolicitudResponse,
} from "../../lib/api"
import type { LegalKind } from "../../lib/api"
import {
  formatCurrency,
  formatServiceMeta,
  pricingCategories,
  quoteCountries,
  quoteModules,
  quotePaymentOptions,
  quoteTypes,
  type QuotePaymentChoice,
} from "../../constants/siteData"
import { serviceImage } from "../../ServiceCart"
import { useScrollLock } from "../../hooks/useScrollLock"

export function QuotePaymentIcon({
  method,
}: {
  method: QuotePaymentChoice | "later"
}) {
  if (method === "bank_transfer" || method === "yape") {
    const source =
      method === "bank_transfer"
        ? "/payment-methods/bcp.svg"
        : "/payment-methods/yape.png"
    return (
      <img
        className={`quote-payment-icon quote-payment-icon-${method}`}
        src={source}
        alt=""
        aria-hidden="true"
      />
    )
  }

  const commonProps = {
    className: `quote-payment-icon quote-payment-icon-${method}`,
    viewBox: "0 0 40 40",
    "aria-hidden": true as const,
  }

  return (
    <svg {...commonProps}>
      <circle className="quote-payment-icon-badge" cx="20" cy="20" r="17" />
      <path d="M14 15h.5M20 15h.5M26 15h.5M14 21h.5M20 21h.5M26 21h.5M14 27h.5M20 27h.5M26 27h.5" />
    </svg>
  )
}

export default function QuoteBuilder({
  services,
  initialServices,
  initialMessage,
  privacyPublished,
  onClose,
  onOpenLegal,
}: {
  services: ApiService[]
  initialServices: string[]
  initialMessage: string
  privacyPublished: boolean
  onClose: () => void
  onOpenLegal: (kind: LegalKind) => void
}) {
  useScrollLock(true)

  const [savedServices] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("digitalpyme.cart") ?? "[]",
      )
      return Array.isArray(saved)
        ? saved.filter((name): name is string => typeof name === "string")
        : []
    } catch {
      return []
    }
  })

  const isServiceCartRequest =
    initialMessage === "Servicios seleccionados desde el carrito"
  const requestedServices = [
    ...new Set(
      isServiceCartRequest
        ? initialServices
        : [...savedServices, ...initialServices],
    ),
  ]
  const initialType = requestedServices.some((name) => /tienda/i.test(name))
    ? "store"
    : /landing/i.test(initialMessage)
      ? "landing"
      : "website"
  const requestedPlan = initialMessage.match(
    /plan\s+(Profesional|Empresarial|Corporativo)/i,
  )?.[1]
  const [typeId, setTypeId] = useState(initialType)
  const [selectedPlanName, setSelectedPlanName] = useState(
    requestedPlan ?? "Empresarial",
  )
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [step, setStep] = useState(isServiceCartRequest ? 3 : 0)
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [pais, setPais] = useState("Perú|+51")
  const [mensaje, setMensaje] = useState("")
  const [metodoPagoPreferido, setMetodoPagoPreferido] =
    useState<QuotePaymentChoice>("undecided")
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [website, setWebsite] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle",
  )
  const [error, setError] = useState("")
  const [respuesta, setRespuesta] = useState<SolicitudResponse | null>(null)
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(
    null,
  )

  const selectedType =
    quoteTypes.find((type) => type.id === typeId) ?? quoteTypes[0]
  const planCategory = pricingCategories.find(
    (category) => category.title === selectedType.pricingCategory,
  )
  const selectedPlan = isServiceCartRequest
    ? null
    : (planCategory?.plans.find((plan) => plan.name === selectedPlanName) ??
      planCategory?.plans[1] ??
      null)
  const chosenModules = isServiceCartRequest
    ? []
    : quoteModules.filter((module) => selectedModules.includes(module.id))
  const estimatedTotal =
    (selectedPlan?.price ?? 0) +
    chosenModules.reduce((total, module) => total + (module.price ?? 0), 0)
  const hasUnpricedModules = chosenModules.some(
    (module) => module.price === null,
  )
  const hasPublishedPrice =
    selectedPlan !== null ||
    chosenModules.some((module) => module.price !== null)
  const annualRenewal = selectedPlan?.renewal ?? null

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = window.setTimeout(
      () => setResendCountdown((current) => current - 1),
      1000,
    )
    return () => window.clearTimeout(timer)
  }, [resendCountdown])

  const toggleModule = (id: string) => {
    setSelectedModules((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const validateRegistration = (): boolean => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !empresa.trim() ||
      !email.trim() ||
      !telefono.trim()
    ) {
      setError("Completa todos los campos obligatorios del registro comercial.")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.")
      return false
    }
    const digits = telefono.replace(/\D/g, "")
    if (digits.length < 7 || digits.length > 15) {
      setError(
        "Revisa el número de WhatsApp e incluye el código de país correcto.",
      )
      return false
    }
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setError(
        "Debes aceptar los términos y autorizar el uso de tus datos para continuar.",
      )
      return false
    }
    return true
  }

  const sendVerificationCode = async () => {
    setError("")
    setVerificationStatus("")
    if (!validateRegistration()) return

    setSendingCode(true)
    try {
      const result = await requestQuoteVerificationCode({
        email: email.trim(),
        website,
      })
      setCodeSent(true)
      setVerificationToken("")
      setVerificationCode("")
      setResendCountdown(60)
      setVerificationStatus(result.mensaje)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo enviar el código de verificación.",
      )
    } finally {
      setSendingCode(false)
    }
  }

  const verifyEmailCode = async () => {
    setError("")
    setVerificationStatus("")
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Ingresa el código de seis dígitos que enviamos a tu correo.")
      return
    }

    setVerifyingCode(true)
    try {
      const result = await verifyQuoteEmailCode({
        email: email.trim(),
        code: verificationCode,
        website,
      })
      if (!result.verification_token) {
        throw new Error(
          "No se recibió la confirmación de seguridad. Solicita un nuevo código.",
        )
      }
      setVerificationToken(result.verification_token)
      setVerificationStatus(result.mensaje)
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "No se pudo verificar el código.",
      )
    } finally {
      setVerifyingCode(false)
    }
  }

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault()
    if (step < 3) {
      setError("")
      setStep((current) => Math.min(current + 1, 3))
      return
    }
    if (!email.trim() && !telefono.trim()) {
      setError("Ingresa tu correo o WhatsApp para que podamos contactarte.")
      return
    }
    if (!verificationToken) {
      setError(
        "Verifica tu correo con el código de seis dígitos antes de enviar la solicitud.",
      )
      return
    }

    setEstado("enviando")
    setError("")

    try {
      const serviceNames = [
        ...new Set(
          requestedServices.length ? requestedServices : [selectedType.service],
        ),
      ]
      const unavailableServices = serviceNames.filter(
        (name) => !services.some((service) => service.nombre === name),
      )
      if (unavailableServices.length > 0) {
        setError(
          `No encontramos estos servicios en el catálogo actual: ${unavailableServices.join(", ")}. Actualiza la página e inténtalo nuevamente.`,
        )
        setEstado("error")
        return
      }
      const moduleSummary = chosenModules.length
        ? chosenModules
            .map(
              (module) =>
                `- ${module.name}${
                  module.price === null
                    ? " (a cotizar)"
                    : module.price === 0
                      ? " (incluido)"
                      : ` (S/ ${formatCurrency(module.price)})`
                }`,
            )
            .join("\n")
        : "- Sin módulos adicionales"
      const details = [
        `Tipo de proyecto: ${
          isServiceCartRequest ? "Servicios seleccionados" : selectedType.name
        }`,
        `Plan: ${
          isServiceCartRequest
            ? "Cotización a medida"
            : (selectedPlan?.name ?? "Personalizado")
        }`,
        `Precio publicado del plan: ${
          selectedPlan
            ? `S/ ${formatCurrency(selectedPlan.price)}`
            : "A cotizar"
        }`,
        selectedPlan
          ? `Renovación anual referencial: S/ ${formatCurrency(selectedPlan.renewal)}`
          : "",
        `Módulos adicionales:\n${moduleSummary}`,
        isServiceCartRequest || !hasPublishedPrice
          ? "Inversión: a cotizar según el alcance."
          : `Inversión referencial: S/ ${formatCurrency(estimatedTotal)}${
              hasUnpricedModules ? " más los módulos a cotizar" : ""
            }.`,
        `Método de pago preferido (referencial): ${
          quotePaymentOptions.find(
            (option) => option.value === metodoPagoPreferido,
          )?.label ?? "Aún no lo sé"
        }.`,
        mensaje.trim() ? `Detalles del proyecto: ${mensaje.trim()}` : "",
        initialMessage.trim()
          ? `Referencia de la página: ${initialMessage.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n")

      const result = await submitProposal({
        nombre: `${nombre.trim()} ${apellido.trim()}`.trim(),
        apellido: apellido.trim(),
        empresa: empresa.trim(),
        pais: pais.split("|")[0],
        email: email.trim(),
        telefono: `${pais.split("|")[1]}${telefono.replace(/\D/g, "")}`,
        servicios: serviceNames,
        verification_token: verificationToken,
        acepta_terminos: aceptaTerminos,
        acepta_privacidad: aceptaPrivacidad,
        website,
        metodo_pago_preferido:
          quotePaymentOptions.find(
            (option) => option.value === metodoPagoPreferido,
          )?.apiPreference ?? "undecided",
        mensaje: details,
      })
      setRespuesta(result)
      setEstado("ok")
      localStorage.removeItem("digitalpyme.cart")
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar la propuesta.",
      )
      setEstado("error")
    }
  }

  return (
    <div className="quote-configurator-backdrop">
      <section
        className="quote-configurator"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
      >
        <header className="quote-configurator-header">
          <div>
            <span className="kicker">
              {isServiceCartRequest
                ? "Checkout de servicios"
                : "Cotizador digital"}
            </span>
            <h2 id="quote-title">
              {isServiceCartRequest
                ? "Finaliza tu solicitud"
                : "Configura tu proyecto"}
            </h2>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Cerrar cotizador"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </header>

        {estado === "ok" ? (
          <div className="quote-success quote-configurator-success">
            <ol className="quote-wizard-steps" aria-label="Pasos de cotización">
              {(isServiceCartRequest
                ? ["Carrito", "Checkout"]
                : ["Tipo", "Plan", "Módulos", "Envío"]
              ).map((label, index) => (
                <li key={label} className="complete">
                  <span>{index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
            <span>
              <Icon name="check" size={32} />
            </span>
            <h2>¡Recibimos tu solicitud!</h2>
            <p>
              Revisaremos el alcance de tu proyecto y te contactaremos para
              enviarte una propuesta. Método elegido:{" "}
              <strong>
                {quotePaymentOptions.find(
                  (option) => option.value === metodoPagoPreferido,
                )?.label ?? "Aún no lo sé"}
              </strong>
              .
              {respuesta && !respuesta.email_enviado
                ? " El aviso por correo no pudo enviarse."
                : ""}
            </p>
            {(metodoPagoPreferido === "yape" ||
              metodoPagoPreferido === "bank_transfer") && (
              <section
                className="quote-payment-confirmation"
                aria-label="Instrucciones de pago"
              >
                <div className="quote-payment-confirmation-total">
                  <span>{hasPublishedPrice ? "Monto estimado" : "Monto"}</span>
                  <strong>
                    {respuesta?.inversion_estimada != null
                      ? `S/ ${formatCurrency(Number(respuesta.inversion_estimada))}`
                      : hasPublishedPrice
                        ? `S/ ${formatCurrency(estimatedTotal)}${
                            hasUnpricedModules ? " + módulos a cotizar" : ""
                          }`
                        : "A cotizar"}
                  </strong>
                  <small>El importe final se confirmará en la propuesta.</small>
                </div>
                {metodoPagoPreferido === "yape" ? (
                  <div className="quote-payment-confirmation-details">
                    <h3>Paga con Yape</h3>
                    <img
                      src="/images/yape-qr.png"
                      alt="Código QR de pago de DigitalPyme por Yape"
                    />
                    <p>
                      Titular: <strong>Juan Joseph Yacila Mogollon</strong>
                    </p>
                    <p>Escanea el QR desde Yape e ingresa el monto indicado.</p>
                  </div>
                ) : (
                  <div className="quote-payment-confirmation-details">
                    <h3>Transfiere por BCP</h3>
                    <p>
                      Titular: <strong>Juan Joseph Yacila Mogollon</strong>
                    </p>
                    <p>
                      Cuenta: <strong>4557881878532185</strong>
                    </p>
                    <p>
                      CCI: <strong>00257511695581204198</strong>
                    </p>
                    <p>
                      Transfiere el monto indicado y conserva tu constancia.
                    </p>
                  </div>
                )}
                <label className="quote-payment-receipt">
                  Adjunta tu constancia (PDF, JPG o PNG; máximo 10 MB)
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      if (file && file.size > 10 * 1024 * 1024) {
                        setPaymentReceiptFile(null)
                        event.currentTarget.value = ""
                        setError("La constancia no puede superar los 10 MB.")
                        return
                      }
                      setError("")
                      setPaymentReceiptFile(file)
                    }}
                  />
                </label>
                {error && (
                  <p className="form-status error" role="alert">
                    {error}
                  </p>
                )}
                {paymentReceiptFile && (
                  <p className="quote-payment-receipt-name">
                    Archivo seleccionado: {paymentReceiptFile.name}
                  </p>
                )}
                <p className="quote-payment-confirmation-note">
                  El archivo queda seleccionado en esta pantalla, pero todavía
                  no se envía al sistema para verificación. No cierres esta
                  ventana si necesitas conservar la selección.
                </p>
              </section>
            )}
            {respuesta?.whatsapp_url && (
              <a
                className="button"
                href={respuesta.whatsapp_url}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="whatsapp" size={17} /> Continuar por WhatsApp
              </a>
            )}
          </div>
        ) : (
          <>
            <ol className="quote-wizard-steps" aria-label="Pasos de cotización">
              {(isServiceCartRequest
                ? ["Carrito", "Checkout"]
                : ["Tipo", "Plan", "Módulos", "Envío"]
              ).map((label, index) => (
                <li
                  key={label}
                  className={
                    isServiceCartRequest
                      ? index === 0
                        ? "complete"
                        : "active"
                      : step === index
                        ? "active"
                        : step > index
                          ? "complete"
                          : ""
                  }
                >
                  <span>{index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
            {isServiceCartRequest && (
              <p className="quote-request-status" role="status">
                Tu pedido se está cotizando. Completa el registro y verifica tu
                correo para formalizar la solicitud; no se realizará ningún
                cobro todavía.
              </p>
            )}
            <div
              className={`quote-wizard-layout${
                isServiceCartRequest ? " quote-checkout-layout" : ""
              }`}
            >
              <form
                className="quote-wizard-main"
                onSubmit={(event) => void enviar(event)}
              >
                {step === 0 && (
                  <section>
                    <h3>¿Qué tipo de web necesitas?</h3>
                    <p className="quote-step-intro">
                      Elige el tipo de proyecto que mejor se ajuste a tu
                      objetivo.
                    </p>
                    <div className="quote-type-grid">
                      {quoteTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          className={typeId === type.id ? "selected" : ""}
                          aria-pressed={typeId === type.id}
                          onClick={() => {
                            setTypeId(type.id)
                            setSelectedPlanName("Empresarial")
                          }}
                        >
                          <span className="quote-type-icon" aria-hidden="true">
                            {type.icon}
                          </span>
                          <strong>{type.name}</strong>
                          <small>{type.description}</small>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {step === 1 && (
                  <section>
                    <h3>Elige tu plan {selectedType.name}</h3>
                    <p className="quote-step-intro">
                      Compara las opciones. El alcance definitivo se confirma en
                      la propuesta.
                    </p>
                    {planCategory ? (
                      <div className="quote-plan-grid">
                        {planCategory.plans.map((plan) => (
                          <button
                            key={plan.name}
                            type="button"
                            className={
                              selectedPlanName === plan.name ? "selected" : ""
                            }
                            aria-pressed={selectedPlanName === plan.name}
                            onClick={() => setSelectedPlanName(plan.name)}
                          >
                            <span className="quote-plan-audience">
                              {plan.audience}
                            </span>
                            <strong>{plan.name}</strong>
                            <b>S/ {formatCurrency(plan.price)}</b>
                            <span>
                              {plan.pages} · {plan.sections}
                            </span>
                            <small>{plan.extras.slice(0, 4).join(" · ")}</small>
                            <span className="quote-plan-time">
                              Entrega estimada: {plan.delivery}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="quote-custom-plan">
                        <span className="kicker">A medida</span>
                        <h4>Catálogo online</h4>
                        <p>
                          Definiremos contigo el número de productos y las
                          funciones para mostrar tu catálogo. El precio se
                          confirma en la propuesta.
                        </p>
                        <strong>Cotización personalizada</strong>
                      </div>
                    )}
                  </section>
                )}

                {step === 2 && (
                  <section>
                    <h3>Selecciona módulos adicionales</h3>
                    <p className="quote-step-intro">
                      Marca las funciones que te interesan. Las opciones por
                      cotizar se detallarán en la propuesta.
                    </p>
                    <div className="quote-module-grid">
                      {quoteModules.map((module) => {
                        const checked = selectedModules.includes(module.id)
                        return (
                          <label
                            key={module.id}
                            className={checked ? "selected" : ""}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleModule(module.id)}
                            />
                            <span>
                              <strong>{module.name}</strong>
                              <small>{module.description}</small>
                            </span>
                            <b>
                              {module.price === null
                                ? "A cotizar"
                                : module.price === 0
                                  ? "Incluido"
                                  : `S/ ${formatCurrency(module.price)}`}
                            </b>
                          </label>
                        )
                      })}
                    </div>
                    <p className="quote-included-note">
                      El hosting, dominio, correos y SSL se incluyen o cotizan
                      según el plan y sus condiciones de renovación.
                    </p>
                  </section>
                )}

                {step === 3 && (
                  <section>
                    <h3>
                      {isServiceCartRequest
                        ? "Información de contacto"
                        : "Registro comercial para formalizar tu cotización"}
                    </h3>
                    <p className="quote-step-intro">
                      {isServiceCartRequest
                        ? "Completa tus datos para que podamos preparar y enviarte la cotización."
                        : "Completa tus datos de contacto y verifica tu correo. Tu solicitud no se enviará hasta completar este paso."}
                    </p>
                    <div className="quote-contact-grid">
                      <label>
                        <span>Nombre *</span>
                        <input
                          required
                          maxLength={120}
                          value={nombre}
                          onChange={(event) => setNombre(event.target.value)}
                          autoComplete="given-name"
                        />
                      </label>
                      <label>
                        <span>Apellido *</span>
                        <input
                          required
                          maxLength={120}
                          value={apellido}
                          onChange={(event) => setApellido(event.target.value)}
                          autoComplete="family-name"
                        />
                      </label>
                      <label>
                        <span>País *</span>
                        <select
                          value={pais}
                          onChange={(event) => setPais(event.target.value)}
                        >
                          {quoteCountries.map((country) => (
                            <option key={country.value} value={country.value}>
                              {country.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>WhatsApp *</span>
                        <span className="quote-phone-field">
                          <span>{pais.split("|")[1]}</span>
                          <input
                            required
                            type="tel"
                            inputMode="tel"
                            maxLength={20}
                            value={telefono}
                            onChange={(event) =>
                              setTelefono(event.target.value)
                            }
                            autoComplete="tel-national"
                          />
                        </span>
                      </label>
                      <label>
                        <span>Correo electrónico *</span>
                        <input
                          required
                          type="email"
                          maxLength={255}
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value)
                            setCodeSent(false)
                            setVerificationToken("")
                            setVerificationCode("")
                            setVerificationStatus("")
                            setResendCountdown(0)
                          }}
                          autoComplete="email"
                        />
                      </label>
                      <label>
                        <span>Nombre de tu empresa *</span>
                        <input
                          required
                          maxLength={255}
                          value={empresa}
                          onChange={(event) => setEmpresa(event.target.value)}
                          autoComplete="organization"
                        />
                      </label>
                      <label className="quote-contact-message">
                        <span>
                          Cuéntanos brevemente sobre tu proyecto (opcional)
                        </span>
                        <textarea
                          maxLength={500}
                          value={mensaje}
                          onChange={(event) => setMensaje(event.target.value)}
                        />
                      </label>
                    </div>
                    <fieldset
                      className={`quote-payment-preference${
                        isServiceCartRequest ? " quote-checkout-payment" : ""
                      }`}
                    >
                      <legend>¿Cómo deseas pagar?</legend>
                      <p>
                        Al enviar la solicitud verás los datos del método
                        elegido y el monto estimado de tu cotización.
                      </p>
                      <div>
                        {quotePaymentOptions
                          .filter((option) =>
                            ["bank_transfer", "yape", "undecided"].includes(
                              option.value,
                            ),
                          )
                          .map((option) => (
                            <label
                              key={option.value}
                              className={
                                metodoPagoPreferido === option.value
                                  ? "selected"
                                  : ""
                              }
                            >
                              <input
                                type="radio"
                                name="metodo-pago-preferido"
                                value={option.value}
                                checked={metodoPagoPreferido === option.value}
                                onChange={() =>
                                  setMetodoPagoPreferido(option.value)
                                }
                              />
                              <QuotePaymentIcon method={option.icon} />
                              <span>
                                <strong>{option.label}</strong>
                                <small>{option.description}</small>
                              </span>
                            </label>
                          ))}
                      </div>
                      <p className="quote-payment-disclaimer">
                        El monto es estimado y puede cambiar al revisar el
                        alcance. No compartas claves, PIN ni códigos bancarios.
                      </p>
                    </fieldset>
                    <div className="quote-consents">
                      <label>
                        <input
                          type="checkbox"
                          checked={aceptaTerminos}
                          onChange={(event) =>
                            setAceptaTerminos(event.target.checked)
                          }
                        />
                        <span>
                          Acepto los términos de contratación para solicitar
                          esta cotización. *{" "}
                          <button
                            type="button"
                            onClick={() => onOpenLegal("terms")}
                          >
                            Leer términos
                          </button>
                        </span>
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={aceptaPrivacidad}
                          onChange={(event) =>
                            setAceptaPrivacidad(event.target.checked)
                          }
                        />
                        <span>
                          Autorizo el uso de mis datos personales para gestionar
                          esta solicitud y contactarme por los medios indicados.
                          *
                          {privacyPublished && (
                            <>
                              {" "}
                              <button
                                type="button"
                                onClick={() => onOpenLegal("privacy")}
                              >
                                Leer aviso de privacidad
                              </button>
                            </>
                          )}
                        </span>
                      </label>
                    </div>
                    <p className="quote-contact-hint">
                      El código se enviará al correo electrónico. El WhatsApp es
                      obligatorio para el contacto, pero no se verifica por SMS
                      en esta versión.
                    </p>
                    <div className="quote-email-verification">
                      <div>
                        <strong>Verificación de seguridad por correo</strong>
                        <small>
                          Enviaremos un código de seis dígitos a{" "}
                          {email.trim() || "tu correo electrónico"}. El código
                          vence en 10 minutos.
                        </small>
                      </div>
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={
                          sendingCode ||
                          verifyingCode ||
                          resendCountdown > 0 ||
                          Boolean(verificationToken)
                        }
                        onClick={() => void sendVerificationCode()}
                      >
                        {sendingCode
                          ? "Enviando código..."
                          : verificationToken
                            ? "Correo verificado"
                            : resendCountdown > 0
                              ? `Reenviar en ${resendCountdown}s`
                              : codeSent
                                ? "Reenviar código"
                                : "Enviar código"}
                      </button>
                      {codeSent && !verificationToken && (
                        <div className="quote-verify-code">
                          <label>
                            <span>Código de verificación</span>
                            <input
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(event) =>
                                setVerificationCode(
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6),
                                )
                              }
                            />
                          </label>
                          <button
                            className="button"
                            type="button"
                            disabled={
                              verifyingCode || verificationCode.length !== 6
                            }
                            onClick={() => void verifyEmailCode()}
                          >
                            {verifyingCode
                              ? "Verificando..."
                              : "Validar código"}
                          </button>
                        </div>
                      )}
                      {verificationStatus && (
                        <p
                          className={
                            verificationToken
                              ? "quote-verification-success"
                              : "quote-verification-status"
                          }
                          role="status"
                        >
                          {verificationStatus}
                        </p>
                      )}
                    </div>
                    <label className="quote-honeypot" aria-hidden="true">
                      Deja este campo vacío
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                      />
                    </label>
                  </section>
                )}

                {error && <p className="form-status error">{error}</p>}
                <div className="quote-wizard-actions">
                  {step > 0 && !isServiceCartRequest && (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => {
                        setError("")
                        setStep((current) => current - 1)
                      }}
                    >
                      Anterior
                    </button>
                  )}
                  <button
                    className="button"
                    type="submit"
                    disabled={
                      estado === "enviando" ||
                      (step === 3 && !verificationToken)
                    }
                  >
                    {step < 3
                      ? "Siguiente"
                      : estado === "enviando"
                        ? "Enviando..."
                        : "Enviar solicitud"}
                  </button>
                </div>
              </form>

              <aside
                className={`quote-summary${
                  isServiceCartRequest ? " quote-checkout-summary" : ""
                }`}
              >
                <h3>
                  {isServiceCartRequest
                    ? "Resumen de solicitud"
                    : "Tu inversión estimada"}
                </h3>
                <div className="quote-summary-price">
                  {hasPublishedPrice ? (
                    <>
                      S/ {formatCurrency(estimatedTotal)}
                      {hasUnpricedModules && (
                        <small> más módulos a cotizar</small>
                      )}
                    </>
                  ) : (
                    "A cotizar"
                  )}
                </div>
                {selectedPlan && (
                  <p className="quote-summary-delivery">
                    Entrega estimada en {selectedPlan.delivery}
                  </p>
                )}
                {annualRenewal !== null && (
                  <p className="quote-summary-renewal">
                    Renovación anual referencial: S/{" "}
                    {formatCurrency(annualRenewal)}
                  </p>
                )}
                <div className="quote-summary-section">
                  <strong>
                    {isServiceCartRequest
                      ? "Servicios seleccionados"
                      : "Resumen del proyecto"}
                  </strong>
                  {isServiceCartRequest ? (
                    requestedServices.map((name) => {
                      const service = services.find(
                        (item) => item.nombre === name,
                      )
                      return (
                        <div className="quote-checkout-item" key={name}>
                          <img
                            src={
                              service
                                ? serviceImage(service)
                                : "/images/services/servicio-digital.jpg"
                            }
                            alt=""
                          />
                          <span>
                            <b>{name}</b>
                            <small>
                              {service?.category?.nombre ??
                                service?.categoria ??
                                "Servicio digital"}
                            </small>
                          </span>
                          <small>
                            {service ? formatServiceMeta(service) : "A cotizar"}
                          </small>
                        </div>
                      )
                    })
                  ) : (
                    <>
                      <p>
                        {selectedType.name}:{" "}
                        {selectedPlan?.name ?? "Plan personalizado"}
                      </p>
                      {selectedPlan && (
                        <small>
                          {selectedPlan.pages} / {selectedPlan.sections}
                        </small>
                      )}
                      {requestedServices
                        .filter((name) => name !== selectedType.service)
                        .map((name) => (
                          <small key={name}>{name}</small>
                        ))}
                    </>
                  )}
                </div>
                {!isServiceCartRequest && (
                  <div className="quote-summary-section">
                    <strong>Módulos</strong>
                    {chosenModules.length > 0 ? (
                      chosenModules.map((module) => (
                        <small key={module.id}>
                          {module.name}
                          {module.price === null
                            ? " · a cotizar"
                            : module.price === 0
                              ? " · incluido"
                              : ` · S/ ${formatCurrency(module.price)}`}
                        </small>
                      ))
                    ) : (
                      <small>No seleccionaste módulos adicionales.</small>
                    )}
                  </div>
                )}
                <p className="quote-summary-disclaimer">
                  {isServiceCartRequest
                    ? "La solicitud no genera cobros. Revisaremos los servicios y te enviaremos una cotización formal para que puedas aprobarla antes de pagar."
                    : "Precios referenciales en soles, sin IGV. El precio final y los plazos se confirman en la propuesta. No se realizará ningún cobro desde este formulario."}
                </p>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
