import React, { useEffect, useState } from "react"
import Brand from "../common/Brand"
import Icon from "../common/Icon"
import ClientStoreOrders from "../../ClientStoreOrders"
import {
  adminLogin,
  approveProjectMilestone,
  changeClientPassword,
  clientLogin,
  clientLogout,
  downloadClientPaymentReceipt,
  downloadProjectFile,
  getClientPaymentOptions,
  getClientProject,
  getClientProjects,
  registerClient,
  respondToProjectDelivery,
  startBankTransfer,
  uploadTransferReceipt,
  type ClientPaymentOptions,
  type ClientProject,
  type ClientSession,
  type ProjectFile,
  type ProjectPayment,
  SESSION_EXPIRED_EVENT,
} from "../../lib/api"
import { formatCurrency } from "../../constants/siteData"
import { useScrollLock } from "../../hooks/useScrollLock"

export type PortalTab = "resumen" | "proyecto" | "pagos" | "archivos" | "pedidos" | "cuenta"
export type CheckoutDemoMethod = "card" | "paypal" | "yape"
export type CheckoutDemoTarget = { label: string; amount: number }

function restoreClientSession(): ClientSession | null {
  try {
    localStorage.removeItem("digitalpyme.client.token")
    localStorage.removeItem("digitalpyme.client.user")
    const token = sessionStorage.getItem("digitalpyme.client.token")
    const usuario = sessionStorage.getItem("digitalpyme.client.user")
    if (!token || !usuario) return null
    return { token, usuario: JSON.parse(usuario) as ClientSession["usuario"] }
  } catch {
    return null
  }
}

export function ProjectPaymentDemo({
  target,
  method,
  notice,
  onMethodChange,
  onSimulate,
  onClose,
}: {
  target: CheckoutDemoTarget
  method: CheckoutDemoMethod
  notice: string
  onMethodChange: (method: CheckoutDemoMethod) => void
  onSimulate: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  const methods: { id: CheckoutDemoMethod; label: string; detail: string }[] = [
    {
      id: "card",
      label: "Tarjeta de crédito o débito",
      detail: "Visa · Mastercard · American Express",
    },
    {
      id: "paypal",
      label: "PayPal",
      detail: "Pago mediante una futura conexión con PayPal",
    },
    {
      id: "yape",
      label: "Yape",
      detail: "Pago con Yape cuando se habilite el proveedor",
    },
  ]

  return (
    <div
      className="modal-backdrop checkout-demo-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="checkout-demo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-demo-title"
      >
        <header className="checkout-demo-header">
          <div>
            <span className="kicker">Portal cliente · modo de prueba</span>
            <h2 id="checkout-demo-title">Método de pago</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Cerrar métodos de pago"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </header>
        <div className="checkout-demo-amount">
          <span>{target.label}</span>
          <strong>S/ {formatCurrency(target.amount)}</strong>
        </div>
        <p className="checkout-demo-warning" role="note">
          Esta es solo una vista de demostración. No ingreses datos reales: no
          hay una pasarela conectada y no se realizará ningún cobro.
        </p>
        <fieldset className="checkout-demo-methods">
          <legend>Elige una opción</legend>
          {methods.map((item) => (
            <label
              key={item.id}
              className={method === item.id ? "selected" : ""}
            >
              <input
                type="radio"
                name="checkout-demo-method"
                value={item.id}
                checked={method === item.id}
                onChange={() => onMethodChange(item.id)}
              />
              <span
                className={`checkout-demo-mark checkout-demo-mark-${item.id}`}
                aria-hidden="true"
              >
                {item.id === "card" ? "▰" : item.id === "paypal" ? "P" : "Y"}
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              {item.id === "card" && (
                <span className="checkout-demo-card-brands">VISA · MC</span>
              )}
            </label>
          ))}
        </fieldset>
        <div className="checkout-demo-detail" aria-live="polite">
          {method === "card" && (
            <p>
              Los campos de tarjeta aparecerán únicamente al conectar una
              pasarela segura. Esta demo no recopila números, fechas ni códigos
              de seguridad.
            </p>
          )}
          {method === "paypal" && (
            <p>
              PayPal se podrá habilitar cuando se integre un proveedor. Por
              ahora esta opción solo muestra el diseño del proceso.
            </p>
          )}
          {method === "yape" && (
            <p>
              El pago con Yape se habilitará al integrar la solución
              correspondiente. No se muestra un QR real ni se registra una
              operación.
            </p>
          )}
        </div>
        {notice && (
          <p className="checkout-demo-result" role="status">
            {notice}
          </p>
        )}
        <button
          className="button checkout-demo-submit"
          type="button"
          onClick={onSimulate}
        >
          Simular (sin cobro)
        </button>
        <p className="checkout-demo-legal">
          La solicitud y los pagos reales siguen sujetos a la cotización
          aceptada y a la configuración del proveedor.
        </p>
      </section>
    </div>
  )
}

export default function ClientPortal({
  onClose,
  onAdminLogin,
}: {
  onClose: () => void
  onAdminLogin: (session: ClientSession) => void
}) {
  useScrollLock(true)

  const [session, setSession] = useState<ClientSession | null>(
    restoreClientSession,
  )
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [registrationName, setRegistrationName] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  )
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(
    null,
  )
  const [paymentOptions, setPaymentOptions] =
    useState<ClientPaymentOptions | null>(null)
  const [tab, setTab] = useState<PortalTab>("resumen")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loginBusy, setLoginBusy] = useState(false)
  const [deliveryBusy, setDeliveryBusy] = useState(false)
  const [deliveryComments, setDeliveryComments] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [checkoutDemoTarget, setCheckoutDemoTarget] =
    useState<CheckoutDemoTarget | null>(null)
  const [checkoutDemoMethod, setCheckoutDemoMethod] =
    useState<CheckoutDemoMethod>("card")
  const [checkoutDemoNotice, setCheckoutDemoNotice] = useState("")

  useEffect(() => {
    const expireSession = () => {
      sessionStorage.removeItem("digitalpyme.client.token")
      sessionStorage.removeItem("digitalpyme.client.user")
      localStorage.removeItem("digitalpyme.client.token")
      localStorage.removeItem("digitalpyme.client.user")
      setSession(null)
      setError("Tu sesión venció. Inicia sesión nuevamente.")
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession)
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession)
  }, [])

  useEffect(() => {
    if (!session || session.usuario.must_change_password) return
    let active = true
    setLoading(true)
    setError("")

    void getClientProjects(session.token)
      .then((loadedProjects) => {
        if (!active) return
        setProjects(loadedProjects)
        setSelectedProjectId((current) =>
          current && loadedProjects.some((project) => project.id === current)
            ? current
            : (loadedProjects[0]?.id ?? null),
        )
      })
      .catch((loadError) => {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar tus proyectos.",
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [session])

  useEffect(() => {
    if (
      !session ||
      session.usuario.must_change_password ||
      selectedProjectId === null
    ) {
      setSelectedProject(null)
      setPaymentOptions(null)
      return
    }

    let active = true
    setSelectedProject(null)
    setPaymentOptions(null)
    setError("")
    void Promise.all([
      getClientProject(session.token, selectedProjectId),
      getClientPaymentOptions(session.token, selectedProjectId),
    ])
      .then(([project, options]) => {
        if (active) setSelectedProject(project)
        if (active) setPaymentOptions(options)
      })
      .catch((loadError) => {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar el proyecto.",
          )
      })

    return () => {
      active = false
    }
  }, [session, selectedProjectId])

  const closePortal = () => {
    setSession(null)
    setProjects([])
    setSelectedProject(null)
    sessionStorage.removeItem("digitalpyme.client.token")
    sessionStorage.removeItem("digitalpyme.client.user")
    localStorage.removeItem("digitalpyme.client.token")
    localStorage.removeItem("digitalpyme.client.user")
    onClose()
  }

  const login = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoginBusy(true)
    setError("")

    try {
      let result: ClientSession
      let isAdmin = false

      // Attempt client login first to avoid unnecessary 401s on the admin endpoint
      try {
        result = await clientLogin(email, password)
        sessionStorage.removeItem("digitalpyme.admin.token")
        sessionStorage.removeItem("digitalpyme.admin.user")
      } catch (clientErr) {
        // If client login fails, check if an admin is logging in through this form
        try {
          result = await adminLogin(email, password)
          isAdmin = true
        } catch {
          throw clientErr
        }
      }

      if (isAdmin) {
        onAdminLogin(result)
        return
      }
      sessionStorage.setItem("digitalpyme.client.token", result.token)
      sessionStorage.setItem(
        "digitalpyme.client.user",
        JSON.stringify(result.usuario),
      )
      setSession(result)
      setPassword("")
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión.",
      )
    } finally {
      setLoginBusy(false)
    }
  }

  const register = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoginBusy(true)
    setError("")
    setNotice("")

    try {
      const result = await registerClient({
        nombre: registrationName.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      sessionStorage.removeItem("digitalpyme.admin.token")
      sessionStorage.removeItem("digitalpyme.admin.user")
      sessionStorage.setItem("digitalpyme.client.token", result.token)
      sessionStorage.setItem(
        "digitalpyme.client.user",
        JSON.stringify(result.usuario),
      )
      setSession(result)
      setPassword("")
      setPasswordConfirmation("")
      setNotice(
        result.notificacion_admin_enviada
          ? "Cuenta creada. También se notificó al administrador; tu contraseña no se comparte por correo."
          : "Cuenta creada, pero no se envió el aviso al administrador. El servidor necesita correo saliente (SMTP) configurado.",
      )
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "No se pudo crear la cuenta.",
      )
    } finally {
      setLoginBusy(false)
    }
  }

  const approveMilestone = async (milestoneId: number) => {
    if (!session || !selectedProject) return
    setError("")
    setNotice("")

    try {
      const approved = await approveProjectMilestone(
        session.token,
        selectedProject.id,
        milestoneId,
      )
      setSelectedProject({
        ...selectedProject,
        milestones: selectedProject.milestones.map((milestone) =>
          milestone.id === approved.id ? approved : milestone,
        ),
      })
      setNotice("Hito aprobado correctamente.")
    } catch (approvalError) {
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : "No se pudo aprobar el hito.",
      )
    }
  }

  const respondToDelivery = async (
    action: "approve" | "request_changes",
  ) => {
    if (!session || !selectedProject) return
    setDeliveryBusy(true)
    setError("")
    setNotice("")

    try {
      const updatedProject = await respondToProjectDelivery(
        session.token,
        selectedProject.id,
        {
          action,
          ...(action === "request_changes"
            ? { comments: deliveryComments.trim() }
            : {}),
        },
      )
      setSelectedProject(updatedProject)
      setProjects((current) =>
        current.map((project) =>
          project.id === updatedProject.id
            ? { ...project, estado: updatedProject.estado, progreso: updatedProject.progreso }
            : project,
        ),
      )
      setDeliveryComments("")
      setNotice(
        action === "approve"
          ? "Entrega aprobada. ¡Gracias por tu confirmación!"
          : "Registramos tus comentarios y avisamos al equipo de DigitalPyme.",
      )
    } catch (deliveryError) {
      setError(
        deliveryError instanceof Error
          ? deliveryError.message
          : "No se pudo registrar tu respuesta a la entrega.",
      )
    } finally {
      setDeliveryBusy(false)
    }
  }

  const refreshPayments = async (projectId: number) => {
    if (!session) return

    const [options, project] = await Promise.all([
      getClientPaymentOptions(session.token, projectId),
      getClientProject(session.token, projectId),
    ])
    setPaymentOptions(options)
    setSelectedProject(project)
  }

  const createTransfer = async (milestoneId?: number) => {
    if (!session || !activeProject) return
    setError("")
    setNotice("")

    try {
      const result = await startBankTransfer(
        session.token,
        activeProject.id,
        milestoneId,
      )
      setNotice(result.mensaje)
      await refreshPayments(activeProject.id)
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "No se pudo registrar el pago por transferencia.",
      )
    }
  }

  const openCheckoutDemo = (label: string, amount: number) => {
    setCheckoutDemoTarget({ label, amount })
    setCheckoutDemoMethod("card")
    setCheckoutDemoNotice("")
  }

  const sendReceipt = async (payment: ProjectPayment, file?: File) => {
    if (!session || !activeProject || !file) return
    setError("")
    setNotice("")

    try {
      await uploadTransferReceipt(
        session.token,
        activeProject.id,
        payment.id,
        file,
      )
      setNotice(
        `Comprobante enviado. El administrador revisará el pago por ${
          payment.method === "yape_plin" ? "Yape/Plin" : "transferencia"
        }.`,
      )
      await refreshPayments(activeProject.id)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el comprobante.",
      )
    }
  }

  const downloadFile = async (file: ProjectFile) => {
    if (!session || !selectedProject) return
    setDownloadingId(file.id)
    setError("")

    try {
      const result = await downloadProjectFile(
        session.token,
        selectedProject.id,
        file.id,
      )
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement("a")
      link.href = url
      link.download = result.filename
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo descargar el archivo.",
      )
    } finally {
      setDownloadingId(null)
    }
  }

  const downloadPaymentReceipt = async (payment: ProjectPayment) => {
    if (!session || !selectedProject || payment.status !== "pagado") return
    setDownloadingId(payment.id)
    setError("")

    try {
      const result = await downloadClientPaymentReceipt(
        session.token,
        selectedProject.id,
        payment.id,
      )
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement("a")
      link.href = url
      link.download = result.filename
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo descargar el recibo.",
      )
    } finally {
      setDownloadingId(null)
    }
  }

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!session) return
    setError("")
    setNotice("")

    try {
      const result = await changeClientPassword(session.token, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      })
      setNotice(result.mensaje)
      sessionStorage.removeItem("digitalpyme.client.token")
      sessionStorage.removeItem("digitalpyme.client.user")
      localStorage.removeItem("digitalpyme.client.token")
      localStorage.removeItem("digitalpyme.client.user")
      setSession(null)
      setCurrentPassword("")
      setNewPassword("")
      setNewPasswordConfirmation("")
    } catch (passwordError) {
      setError(
        passwordError instanceof Error
          ? passwordError.message
          : "No se pudo actualizar la contraseña.",
      )
    }
  }

  const logout = async () => {
    if (!session) return
    try {
      await clientLogout(session.token)
      closePortal()
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "No se pudo cerrar la sesión.",
      )
    }
  }

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-story">
          <button className="auth-brand" onClick={onClose} type="button">
            <Brand light />
          </button>
          <div className="auth-story-copy">
            <span className="kicker kicker-light">Tu espacio de trabajo</span>
            <h1>Todo tu proyecto, en un solo lugar.</h1>
            <p>
              Revisa tus avances, aprueba entregables y mantente en contacto con
              nuestro equipo.
            </p>
            <div className="auth-proof">
              <span>
                <Icon name="check" />
              </span>
              <p>
                <b>Avances transparentes</b>Seguimiento de tu proyecto en tiempo
                real.
              </p>
            </div>
            <div className="auth-proof">
              <span>
                <Icon name="file" />
              </span>
              <p>
                <b>Archivos y comprobantes</b>Documentos de tu proyecto siempre
                disponibles.
              </p>
            </div>
          </div>
          <small>© 2025 DigitalPyme. Hecho en Perú.</small>
        </section>
        <section className="auth-form-wrap">
          <button
            className="auth-close"
            type="button"
            aria-label="Volver a la página"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
          <form
            className="auth-form"
            onSubmit={authMode === "login" ? login : register}
          >
            <div className="auth-mobile-logo">
              <Brand />
            </div>
            <span className="kicker">
              {authMode === "login"
                ? "Bienvenido de nuevo"
                : "Únete a DigitalPyme"}
            </span>
            <h2>{authMode === "login" ? "Ingresar" : "Crear cuenta"}</h2>
            <p>
              {authMode === "login"
                ? "Ingresa con tu cuenta de cliente o administrador. Te llevaremos al panel que corresponda."
                : "Regístrate como cliente para acceder a tu portal. El administrador recibirá tu nombre y correo, nunca tu contraseña."}
            </p>
            {notice && <p className="form-status success">{notice}</p>}
            {authMode === "register" && (
              <label>
                Nombre completo
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={255}
                  required
                  value={registrationName}
                  onChange={(event) => setRegistrationName(event.target.value)}
                />
              </label>
            )}
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Contraseña
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  minLength={authMode === "register" ? 12 : undefined}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                    {showPassword && <path d="m4 4 16 16" />}
                  </svg>
                </button>
              </span>
            </label>
            {authMode === "register" && (
              <label>
                Confirmar contraseña
                <span className="password-field">
                  <input
                    type={showPasswordConfirmation ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="password-visibility-toggle"
                    aria-label={
                      showPasswordConfirmation
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                    aria-pressed={showPasswordConfirmation}
                    onClick={() =>
                      setShowPasswordConfirmation((visible) => !visible)
                    }
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                      {showPasswordConfirmation && <path d="m4 4 16 16" />}
                    </svg>
                  </button>
                </span>
              </label>
            )}
            {error && <p className="form-status error">{error}</p>}
            <button className="button" type="submit" disabled={loginBusy}>
              {loginBusy
                ? authMode === "login"
                  ? "Ingresando..."
                  : "Creando cuenta..."
                : authMode === "login"
                  ? "Ingresar"
                  : "Registrarme"}
            </button>
            <button
              className="auth-mode-toggle"
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login")
                setShowPassword(false)
                setShowPasswordConfirmation(false)
                setError("")
                setNotice("")
              }}
            >
              {authMode === "login"
                ? "¿No tienes cuenta? Crear cuenta de cliente"
                : "¿Ya tienes cuenta? Ingresar"}
            </button>
            <small>
              <Icon name="check" size={13} /> Acceso privado y seguro
            </small>
          </form>
        </section>
      </main>
    )
  }

  if (session.usuario.must_change_password) {
    return (
      <main className="auth-shell">
        <section className="auth-story">
          <div className="auth-story-copy">
            <span className="kicker kicker-light">Seguridad de la cuenta</span>
            <h1>Actualiza tu contraseña para continuar.</h1>
            <p>
              El administrador asignó una contraseña temporal. Define una nueva,
              personal y segura.
            </p>
          </div>
        </section>
        <section className="auth-form-wrap">
          <form
            className="auth-form"
            onSubmit={(event) => void updatePassword(event)}
          >
            <span className="kicker">Cambio obligatorio</span>
            <h2>Crea tu contraseña</h2>
            <p>
              Usa al menos 12 caracteres. Después del cambio, vuelve a ingresar
              con tu nueva contraseña.
            </p>
            <label>
              Contraseña temporal
              <input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label>
              Nueva contraseña
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label>
              Confirmar nueva contraseña
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={newPasswordConfirmation}
                onChange={(event) =>
                  setNewPasswordConfirmation(event.target.value)
                }
              />
            </label>
            {error && <p className="form-status error">{error}</p>}
            {notice && <p className="form-status success">{notice}</p>}
            <button className="button" type="submit">
              Actualizar y continuar
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void logout()}
            >
              Cerrar sesión
            </button>
          </form>
        </section>
      </main>
    )
  }

  const activeProject = selectedProject
  const files = activeProject?.documents ?? []
  const payments = paymentOptions?.payments ?? []
  const quoteAmount = activeProject?.cotizacion
    ? Number(activeProject.cotizacion.monto)
    : 0
  const hasActiveFullPayment = payments.some(
    (payment) =>
      payment.milestone_id === null &&
      ["pendiente", "comprobante_enviado", "pagado"].includes(payment.status),
  )
  const hasActiveMilestonePayment = payments.some(
    (payment) =>
      payment.milestone_id !== null &&
      ["pendiente", "comprobante_enviado", "pagado"].includes(payment.status),
  )
  const paidAmount = payments
    .filter((payment) => payment.status === "pagado")
    .reduce((sum, payment) => sum + Number(payment.amount), 0)
  const approvedMilestones =
    activeProject?.milestones.filter(
      (milestone) => milestone.estado === "aprobado",
    ).length ?? 0
  const milestonesPendingReview =
    activeProject?.milestones.filter(
      (milestone) => milestone.estado === "pendiente_aprobacion",
    ).length ?? 0
  const milestonesPending =
    activeProject?.milestones.filter(
      (milestone) => milestone.estado === "pendiente",
    ).length ?? 0
  const remainingBalance = Math.max(quoteAmount - paidAmount, 0)
  const milestoneBars = [
    { label: "Aprobados", count: approvedMilestones },
    { label: "En revisión", count: milestonesPendingReview },
    { label: "Pendientes", count: milestonesPending },
  ]
  const milestoneBarScale = Math.max(
    ...milestoneBars.map((item) => item.count),
    1,
  )
  const stages = ["Diagnóstico", "Propuesta", "Desarrollo", "Entrega"]
  const stageIndex =
    activeProject?.estado === "completado"
      ? 3
      : activeProject?.estado === "revision"
        ? 2
        : activeProject?.estado === "en_progreso"
          ? 2
          : 0

  const renderFileList = (fileList: ProjectFile[]) =>
    fileList.length === 0 ? (
      <p>No hay archivos disponibles por ahora.</p>
    ) : (
      <div className="file-list">
        {fileList.map((file) => (
          <div key={file.id}>
            <span className="summary-icon lilac">
              <Icon name="file" size={17} />
            </span>
            <p>
              <b>{file.original_name}</b>
              <small>
                {file.tipo === "comprobante" ? "Comprobante" : "Documento"} ·{" "}
                {(file.size / 1024).toFixed(0)} KB
              </small>
            </p>
            <button
              type="button"
              disabled={downloadingId === file.id}
              onClick={() => void downloadFile(file)}
            >
              {downloadingId === file.id ? "Descargando..." : "Descargar"}
            </button>
          </div>
        ))}
      </div>
    )

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <Brand light />
        <nav>
          <span className="portal-nav-label">TU ESPACIO</span>
          {([
            ["resumen", "Resumen", "grid"],
            ["proyecto", "Mi proyecto", "spark"],
            ["pagos", "Pagos", "money"],
            ["archivos", "Archivos", "file"],
            ["pedidos", "Pedidos", "grid"],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
            >
              <Icon name={icon} size={17} />
              {label}
            </button>
          ))}
          <span className="portal-nav-label portal-nav-label-secondary">
            CUENTA
          </span>
          {([["cuenta", "Mi cuenta", "user"]] as const).map(
            ([key, label, icon]) => (
              <button
                key={key}
                type="button"
                className={tab === key ? "active" : ""}
                onClick={() => setTab(key)}
              >
                <Icon name={icon} size={17} />
                {label}
              </button>
            ),
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="account">
            <span>{session.usuario.name.slice(0, 2).toUpperCase()}</span>
            <p>
              <b>{session.usuario.name}</b>
              {session.usuario.email}
            </p>
          </div>
          <button type="button" onClick={() => void logout()}>
            <Icon name="x" size={15} /> Cerrar sesión
          </button>
          <button type="button" onClick={onClose}>
            <Icon name="arrow" size={15} /> Volver al sitio
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <button
            className="mobile-portal-brand"
            type="button"
            onClick={onClose}
          >
            <Brand />
          </button>
          <div>
            <button
              type="button"
              aria-label="Ir a mi cuenta"
              title="Mi cuenta"
              onClick={() => setTab("cuenta")}
            >
              <Icon name="user" size={17} />
            </button>
          </div>
        </header>
        <div className="portal-content">
          <div className="portal-heading">
            <div>
              <span>Bienvenido, {session.usuario.name}</span>
              <h1>
                {tab === "resumen"
                  ? "Resumen de tu proyecto"
                  : tab === "proyecto"
                    ? "Mi proyecto"
                    : tab === "pagos"
                      ? "Pagos"
                      : tab === "archivos"
                        ? "Archivos y comprobantes"
                        : tab === "pedidos"
                          ? "Mis pedidos"
                          : "Mi cuenta"}
              </h1>
            </div>
            {projects.length > 0 && (
              <select
                aria-label="Seleccionar proyecto"
                value={selectedProjectId ?? ""}
                onChange={(event) =>
                  setSelectedProjectId(Number(event.target.value))
                }
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && <p className="form-status error">{error}</p>}
          {notice && <p className="form-status success">{notice}</p>}
          {loading && <p>Cargando tu información...</p>}
          {!loading &&
            projects.length === 0 &&
            !error &&
            tab !== "pedidos" &&
            tab !== "resumen" && (
              <div className="portal-panel">
                <h2>Aún no tienes proyectos activos</h2>
                <p>
                  Cuando aceptes una propuesta, aquí podrás revisar tu
                  presupuesto y los avances.
                </p>
              </div>
            )}
          {tab === "pedidos" && <ClientStoreOrders token={session.token} />}

          {tab === "resumen" && (
            <section
              className="client-dashboard"
              aria-label="Resumen del cliente"
            >
              {activeProject ? (
                <>
                  <div className="client-dashboard-metrics">
                    <article className="client-metric-card client-metric-featured">
                      <span>Presupuesto aprobado</span>
                      <strong>S/ {formatCurrency(quoteAmount)}</strong>
                      <small>
                        {activeProject.cotizacion?.servicio ??
                          activeProject.nombre}
                      </small>
                    </article>
                    <article className="client-metric-card">
                      <span>Total pagado</span>
                      <strong>S/ {formatCurrency(paidAmount)}</strong>
                      <small>Pagos verificados</small>
                    </article>
                    <article className="client-metric-card">
                      <span>Saldo del proyecto</span>
                      <strong>S/ {formatCurrency(remainingBalance)}</strong>
                      <small>Según pagos verificados</small>
                    </article>
                  </div>

                  <div className="client-dashboard-grid">
                    <div className="client-dashboard-main">
                      <section className="portal-panel client-chart-panel">
                        <div className="panel-head">
                          <div>
                            <h2>Hitos del proyecto</h2>
                            <p>Estado actual de tus entregables.</p>
                          </div>
                          <button
                            className="client-text-button"
                            type="button"
                            onClick={() => setTab("proyecto")}
                          >
                            Ver proyecto <Icon name="arrow" size={14} />
                          </button>
                        </div>
                        {activeProject.milestones.length === 0 ? (
                          <div className="client-chart-empty">
                            <span>
                              <Icon name="spark" size={18} />
                            </span>
                            <p>Aún no hay hitos registrados para mostrar.</p>
                          </div>
                        ) : (
                          <div className="client-milestone-chart">
                            {milestoneBars.map((item) => (
                              <div
                                className="client-milestone-bar"
                                key={item.label}
                              >
                                <div className="client-milestone-bar-value">
                                  {item.count}
                                </div>
                                <div className="client-milestone-bar-track">
                                  <i
                                    className={
                                      item.count > 0 ? "has-value" : ""
                                    }
                                    style={{
                                      height: `${(item.count / milestoneBarScale) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span>{item.label}</span>
                              </div>
                            ))}
                            <div className="client-milestone-chart-total">
                              <strong>{activeProject.milestones.length}</strong>
                              <span>hitos en total</span>
                            </div>
                          </div>
                        )}
                      </section>

                      <section className="portal-panel client-transactions-panel">
                        <div className="panel-head">
                          <div>
                            <h2>Actividad reciente</h2>
                            <p>Pagos registrados y estado de verificación.</p>
                          </div>
                          <button
                            className="client-text-button"
                            type="button"
                            onClick={() => setTab("pagos")}
                          >
                            Ver pagos <Icon name="arrow" size={14} />
                          </button>
                        </div>
                        {payments.length === 0 ? (
                          <p>
                            Aún no hay pagos registrados para este proyecto.
                          </p>
                        ) : (
                          <>
                            <div className="client-transaction-head">
                              <span>Concepto</span>
                              <span>Fecha</span>
                              <span>Estado</span>
                              <span>Monto</span>
                            </div>
                            {payments.slice(0, 5).map((payment) => (
                              <div
                                className="client-transaction-row"
                                key={payment.id}
                              >
                                <span className="client-transaction-method">
                                  <i
                                    className={
                                      payment.status === "pagado"
                                        ? "is-paid"
                                        : ""
                                    }
                                  >
                                    <Icon
                                      name={
                                        payment.status === "pagado"
                                          ? "check"
                                          : "money"
                                      }
                                      size={14}
                                    />
                                  </i>
                                  <b>
                                    {payment.milestone?.titulo ??
                                      (payment.milestone_id
                                        ? "Pago por hito"
                                        : "Proyecto completo")}
                                    <small>
                                      {payment.method === "card"
                                        ? "Tarjeta"
                                        : payment.method === "yape_plin"
                                          ? "Yape/Plin"
                                          : "Transferencia bancaria"}
                                    </small>
                                  </b>
                                </span>
                                <span>
                                  {new Date(
                                    payment.created_at,
                                  ).toLocaleDateString("es-PE")}
                                </span>
                                <i
                                  className={`client-transaction-status ${
                                    payment.status === "pagado" ? "is-paid" : ""
                                  }`}
                                >
                                  {payment.status.replace(/_/g, " ")}
                                </i>
                                <strong>
                                  S/ {formatCurrency(Number(payment.amount))}
                                </strong>
                              </div>
                            ))}
                          </>
                        )}
                      </section>
                    </div>

                    <aside className="client-dashboard-aside">
                      <section className="client-project-card client-performance-card">
                        <div className="client-performance-heading">
                          <span className="client-project-card-label">
                            AVANCE DEL PROYECTO
                          </span>
                          <Icon name="grid" size={17} />
                        </div>
                        <div className="client-project-card-heading">
                          <h2>{activeProject.nombre}</h2>
                          <div
                            className="client-project-radial"
                            style={{
                              background: `conic-gradient(var(--lime) ${activeProject.progreso}%, #48635e 0)`,
                            }}
                          >
                            <strong>{activeProject.progreso}%</strong>
                            <span>avance</span>
                          </div>
                        </div>
                        <span className="client-project-status">
                          <i />
                          {activeProject.estado.replace(/_/g, " ")}
                        </span>
                        <div className="client-project-progress">
                          <i style={{ width: `${activeProject.progreso}%` }} />
                        </div>
                        <div className="client-project-delivery">
                          <span>Hitos aprobados</span>
                          <b>
                            {approvedMilestones} de{" "}
                            {activeProject.milestones.length}
                          </b>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTab("proyecto")}
                        >
                          Ver proyecto <Icon name="arrow" size={15} />
                        </button>
                      </section>

                      <section className="portal-panel client-next-card">
                        <span className="client-next-card-icon">
                          <Icon name="calendar" size={16} />
                        </span>
                        <span className="client-project-card-label">
                          PRÓXIMO PASO
                        </span>
                        <h3>
                          {activeProject.milestones.find(
                            (milestone) => milestone.estado !== "aprobado",
                          )?.titulo ??
                            (activeProject.estado === "completado"
                              ? "Proyecto completado"
                              : "Pendiente de coordinación")}
                        </h3>
                        <p>
                          {activeProject.fecha_entrega
                            ? `Fecha de entrega estimada: ${activeProject.fecha_entrega}`
                            : "Revisa tus hitos para conocer las próximas entregas."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setTab("proyecto")}
                        >
                          Ver avances <Icon name="arrow" size={14} />
                        </button>
                      </section>
                    </aside>
                  </div>
                </>
              ) : projects.length > 0 ? (
                <div className="portal-panel client-dashboard-empty">
                  <p>
                    {loading
                      ? "Cargando el resumen del proyecto..."
                      : "No se pudo mostrar el resumen del proyecto seleccionado."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="client-dashboard-metrics">
                    <article className="client-metric-card client-metric-featured">
                      <span>Proyectos activos</span>
                      <strong>0</strong>
                      <small>Tu próximo proyecto puede empezar aquí</small>
                    </article>
                    <article className="client-metric-card">
                      <span>Pagos verificados</span>
                      <strong>—</strong>
                      <small>Sin actividad todavía</small>
                    </article>
                    <article className="client-metric-card">
                      <span>Archivos disponibles</span>
                      <strong>0</strong>
                      <small>Documentos de proyecto</small>
                    </article>
                  </div>

                  <div className="client-dashboard-grid">
                    <div className="client-dashboard-main">
                      <section className="portal-panel client-chart-panel">
                        <div className="panel-head">
                          <div>
                            <h2>Actividad del proyecto</h2>
                            <p>
                              Hitos y entregables aparecerán aquí cuando inicie
                              tu proyecto.
                            </p>
                          </div>
                        </div>
                        <div className="client-chart-empty">
                          <span>
                            <Icon name="spark" size={18} />
                          </span>
                          <p>Aún no tienes hitos registrados.</p>
                        </div>
                      </section>

                      <section className="portal-panel client-transactions-panel">
                        <div className="panel-head">
                          <div>
                            <h2>Actividad reciente</h2>
                            <p>Pagos y movimientos de tus proyectos.</p>
                          </div>
                        </div>
                        <div className="client-empty-activity">
                          <span className="client-activity-icon">
                            <Icon name="money" size={15} />
                          </span>
                          <div>
                            <b>Sin movimientos por ahora</b>
                            <small>
                              Tu actividad aparecerá en este espacio.
                            </small>
                          </div>
                        </div>
                      </section>
                    </div>

                    <aside className="client-dashboard-aside">
                      <section className="client-project-card client-performance-card client-empty-project-card">
                        <div className="client-performance-heading">
                          <span className="client-project-card-label">
                            TU ESPACIO DIGITALPYME
                          </span>
                          <Icon name="grid" size={17} />
                        </div>
                        <div className="client-empty-project-visual">
                          <Icon name="spark" size={25} />
                        </div>
                        <h2>Aún no tienes proyectos activos</h2>
                        <p>
                          Cuando aceptes una propuesta, aquí podrás revisar tus
                          avances, pagos y archivos.
                        </p>
                        <button type="button" onClick={onClose}>
                          Explorar servicios <Icon name="arrow" size={15} />
                        </button>
                      </section>
                      <section className="portal-panel client-next-card">
                        <span className="client-next-card-icon">
                          <Icon name="file" size={16} />
                        </span>
                        <span className="client-project-card-label">
                          TUS DOCUMENTOS
                        </span>
                        <h3>Archivos y comprobantes</h3>
                        <p>
                          Cuando haya documentos de tu proyecto, podrás
                          descargarlos desde aquí.
                        </p>
                        <button
                          type="button"
                          onClick={() => setTab("archivos")}
                        >
                          Ir a archivos <Icon name="arrow" size={14} />
                        </button>
                      </section>
                    </aside>
                  </div>
                </>
              )}
            </section>
          )}

          {activeProject && (tab === "resumen" || tab === "proyecto") && (
            <>
              {tab === "proyecto" && (
                <div className="project-overview">
                  <div>
                    <span>Proyecto</span>
                    <strong>{activeProject.nombre}</strong>
                    <div className="progress-track">
                      <i style={{ width: `${activeProject.progreso}%` }} />
                    </div>
                  </div>
                  <div>
                    <span>Estado</span>
                    <b>{activeProject.estado.replace(/_/g, " ")}</b>
                  </div>
                  <div>
                    <span>Progreso</span>
                    <b>{activeProject.progreso}%</b>
                  </div>
                  <div>
                    <span>Entrega</span>
                    <b>{activeProject.fecha_entrega ?? "Por definir"}</b>
                  </div>
                </div>
              )}
              {tab === "proyecto" && (
                <div className="portal-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Presupuesto y avances</h2>
                      <p>
                        {activeProject.cotizacion?.servicio ??
                          activeProject.nombre}
                      </p>
                    </div>
                    <strong>S/ {formatCurrency(quoteAmount)}</strong>
                  </div>
                  {activeProject.cotizacion?.descripcion && (
                    <p>{activeProject.cotizacion.descripcion}</p>
                  )}
                  {activeProject.estado === "revision" && (
                    <section
                      className="portal-panel client-delivery-review"
                      aria-labelledby="delivery-review-title"
                    >
                      <h2 id="delivery-review-title">Revisa la entrega</h2>
                      <p>
                        Aprueba el trabajo o indícanos qué ajustes necesitas.
                      </p>
                      <label>
                        Comentarios para solicitar cambios
                        <textarea
                          maxLength={2000}
                          minLength={5}
                          value={deliveryComments}
                          onChange={(event) =>
                            setDeliveryComments(event.target.value)
                          }
                        />
                      </label>
                      <div className="portal-actions">
                        <button
                          className="button"
                          type="button"
                          disabled={deliveryBusy}
                          onClick={() => void respondToDelivery("approve")}
                        >
                          Aprobar entrega
                        </button>
                        <button
                          className="button button-secondary"
                          type="button"
                          disabled={
                            deliveryBusy || deliveryComments.trim().length < 5
                          }
                          onClick={() =>
                            void respondToDelivery("request_changes")
                          }
                        >
                          Solicitar cambios
                        </button>
                      </div>
                    </section>
                  )}
                  <div className="timeline">
                    {stages.map((stage, index) => (
                      <div
                        key={stage}
                        className={`timeline-step ${
                          index < stageIndex ? "done" : ""
                        } ${index === stageIndex ? "current" : ""}`}
                      >
                        <span>
                          {index < stageIndex ? (
                            <Icon name="check" size={15} />
                          ) : (
                            `0${index + 1}`
                          )}
                        </span>
                        <h3>{stage}</h3>
                      </div>
                    ))}
                  </div>
                  <h2>Hitos del proyecto</h2>
                  {activeProject.milestones.length === 0 && (
                    <p>Aún no hay hitos registrados.</p>
                  )}
                  {activeProject.milestones.map((milestone) => (
                    <div className="payment-row" key={milestone.id}>
                      <span>
                        <Icon
                          name={
                            milestone.estado === "aprobado" ? "check" : "file"
                          }
                          size={15}
                        />
                      </span>
                      <p>
                        <b>{milestone.titulo}</b>
                        {milestone.descripcion}
                      </p>
                      <strong>
                        {milestone.monto === null
                          ? "—"
                          : `S/ ${formatCurrency(Number(milestone.monto))}`}
                      </strong>
                      <i
                        className={
                          milestone.estado === "aprobado"
                            ? "pagado"
                            : "pendiente"
                        }
                      >
                        {milestone.estado.replace(/_/g, " ")}
                      </i>
                      {milestone.estado === "pendiente_aprobacion" && (
                        <button
                          className="button"
                          type="button"
                          onClick={() => void approveMilestone(milestone.id)}
                        >
                          Aprobar hito
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeProject && tab === "archivos" && (
            <div className="portal-panel">
              <div className="panel-head">
                <div>
                  <h2>Documentos de tu proyecto</h2>
                  <p>Descarga archivos y comprobantes disponibles.</p>
                </div>
              </div>
              {renderFileList(files)}
            </div>
          )}

          {activeProject && tab === "pagos" && (
            <>
              <div className="payment-summary">
                <div>
                  <span>Presupuesto aceptado</span>
                  <strong>S/ {formatCurrency(quoteAmount)}</strong>
                </div>
                <div>
                  <span>Pagado</span>
                  <strong>
                    S/{" "}
                    {formatCurrency(
                      payments
                        .filter((payment) => payment.status === "pagado")
                        .reduce(
                          (sum, payment) => sum + Number(payment.amount),
                          0,
                        ),
                    )}
                  </strong>
                </div>
                <div>
                  <span>Por verificar</span>
                  <strong>
                    S/{" "}
                    {formatCurrency(
                      payments
                        .filter(
                          (payment) =>
                            payment.status === "pendiente" ||
                            payment.status === "comprobante_enviado",
                        )
                        .reduce(
                          (sum, payment) => sum + Number(payment.amount),
                          0,
                        ),
                    )}
                  </strong>
                </div>
              </div>

              <div className="portal-panel">
                <div className="panel-head">
                  <div>
                    <h2>Realizar un pago</h2>
                    <p>Paga el presupuesto completo o un hito aprobado.</p>
                  </div>
                </div>
                <div className="payment-row">
                  <span>
                    <Icon name="money" size={16} />
                  </span>
                  <p>
                    <b>Proyecto completo</b>
                    {activeProject.cotizacion?.servicio ?? activeProject.nombre}
                  </p>
                  <strong>S/ {formatCurrency(quoteAmount)}</strong>
                  <i
                    className={
                      payments.some(
                        (payment) =>
                          payment.milestone_id === null &&
                          payment.status === "pagado",
                      )
                        ? "pagado"
                        : "próximo"
                    }
                  >
                    {payments.some(
                      (payment) =>
                        payment.milestone_id === null &&
                        payment.status === "pagado",
                    )
                      ? "pagado"
                      : "disponible"}
                  </i>
                  <div>
                    <button
                      className="button"
                      type="button"
                      disabled={
                        hasActiveFullPayment || hasActiveMilestonePayment
                      }
                      onClick={() => void createTransfer()}
                    >
                      Transferencia
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={
                        hasActiveFullPayment || hasActiveMilestonePayment
                      }
                      onClick={() =>
                        openCheckoutDemo(
                          activeProject.cotizacion?.servicio ??
                            activeProject.nombre,
                          quoteAmount,
                        )
                      }
                    >
                      Pasarela de pago
                    </button>
                  </div>
                </div>

                {activeProject.milestones
                  .filter(
                    (milestone) =>
                      milestone.estado === "aprobado" &&
                      milestone.monto !== null &&
                      Number(milestone.monto) > 0,
                  )
                  .map((milestone) => {
                    const milestonePayments = payments.filter(
                      (payment) => payment.milestone_id === milestone.id,
                    )
                    const isActive =
                      hasActiveFullPayment ||
                      milestonePayments.some((payment) =>
                        ["pendiente", "comprobante_enviado", "pagado"].includes(
                          payment.status,
                        ),
                      )
                    const isPaid = milestonePayments.some(
                      (payment) => payment.status === "pagado",
                    )
                    return (
                      <div className="payment-row" key={milestone.id}>
                        <span>
                          <Icon name="check" size={16} />
                        </span>
                        <p>
                          <b>{milestone.titulo}</b>Hito aprobado
                        </p>
                        <strong>
                          S/ {formatCurrency(Number(milestone.monto))}
                        </strong>
                        <i className={isPaid ? "pagado" : "próximo"}>
                          {isPaid ? "pagado" : "disponible"}
                        </i>
                        <div>
                          <button
                            className="button"
                            type="button"
                            disabled={isActive}
                            onClick={() => void createTransfer(milestone.id)}
                          >
                            Transferencia
                          </button>
                          <button
                            className="button button-secondary"
                            type="button"
                            disabled={isActive}
                            onClick={() =>
                              openCheckoutDemo(
                                milestone.titulo,
                                Number(milestone.monto),
                              )
                            }
                          >
                            Pasarela de pago
                          </button>
                        </div>
                      </div>
                    )
                  })}

                <p>
                  La pasarela de tarjeta, PayPal y Yape está en modo de
                  demostración. No se procesan cobros ni se registran pagos
                  simulados.
                </p>
                {paymentOptions?.bank_transfer &&
                  (paymentOptions.bank_transfer.bank ||
                    paymentOptions.bank_transfer.account ||
                    paymentOptions.bank_transfer.cci) && (
                    <dl>
                      {paymentOptions.bank_transfer.bank && (
                        <div>
                          <dt>Banco</dt>
                          <dd>{paymentOptions.bank_transfer.bank}</dd>
                        </div>
                      )}
                      {paymentOptions.bank_transfer.holder && (
                        <div>
                          <dt>Titular</dt>
                          <dd>{paymentOptions.bank_transfer.holder}</dd>
                        </div>
                      )}
                      {paymentOptions.bank_transfer.account && (
                        <div>
                          <dt>Cuenta</dt>
                          <dd>{paymentOptions.bank_transfer.account}</dd>
                        </div>
                      )}
                      {paymentOptions.bank_transfer.cci && (
                        <div>
                          <dt>CCI</dt>
                          <dd>{paymentOptions.bank_transfer.cci}</dd>
                        </div>
                      )}
                    </dl>
                  )}
              </div>

              <div className="portal-panel">
                <div className="panel-head">
                  <div>
                    <h2>Historial de pagos</h2>
                    <p>El estado se actualiza cuando se verifica el pago.</p>
                  </div>
                </div>
                {payments.length === 0 && (
                  <p>Aún no hay pagos registrados para este proyecto.</p>
                )}
                {payments.map((payment) => (
                  <div className="payment-row" key={payment.id}>
                    <span>
                      <Icon
                        name={payment.status === "pagado" ? "check" : "money"}
                        size={16}
                      />
                    </span>
                    <p>
                      <b>
                        {payment.milestone?.titulo ??
                          (payment.milestone_id
                            ? "Pago por hito"
                            : "Proyecto completo")}
                      </b>
                      {payment.method === "card"
                        ? "Tarjeta · Mercado Pago"
                        : payment.method === "yape_plin"
                          ? "Yape/Plin"
                          : "Transferencia bancaria"}{" "}
                      ·{" "}
                      {new Date(payment.created_at).toLocaleDateString("es-PE")}
                    </p>
                    <strong>S/ {formatCurrency(Number(payment.amount))}</strong>
                    <i
                      className={
                        payment.status === "pagado"
                          ? "pagado"
                          : payment.status === "fallido" ||
                              payment.status === "rechazado"
                            ? "pendiente"
                            : "próximo"
                      }
                    >
                      {payment.status.replace(/_/g, " ")}
                    </i>
                    {payment.status === "pagado" && (
                      <button
                        type="button"
                        disabled={downloadingId === payment.id}
                        onClick={() => void downloadPaymentReceipt(payment)}
                      >
                        {downloadingId === payment.id
                          ? "Preparando recibo..."
                          : "Descargar recibo PDF"}
                      </button>
                    )}
                    {payment.receipt && (
                      <button
                        type="button"
                        onClick={() => void downloadFile(payment.receipt!)}
                      >
                        Descargar comprobante
                      </button>
                    )}
                    {payment.method !== "card" &&
                      payment.status === "pendiente" &&
                      !payment.receipt && (
                        <label className="button">
                          Adjuntar comprobante
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) void sendReceipt(payment, file)
                              event.currentTarget.value = ""
                            }}
                          />
                        </label>
                      )}
                    {payment.receipt && (
                      <i
                        className={
                          payment.status === "pagado" ? "pagado" : "pendiente"
                        }
                      >
                        {payment.status === "pagado"
                          ? "verificado"
                          : "en revisión"}
                      </i>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "cuenta" && (
            <div className="portal-panel">
              <div className="panel-head">
                <div>
                  <h2>Cambiar contraseña</h2>
                  <p>Usa una contraseña de al menos 12 caracteres.</p>
                </div>
              </div>
              <form className="auth-form" onSubmit={updatePassword}>
                <label>
                  Contraseña actual
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </label>
                <label>
                  Nueva contraseña
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>
                <label>
                  Confirmar nueva contraseña
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={newPasswordConfirmation}
                    onChange={(event) =>
                      setNewPasswordConfirmation(event.target.value)
                    }
                  />
                </label>
                <button className="button" type="submit">
                  Actualizar contraseña
                </button>
              </form>
            </div>
          )}
        </div>
        <nav className="portal-mobile-nav">
          {([
            ["resumen", "Resumen", "grid"],
            ["proyecto", "Proyecto", "spark"],
            ["pagos", "Pagos", "money"],
            ["archivos", "Archivos", "file"],
            ["pedidos", "Pedidos", "grid"],
            ["cuenta", "Cuenta", "user"],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
            >
              <Icon name={icon} size={17} />
              {label}
            </button>
          ))}
        </nav>
      </main>
      {checkoutDemoTarget && (
        <ProjectPaymentDemo
          target={checkoutDemoTarget}
          method={checkoutDemoMethod}
          notice={checkoutDemoNotice}
          onMethodChange={(method) => {
            setCheckoutDemoMethod(method)
            setCheckoutDemoNotice("")
          }}
          onSimulate={() =>
            setCheckoutDemoNotice(
              "Prueba visual completada. No se realizó ningún cobro ni se registró un pago en el panel del cliente o del administrador.",
            )
          }
          onClose={() => setCheckoutDemoTarget(null)}
        />
      )}
    </div>
  )
}
