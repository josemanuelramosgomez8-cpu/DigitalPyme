import { useEffect, useState } from "react";
import AdminPortal from "./AdminPortal";
import ClientStoreOrders from "./ClientStoreOrders";
import StoreDemo from "./StoreDemo";
import {
  getCoverage,
  getPortfolioProjects,
  getServiceBySlug,
  getServiceCategories,
  getServiceReviews,
  getServices,
  getTestimonials,
  getAgendaSlots,
  reserveAgendaSlot,
  approveProjectMilestone,
  changeClientPassword,
  clientLogin,
  clientLogout,
  downloadProjectFile,
  getClientPaymentOptions,
  getClientProject,
  getClientProjects,
  getPublicSiteSettings,
  submitServiceReview,
  startBankTransfer,
  startCardPayment,
  submitLead,
  submitProposal,
  uploadTransferReceipt,
  type AgendaSlot,
  type ApiPortfolioProject,
  type ApiService,
  type ApiTestimonial,
  type ClientPaymentOptions,
  type ClientProject,
  type ClientSession,
  type ProjectFile,
  type ProjectPayment,
  type SolicitudResponse,
  type SiteSettings,
  type ServiceCategory,
  type ServiceReview,
  type CoverageResult,
  defaultSiteSettings,
} from "./lib/api";

function separarContacto(valor: string) {
  const v = valor.trim();
  return v.includes("@") ? { email: v } : { telefono: v };
}

type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "file"
  | "grid"
  | "headset"
  | "menu"
  | "message"
  | "money"
  | "paperclip"
  | "send"
  | "spark"
  | "upload"
  | "user"
  | "whatsapp"
  | "x";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 13h6M9 17h4" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
    money: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M16 9h2M6 15h2M12 9v6M14 11c0-1-1-2-2-2s-2 .7-2 1.6c0 2.4 4 1.2 4 3.2 0 .8-.8 1.2-2 1.2s-2-.7-2-1.5" /></>,
    paperclip: <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L14 3a3.5 3.5 0 0 1 5 5l-9.5 9.5a2 2 0 0 1-3-3L15 6" />,
    send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
    spark: <><path d="m12 3 1.4 4.1L17.5 9l-4.1 1.4L12 15l-1.4-4.6L6.5 9l4.1-1.9z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></>,
    upload: <><path d="M12 16V3M7 8l5-5 5 5" /><path d="M4 14v7h16v-7" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    whatsapp: <><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 21l1.8-4.7a8.5 8.5 0 1 1 15.7-4.6Z" /><path d="M8.2 7.5c.3-.5.7-.5 1-.1l1 2.1c.2.4 0 .7-.4 1.1-.5.5.3 1.8 1.3 2.7 1 .9 2.3 1.5 2.8 1 .4-.5.7-.8 1.2-.5l1.9.9c.5.2.5.7.3 1.1-.5 1-1.5 1.7-2.8 1.6-2.3-.2-5-1.8-6.7-3.7-1.6-1.8-2.1-4.4-1.2-5.9.4-.6 1.1-.8 1.6-.3Z" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const fallbackServices: ApiService[] = [
  { nombre: "Páginas web", descripcion: "Diseño y desarrollo de sitios web adaptables, con páginas acordadas, formulario de contacto y configuración SEO básica.", categoria: "Páginas web", descripcion_larga: "Planificamos y desarrollamos un sitio web adaptable a móviles y computadoras. El alcance se define según las páginas y necesidades acordadas para cada proyecto.", incluye: ["Estructura y diseño adaptable para las páginas acordadas.", "Desarrollo de las páginas incluidas en la propuesta.", "Formulario de contacto.", "Configuración SEO básica."], precio_desde: null, duracion: null, activo: true, orden: 1, slug: "paginas-web", category: { id: 1, nombre: "Páginas web", slug: "paginas-web", activo: true, orden: 1 } },
  { nombre: "Tiendas en línea", descripcion: "Diseño y desarrollo de tiendas en línea con catálogo, carrito y gestión de pedidos.", categoria: "Tiendas en línea", descripcion_larga: "Creamos una experiencia de compra en línea con catálogo de productos, carrito y flujo de pedidos. Los métodos de pago y envío se configuran según lo acordado para el proyecto.", incluye: ["Catálogo de productos y páginas de producto.", "Carrito y flujo de pedidos.", "Configuración de los métodos de pago acordados.", "Configuración de las opciones de envío acordadas."], precio_desde: null, duracion: null, activo: true, orden: 2, slug: "tiendas-en-linea", category: { id: 2, nombre: "Tiendas en línea", slug: "tiendas-en-linea", activo: true, orden: 2 } },
  { nombre: "Branding", descripcion: "Desarrollo de una identidad visual coherente con tu marca y las aplicaciones acordadas.", categoria: "Branding", descripcion_larga: "Definimos una línea visual para comunicar tu marca con coherencia. Las propuestas, revisiones y aplicaciones se detallan en el alcance aprobado antes de iniciar.", incluye: ["Definición de una línea visual para la marca.", "Logotipo y versiones en los formatos acordados.", "Paleta de colores y selección tipográfica.", "Aplicaciones de marca definidas en la propuesta."], precio_desde: null, duracion: null, activo: true, orden: 3, slug: "branding", category: { id: 3, nombre: "Branding", slug: "branding", activo: true, orden: 3 } },
  { nombre: "Marketing digital", descripcion: "Diagnóstico y planificación de acciones digitales según tus objetivos y los canales acordados.", categoria: "Marketing digital", descripcion_larga: "Revisamos los objetivos del negocio y preparamos un plan de acciones digitales. Los canales, la frecuencia y los entregables se definen en la propuesta de cada proyecto.", incluye: ["Diagnóstico inicial de objetivos y presencia digital.", "Plan de acciones para los canales acordados.", "Frecuencia y entregables definidos en la propuesta."], precio_desde: null, duracion: null, activo: true, orden: 4, slug: "marketing-digital", category: { id: 4, nombre: "Marketing digital", slug: "marketing-digital", activo: true, orden: 4 } },
  { nombre: "Mantenimiento", descripcion: "Actualizaciones y revisiones técnicas de tu sitio web, según la frecuencia y el alcance acordados.", categoria: "Mantenimiento", descripcion_larga: "Mantenemos y revisamos técnicamente tu sitio web con la frecuencia definida para el servicio. El alcance específico se acuerda antes de iniciar.", incluye: ["Actualizaciones contempladas en el alcance acordado.", "Revisiones técnicas con la frecuencia definida en la propuesta."], precio_desde: null, duracion: null, activo: true, orden: 5, slug: "mantenimiento", category: { id: 5, nombre: "Mantenimiento", slug: "mantenimiento", activo: true, orden: 5 } },
];

function serviceSlug(service: ApiService): string {
  return service.slug || service.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatServiceMeta(service: ApiService): string {
  const price = service.precio_desde === null
    ? null
    : Number(service.precio_desde).toLocaleString("en-US");

  if (price === null) {
    return `Cotización a medida${service.duracion ? ` · ${service.duracion}` : ""}`;
  }

  if (service.duracion === "Plan mensual") {
    return `Planes desde S/ ${price} / mes`;
  }

  return `Desde S/ ${price}${service.duracion ? ` · ${service.duracion}` : ""}`;
}

const faqs = [
  ["¿Cuánto tiempo toma crear mi página web?", "La mayoría de webs corporativas están listas en 2 a 4 semanas. Antes de comenzar definimos contigo un cronograma claro y realista."],
  ["¿Necesito tener todos mis textos y fotos listos?", "No. Te ayudamos a ordenar el contenido y te damos una guía simple para reunirlo. También podemos producirlo como parte del proyecto."],
  ["¿Cómo se realizan los pagos?", "Trabajamos por etapas. Cada pago está asociado a un hito visible en tu portal y recibirás el comprobante correspondiente."],
  ["¿Qué pasa después de publicar mi web?", "Puedes elegir un plan de mantenimiento o solicitar soporte cuando lo necesites. Nunca te dejamos solo con la tecnología."],
];

function Brand({ light = false }: { light?: boolean }) {
  const logoUrl = document.documentElement.dataset.brandLogo;
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      {logoUrl
        ? <img className="brand-logo-image" src={logoUrl} alt="" aria-hidden="true" />
        : <span className="brand-mark"><span /></span>}
      <strong>Digital</strong>Pyme
    </div>
  );
}

function Button({
  children,
  secondary = false,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  secondary?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`button ${secondary ? "button-secondary" : ""} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Header({ onQuote, onPortal, onNavigate }: { onQuote: () => void; onPortal: () => void; onNavigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <a href="/#inicio" className="brand-link" aria-label="DigitalPyme inicio" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#inicio"); }}>
          <Brand />
        </a>

        <nav className={open ? "nav-links nav-open" : "nav-links"}>
          <a href="/#servicios" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#servicios"); }}>Servicios</a>
          <a href="/tienda" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/tienda"); }}>Tienda</a>
          <a href="/#proyectos" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#proyectos"); }}>Proyectos</a>
          <a href="/#proceso" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#proceso"); }}>Cómo trabajamos</a>
          <a href="/#contacto" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#contacto"); }}>Contacto</a>
          <a href="#portal" className="button portal-link" onClick={(event) => { event.preventDefault(); setOpen(false); onPortal(); }}><Icon name="user" size={17} /> Portal cliente</a>
          <a href="#contacto" className="button" onClick={(event) => { event.preventDefault(); setOpen(false); onQuote(); }}>Solicita tu cotización</a>
        </nav>

        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menú">
          <Icon name={open ? "x" : "menu"} />
        </button>
      </div>
    </header>
  );
}

function TrustLine() {
  return (
    <div className="trust-line">
      <span><Icon name="clock" size={16} /> Cuéntanos tu proyecto</span>
      <span><Icon name="check" size={16} /> Sin compromiso</span>
    </div>
  );
}

function ContactForm({ services }: { services: ApiService[] }) {
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [servicio, setServicio] = useState(fallbackServices[0].nombre);
  const [contacto, setContacto] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [respuesta, setRespuesta] = useState<{ emailEnviado: boolean; whatsappUrl: string | null } | null>(null);
  const servicioSeleccionado = services.find((item) => item.nombre === servicio);
  const inversionEstimada = servicioSeleccionado?.precio_desde == null
    ? null
    : Number(servicioSeleccionado.precio_desde);

  useEffect(() => {
    if (services.length > 0 && !services.some((item) => item.nombre === servicio)) {
      setServicio(services[0].nombre);
    }
  }, [services, servicio]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) {
      setEstado("error");
      setError("Escribe tu nombre para poder registrar la solicitud.");
      return;
    }
    if (!contacto.trim()) {
      setEstado("error");
      setError("Escribe un correo o número de WhatsApp para poder contactarte.");
      return;
    }
    if (contacto.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.trim())) {
      setEstado("error");
      setError("Revisa el formato del correo electrónico o ingresa tu número de WhatsApp.");
      return;
    }
    setEstado("enviando");

    try {
      const result = await submitLead({ nombre: nombre.trim(), empresa: empresa.trim(), servicio, ...separarContacto(contacto) });
      setRespuesta({ emailEnviado: result.email_enviado, whatsappUrl: result.whatsapp_url });
      setEstado("ok");
      setNombre("");
      setEmpresa("");
      setServicio(services[0]?.nombre ?? "");
      setContacto("");
    } catch (submitError) {
      setRespuesta(null);
      setEstado("error");
      setError(submitError instanceof Error
        ? submitError.message
        : "No se pudo enviar la solicitud. Verifica tu conexión e inténtalo otra vez.");
    }
  };

  return (
    <form className="contact-form" onSubmit={enviar}>
      <div className="field-row">
        <label>
          <span>Nombre</span>
          <input required maxLength={255} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        </label>
        <label>
          <span>Empresa</span>
          <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nombre de tu negocio" />
        </label>
      </div>

      <label>
        <span>Servicio</span>
        <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
          {services.map((item) => (
            <option key={item.id ?? item.nombre} value={item.nombre}>{item.nombre}</option>
          ))}
        </select>
        <small>
          Inversión estimada: {inversionEstimada === null ? "A cotizar" : `S/ ${formatCurrency(inversionEstimada)}`}
        </small>
      </label>

      <label>
        <span>Correo o WhatsApp</span>
        <input required maxLength={255} value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="ej. hola@digitalpyme.pe o 987654321" />
      </label>

      {estado === "ok" && (
        <p className="form-status success">
          ¡Gracias! Tu solicitud fue enviada correctamente.
          {respuesta && !respuesta.emailEnviado && " No pudimos enviar el aviso por correo."}
          {respuesta?.whatsappUrl && <> <a href={respuesta.whatsappUrl} target="_blank" rel="noreferrer">Continuar por WhatsApp</a></>}
        </p>
      )}
      {estado === "error" && <p className="form-status error">{error || "No pudimos enviar tu mensaje. Inténtalo otra vez."}</p>}

      <Button type="submit" className="full-width-btn" onClick={() => undefined}>
        <Icon name="send" size={17} />
        {estado === "enviando" ? "Enviando..." : "Solicitar presupuesto"}
      </Button>
    </form>
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("es-PE", { maximumFractionDigits: 2 });
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function AgendaScheduler() {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingState, setBookingState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [bookingError, setBookingError] = useState("");
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");
  const [reservationWhatsappUrl, setReservationWhatsappUrl] = useState<string | null>(null);

  const key = monthKey(month);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setSelectedSlot(null);

    void getAgendaSlots(key)
      .then((result) => {
        if (!active) return;
        setSlots(result.slots);
        setSelectedDate((current) => (
          result.slots.some((slot) => slot.date === current && slot.available > 0)
            ? current
            : result.slots.find((slot) => slot.available > 0)?.date ?? ""
        ));
      })
      .catch((loadError) => {
        if (!active) return;
        setSlots([]);
        setSelectedDate("");
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la agenda.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [key, refresh]);

  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() + 6, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const mondayOffset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const calendarDays = Array.from({ length: totalCells }, (_, index) => {
    const day = index - mondayOffset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const availableDates = new Set(slots.filter((slot) => slot.available > 0).map((slot) => slot.date));
  const selectedDaySlots = slots.filter((slot) => slot.date === selectedDate);
  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
    : "Selecciona una fecha disponible";

  const moveMonth = (offset: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setSelectedDate("");
  };

  const confirmarReserva = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSlot) return;
    setBookingState("sending");
    setBookingError("");

    try {
      const result = await reserveAgendaSlot({
        agenda_slot_id: selectedSlot.id,
        nombre,
        ...separarContacto(contacto),
      });
      setReservationMessage([
        result.mensaje,
        !result.email_enviado ? "El aviso por correo no pudo enviarse." : "",
      ].filter(Boolean).join(" "));
      setReservationWhatsappUrl(result.whatsapp_url);
      setBookingState("success");
      setRefresh((version) => version + 1);
    } catch (bookingSubmitError) {
      setBookingError(bookingSubmitError instanceof Error ? bookingSubmitError.message : "No se pudo reservar el horario.");
      setBookingState("error");
    }
  };

  return (
    <>
      <div className="scheduler">
        <div className="calendar-pane">
          <div className="calendar-head">
            <button type="button" aria-label="Mes anterior" disabled={month <= currentMonth} onClick={() => moveMonth(-1)}>‹</button>
            <b>{month.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}</b>
            <button type="button" aria-label="Mes siguiente" disabled={month >= lastMonth} onClick={() => moveMonth(1)}>›</button>
          </div>
          <div className="weekdays">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="days">
            {calendarDays.map((day, index) => {
              const date = day === null
                ? ""
                : dateKey(new Date(month.getFullYear(), month.getMonth(), day));
              const available = Boolean(date && availableDates.has(date));
              const isSelected = date === selectedDate;

              return (
                <button
                  key={`${date || "empty"}-${index}`}
                  type="button"
                  disabled={!available || loading}
                  className={isSelected ? "selected" : ""}
                  aria-label={date ? `Seleccionar ${date}` : undefined}
                  aria-pressed={isSelected}
                  onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                >
                  {day ?? ""}
                </button>
              );
            })}
          </div>
        </div>
        <div className="time-pane">
          <b>{selectedDateLabel}</b>
          <span>Hora de Lima (GMT-5)</span>
          {loading && <span>Cargando horarios disponibles...</span>}
          {!loading && error && <p className="form-status error">{error}</p>}
          {!loading && !error && selectedDaySlots.length === 0 && <span>No hay horarios disponibles para esta fecha.</span>}
          {selectedDaySlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              disabled={slot.available === 0}
              className={selectedSlot?.id === slot.id ? "selected" : ""}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.time}
              <span>{slot.available <= 2 ? `Quedan ${slot.available}` : `${slot.available} disponibles`}</span>
            </button>
          ))}
          <button className="button" type="button" disabled={!selectedSlot || loading} onClick={() => { setBookingOpen(true); setBookingState("idle"); }}>
            Confirmar horario
          </button>
        </div>
      </div>

      {bookingOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && bookingState !== "sending") setBookingOpen(false); }}>
          <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <button className="modal-close" type="button" aria-label="Cerrar" disabled={bookingState === "sending"} onClick={() => setBookingOpen(false)}>
              <Icon name="x" />
            </button>
            {bookingState === "success" ? (
              <div className="quote-success">
                <span><Icon name="check" size={32} /></span>
                <h2 id="booking-title">Horario confirmado</h2>
                <p>{reservationMessage} {selectedDateLabel}, {selectedSlot?.time}.</p>
                {reservationWhatsappUrl && (
                  <p><a href={reservationWhatsappUrl} target="_blank" rel="noreferrer">Enviar aviso por WhatsApp</a></p>
                )}
                <Button onClick={() => setBookingOpen(false)}>Cerrar</Button>
              </div>
            ) : (
              <form onSubmit={confirmarReserva}>
                <span className="kicker">Agenda una llamada</span>
                <h2 id="booking-title">Confirma tus datos</h2>
                <p>{selectedDateLabel}, {selectedSlot?.time} · Hora de Lima (GMT-5)</p>
                <div className="quote-fields">
                  <label>
                    <span>Nombre</span>
                    <input required maxLength={255} value={nombre} onChange={(event) => setNombre(event.target.value)} />
                  </label>
                  <label>
                    <span>Correo o WhatsApp</span>
                    <input required value={contacto} onChange={(event) => setContacto(event.target.value)} />
                  </label>
                </div>
                {bookingError && <p className="form-status error">{bookingError}</p>}
                <div className="quote-nav">
                  <button className="button button-secondary" type="button" disabled={bookingState === "sending"} onClick={() => setBookingOpen(false)}>Cancelar</button>
                  <button className="button" type="submit" disabled={bookingState === "sending"}>
                    {bookingState === "sending" ? "Confirmando..." : "Confirmar horario"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function QuoteBuilder({
  services,
  initialServices,
  onClose,
}: {
  services: ApiService[];
  initialServices: string[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("digitalpyme.cart") ?? "[]") as string[];
      return [...new Set([...saved, ...initialServices])];
    } catch {
      return initialServices;
    }
  });
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [step, setStep] = useState(0);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [respuesta, setRespuesta] = useState<SolicitudResponse | null>(null);
  const seleccionados = services.filter((service) => selected.includes(service.nombre));
  const inversionEstimada = seleccionados.reduce(
    (total, service) => total + (service.precio_desde == null ? 0 : Number(service.precio_desde)),
    0,
  );
  const requiereCotizacion = seleccionados.some((service) => service.precio_desde == null);

  useEffect(() => {
    localStorage.setItem("digitalpyme.cart", JSON.stringify(selected));
  }, [selected]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const toggleService = (name: string) => {
    setSelected((current) => current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name]);
  };

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 0) {
      if (selected.length === 0) {
        setError("Selecciona al menos un servicio para continuar.");
        return;
      }
      setError("");
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    setEstado("enviando");
    setError("");

    try {
      const result = await submitProposal({
        nombre,
        empresa,
        ...separarContacto(contacto),
        servicios: selected,
        mensaje,
      });
      setRespuesta(result);
      setEstado("ok");
      localStorage.removeItem("digitalpyme.cart");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar la propuesta.");
      setEstado("error");
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <button className="modal-close" type="button" aria-label="Cerrar" onClick={onClose}>
          <Icon name="x" />
        </button>

        {estado === "ok" ? (
          <div className="quote-success">
            <ol className="checkout-steps" aria-label="Pasos de solicitud">
              {["Servicios", "Detalles del proyecto", "Envío de solicitud"].map((label, index) => (
                <li key={label} className="complete"><span>{index + 1}</span>{label}</li>
              ))}
            </ol>
            <span><Icon name="check" size={32} /></span>
            <h2 id="quote-title">¡Gracias por tu solicitud!</h2>
            <p>
              Recibimos tu solicitud de cotización. Revisaremos el alcance y te contactaremos para enviarte una propuesta.
              {Number(respuesta?.inversion_estimada ?? 0) > 0 && ` La inversión referencial de los servicios con precio publicado es S/ ${formatCurrency(Number(respuesta?.inversion_estimada))}.`}
              {respuesta?.incluye_servicios_a_cotizar ? " Los demás servicios se cotizarán según el alcance." : ""}
              {respuesta && !respuesta.email_enviado ? " El aviso por correo no pudo enviarse." : ""}
            </p>
            {respuesta?.whatsapp_url && (
              <a className="button" href={respuesta.whatsapp_url} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={17} /> Continuar por WhatsApp
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={enviar}>
            <span className="kicker">Cuéntanos tu idea</span>
            <h2 id="quote-title">Solicita una cotización</h2>

            <ol className="checkout-steps" aria-label="Pasos de solicitud">
              {["Servicios", "Detalles del proyecto", "Envío de solicitud"].map((label, index) => (
                <li key={label} className={step === index ? "active" : step > index ? "complete" : ""}>
                  <span>{index + 1}</span>{label}
                </li>
              ))}
            </ol>

            {step === 0 && <div className="quote-options">
              {services.map((service) => {
                const isSelected = selected.includes(service.nombre);
                return (
                  <button
                    key={service.id ?? service.nombre}
                    type="button"
                    className={isSelected ? "selected" : ""}
                    aria-pressed={isSelected}
                    onClick={() => toggleService(service.nombre)}
                  >
                    <span>{service.nombre}</span>
                    <span>{service.precio_desde == null ? "A cotizar" : `S/ ${formatCurrency(Number(service.precio_desde))}`}</span>
                  </button>
                );
              })}
            </div>}

            {step === 0 && <p className="center-cta">
              <span>
                {inversionEstimada > 0
                  ? <><b>Inversión referencial:</b> S/ {formatCurrency(inversionEstimada)}{requiereCotizacion ? " más los servicios a cotizar" : " (sujeta a propuesta)"}</>
                  : "El precio final se define en la propuesta según el alcance del proyecto."}
              </span>
            </p>}

            {step === 1 && <div className="quote-fields">
              <label>
                <span>Nombre</span>
                <input required maxLength={255} value={nombre} onChange={(event) => setNombre(event.target.value)} />
              </label>
              <label>
                <span>Empresa</span>
                <input maxLength={255} value={empresa} onChange={(event) => setEmpresa(event.target.value)} />
              </label>
              <label>
                <span>Correo o WhatsApp</span>
                <input required maxLength={255} value={contacto} onChange={(event) => setContacto(event.target.value)} />
              </label>
              <label>
                <span>Cuéntanos brevemente sobre tu proyecto</span>
                <textarea maxLength={500} value={mensaje} onChange={(event) => setMensaje(event.target.value)} />
              </label>
              {seleccionados.some((service) => /tienda|e-commerce|ecommerce/i.test(service.nombre)) && (
                <StoreCoverage />
              )}
            </div>}

            {step === 2 && (
              <div className="checkout-payment-info">
                <h3>Revisa tu solicitud</h3>
                <ul>
                  {seleccionados.map((service) => (
                    <li key={service.id ?? service.nombre}>
                      {service.nombre} — {service.precio_desde == null ? "A cotizar" : `desde S/ ${formatCurrency(Number(service.precio_desde))}`}
                    </li>
                  ))}
                </ul>
                <p>Al enviar, no se realiza ningún cobro. Revisaremos los detalles del proyecto y te contactaremos con una propuesta personalizada.</p>
                {inversionEstimada > 0 && (
                  <p><b>Inversión referencial:</b> S/ {formatCurrency(inversionEstimada)}{requiereCotizacion ? " más los servicios a cotizar" : ", sujeta al alcance final"}.</p>
                )}
              </div>
            )}

            {estado === "error" && <p className="form-status error">{error}</p>}

            <div className="quote-nav">
              <button className="button button-secondary" type="button" onClick={() => step === 0 ? onClose() : setStep(step - 1)}>{step === 0 ? "Cancelar" : "Atrás"}</button>
              <button className="button" type="submit" disabled={estado === "enviando" || (step === 0 && selected.length === 0)}>
                {step === 0 ? "Continuar" : step === 1 ? "Revisar solicitud" : estado === "enviando" ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function StoreCoverage() {
  const [location, setLocation] = useState("");
  const [coverage, setCoverage] = useState<CoverageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkCoverage = async () => {
    setLoading(true);
    setError("");
    try {
      setCoverage(await getCoverage(location, "Tiendas en línea"));
    } catch (coverageError) {
      setError(coverageError instanceof Error ? coverageError.message : "No se pudo consultar la cobertura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-coverage">
      <label><span>Ubicación de referencia para la tienda en línea</span>
        <input maxLength={120} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Distrito o ciudad" />
      </label>
      <button className="button button-secondary" type="button" disabled={loading} onClick={() => void checkCoverage()}>
        {loading ? "Consultando..." : "Consultar cobertura"}
      </button>
      <small>La cobertura y tarifa corresponden a las opciones de envío que se configurarían en tu tienda; no son un cobro de este servicio digital.</small>
      {coverage?.envio && (coverage.envio.ubicacion_requerida
        ? <p>{coverage.envio.zonas?.length ? `Zonas configuradas: ${coverage.envio.zonas.map((zone) => zone.location).join(", ")}` : "Aún no hay zonas de envío configuradas."}</p>
        : coverage.envio.cubierto
          ? <p>{coverage.envio.ubicacion}: S/ {formatCurrency(coverage.envio.costo ?? 0)}{coverage.envio.plazo_dias ? ` · ${coverage.envio.plazo_dias} días` : ""}</p>
          : <p>{coverage.envio.mensaje}</p>)}
      {error && <p className="form-status error">{error}</p>}
    </div>
  );
}

function ServiceDetail({
  slug,
  service,
  projects,
  onQuote,
  onNavigate,
}: {
  slug: string;
  service: ApiService | undefined;
  projects: ApiPortfolioProject[];
  onQuote: (name: string) => void;
  onNavigate: (path: string) => void;
}) {
  const [detail, setDetail] = useState<(ApiService & { resenas?: ServiceReview[]; proyectos_relacionados?: ApiPortfolioProject[] }) | null>(service ?? null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSort, setReviewSort] = useState<"recent" | "highest" | "lowest">("recent");

  useEffect(() => {
    let active = true;
    setDetail(service ?? null);
    setReviews([]);
    void getServiceBySlug(slug).then((result) => {
      if (!active || !result) return;
      setDetail(result);
      setReviews(result.resenas ?? []);
    });
    return () => { active = false; };
  }, [slug, service]);

  useEffect(() => {
    if (!detail) return;
    const title = `${detail.nombre} | DigitalPyme`;
    const description = detail.descripcion_larga || detail.descripcion || `Conoce el servicio de ${detail.nombre} de DigitalPyme.`;
    document.title = title;
    updateMeta('meta[name="description"]', "name", "description", description);
    updateMeta('meta[property="og:title"]', "property", "og:title", title);
    updateMeta('meta[property="og:description"]', "property", "og:description", description);
    updateMeta('meta[property="og:url"]', "property", "og:url", `${window.location.origin}/servicios/${slug}`);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}/servicios/${slug}`;
  }, [detail, slug]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!detail?.id) {
      setReviewError("No se pudo identificar el servicio. Intenta más tarde.");
      return;
    }
    setReviewError("");
    setReviewStatus("");
    try {
      const result = await submitServiceReview(detail.id, {
        nombre: reviewName,
        email: reviewEmail,
        calificacion: reviewRating,
        titulo: reviewTitle,
        comentario: reviewComment,
      });
      setReviewStatus(result.mensaje);
      setReviewName("");
      setReviewEmail("");
      setReviewTitle("");
      setReviewComment("");
    } catch (submitError) {
      setReviewError(submitError instanceof Error ? submitError.message : "No se pudo enviar la reseña.");
    }
  };

  if (!detail) {
    return <main className="service-detail container"><p>Servicio no encontrado.</p><a className="button" href="/">Volver al inicio</a></main>;
  }

  const relatedProjects = detail.proyectos_relacionados?.length
    ? detail.proyectos_relacionados
    : projects.filter((project) => project.related_service_id === detail.id);
  const reviewCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.calificacion === rating).length,
  }));
  const reviewCount = Number(detail.total_resenas ?? reviews.length);
  const averageRating = Number(detail.calificacion_promedio ?? 0);
  const sortedReviews = [...reviews].sort((first, second) => {
    if (reviewSort === "highest") return second.calificacion - first.calificacion;
    if (reviewSort === "lowest") return first.calificacion - second.calificacion;
    return new Date(second.created_at ?? 0).getTime() - new Date(first.created_at ?? 0).getTime();
  });

  return (
    <main className="service-detail container">
      <nav className="breadcrumbs" aria-label="Migas de pan">
        <a href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }}>Inicio</a><span>›</span>
        <a href="/#servicios" onClick={(event) => { event.preventDefault(); onNavigate("/#servicios"); }}>Servicios</a><span>›</span><span aria-current="page">{detail.nombre}</span>
      </nav>
      <span className="kicker">{detail.category?.nombre || "Servicio digital"}{detail.subcategory ? ` · ${detail.subcategory.nombre}` : ""}</span>
      {detail.etiqueta && <span className="catalog-badge">{detail.etiqueta}</span>}
      <h1>{detail.nombre}</h1>
      <p className="service-detail-lead">{detail.descripcion_larga || detail.descripcion}</p>
      <div className="service-detail-meta">
        <span>{formatServiceMeta(detail)}</span>
        {(Number(detail.total_resenas) > 0 || reviews.length > 0) && <span aria-label={`Calificación promedio ${Number(detail.calificacion_promedio ?? 0).toFixed(1)} de 5`}>★ {Number(detail.calificacion_promedio ?? 0).toFixed(1)} · {detail.total_resenas ?? reviews.length} reseñas</span>}
      </div>
      <button className="button" type="button" onClick={() => onQuote(detail.nombre)}>Añadir a mi proyecto</button>

      {detail.incluye?.length ? <section><h2>Qué incluye</h2><ul className="service-includes">{detail.incluye.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      {/tienda|e-commerce|ecommerce/i.test(detail.nombre) && <section className="store-detail-coverage"><h2>Envío y cobertura</h2><StoreCoverage /></section>}
      {relatedProjects.length > 0 && (
        <section><h2>Proyectos relacionados</h2><div className="related-projects">
          {relatedProjects.map((project) => <a href="/#proyectos" key={project.id ?? project.nombre} onClick={(event) => { event.preventDefault(); onNavigate("/#proyectos"); }}>
            <img src={project.imagen} alt={project.imagen_alt || `Proyecto digital para ${project.nombre}`} loading="lazy" decoding="async" />
            <span><b>{project.nombre}</b>{project.resultado}</span>
          </a>)}
        </div></section>
      )}
      <section className="service-reviews">
        <div className="service-review-heading">
          <div><span className="kicker">Opiniones de clientes</span><h2>Reseñas de {detail.nombre}</h2></div>
          <a className="button" href="#write-service-review">Escribir una reseña</a>
        </div>
        <div className="service-review-overview">
          <div className="service-review-score">
            <strong>{reviewCount > 0 ? averageRating.toFixed(1) : "—"}<small>{reviewCount > 0 ? "/5" : ""}</small></strong>
            <span className="service-review-stars" aria-label={reviewCount > 0 ? `${averageRating.toFixed(1)} de 5 estrellas` : "Sin valoraciones"}>
              {"★".repeat(Math.round(averageRating))}{"☆".repeat(5 - Math.round(averageRating))}
            </span>
            <span>{reviewCount} {reviewCount === 1 ? "reseña" : "reseñas"}</span>
          </div>
          <div className="service-review-distribution" aria-label="Distribución de calificaciones">
            {reviewCounts.map(({ rating, count }) => (
              <div className="service-review-rating-row" key={rating}>
                <span>{rating} <span aria-hidden="true">★</span></span>
                <div className="service-review-rating-track" aria-hidden="true"><i style={{ width: `${reviews.length ? count / reviews.length * 100 : 0}%` }} /></div>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="service-review-list-heading">
          <h3>Opiniones de clientes</h3>
          <label>Ordenar por
            <select aria-label="Ordenar reseñas" value={reviewSort} onChange={(event) => setReviewSort(event.target.value as typeof reviewSort)}>
              <option value="recent">Más recientes</option>
              <option value="highest">Mayor calificación</option>
              <option value="lowest">Menor calificación</option>
            </select>
          </label>
        </div>
        {sortedReviews.length > 0 ? (
          <div className="service-review-list">
            {sortedReviews.map((review) => {
              const initials = review.nombre.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("es");
              const reviewDate = review.created_at ? new Date(review.created_at) : null;
              return <article key={review.id}>
                <span className="service-review-avatar" aria-hidden="true">{initials}</span>
                <div className="service-review-content">
                  <header><b>{review.nombre}</b>{reviewDate && !Number.isNaN(reviewDate.getTime()) && <time dateTime={review.created_at}>{reviewDate.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}</time>}</header>
                  <span className="service-review-entry-stars" aria-label={`${review.calificacion} de 5 estrellas`}>
                    {"★".repeat(review.calificacion)}{"☆".repeat(5 - review.calificacion)} <b>{review.calificacion}</b>
                  </span>
                  {review.titulo && <h4>{review.titulo}</h4>}
                  <p>{review.comentario}</p>
                </div>
              </article>;
            })}
          </div>
        ) : <p className="service-review-empty">Aún no hay reseñas publicadas para este servicio. Si ya trabajaste con nosotros, comparte tu experiencia.</p>}
        <form id="write-service-review" className="review-form" onSubmit={(event) => void submitReview(event)}>
          <h3>Comparte tu experiencia</h3>
          <p className="service-review-moderation-note">Las reseñas se revisan antes de aparecer públicamente.</p>
          <label>Nombre<input required maxLength={120} value={reviewName} onChange={(event) => setReviewName(event.target.value)} /></label>
          <label>Correo<input required type="email" maxLength={255} value={reviewEmail} onChange={(event) => setReviewEmail(event.target.value)} /></label>
          <label>Calificación<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}</select></label>
          <label>Título (opcional)<input maxLength={160} value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} /></label>
          <label>Comentario<textarea required maxLength={2000} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} /></label>
          {reviewStatus && <p className="form-status success">{reviewStatus}</p>}
          {reviewError && <p className="form-status error">{reviewError}</p>}
          <button className="button" type="submit">Enviar valoración</button>
        </form>
      </section>
    </main>
  );
}

type PortalTab = "resumen" | "proyecto" | "pagos" | "archivos" | "pedidos" | "cuenta";

function restoreClientSession(): ClientSession | null {
  try {
    const token = localStorage.getItem("digitalpyme.client.token");
    const usuario = localStorage.getItem("digitalpyme.client.user");
    if (!token || !usuario) return null;
    return { token, usuario: JSON.parse(usuario) as ClientSession["usuario"] };
  } catch {
    return null;
  }
}

function ClientPortal({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<ClientSession | null>(restoreClientSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<ClientPaymentOptions | null>(null);
  const [tab, setTab] = useState<PortalTab>("resumen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true);
    setError("");

    void getClientProjects(session.token)
      .then((loadedProjects) => {
        if (!active) return;
        setProjects(loadedProjects);
        setSelectedProjectId((current) => (
          current && loadedProjects.some((project) => project.id === current)
            ? current
            : loadedProjects[0]?.id ?? null
        ));
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tus proyectos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session || selectedProjectId === null) {
      setSelectedProject(null);
      setPaymentOptions(null);
      return;
    }

    let active = true;
    setSelectedProject(null);
    setPaymentOptions(null);
    setError("");
    void Promise.all([
      getClientProject(session.token, selectedProjectId),
      getClientPaymentOptions(session.token, selectedProjectId),
    ])
      .then(([project, options]) => {
        if (active) setSelectedProject(project);
        if (active) setPaymentOptions(options);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el proyecto.");
      });

    return () => { active = false; };
  }, [session, selectedProjectId]);

  const closePortal = () => {
    setSession(null);
    setProjects([]);
    setSelectedProject(null);
    localStorage.removeItem("digitalpyme.client.token");
    localStorage.removeItem("digitalpyme.client.user");
    onClose();
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setError("");

    try {
      const result = await clientLogin(email, password);
      localStorage.setItem("digitalpyme.client.token", result.token);
      localStorage.setItem("digitalpyme.client.user", JSON.stringify(result.usuario));
      setSession(result);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setLoginBusy(false);
    }
  };

  const approveMilestone = async (milestoneId: number) => {
    if (!session || !selectedProject) return;
    setError("");
    setNotice("");

    try {
      const approved = await approveProjectMilestone(session.token, selectedProject.id, milestoneId);
      setSelectedProject({
        ...selectedProject,
        milestones: selectedProject.milestones.map((milestone) => milestone.id === approved.id ? approved : milestone),
      });
      setNotice("Hito aprobado correctamente.");
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "No se pudo aprobar el hito.");
    }
  };

  const refreshPayments = async (projectId: number) => {
    if (!session) return;

    const [options, project] = await Promise.all([
      getClientPaymentOptions(session.token, projectId),
      getClientProject(session.token, projectId),
    ]);
    setPaymentOptions(options);
    setSelectedProject(project);
  };

  const createTransfer = async (milestoneId?: number, method: "bank_transfer" | "yape_plin" = "bank_transfer") => {
    if (!session || !activeProject) return;
    setError("");
    setNotice("");

    try {
      const result = await startBankTransfer(session.token, activeProject.id, milestoneId, method);
      setNotice(result.mensaje);
      await refreshPayments(activeProject.id);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "No se pudo registrar el pago por transferencia.");
    }
  };

  const payByCard = async (milestoneId?: number) => {
    if (!session || !activeProject) return;
    setError("");

    try {
      const result = await startCardPayment(session.token, activeProject.id, milestoneId);
      window.location.assign(result.checkout_url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "No se pudo iniciar el pago con tarjeta.");
    }
  };

  const sendReceipt = async (payment: ProjectPayment, file?: File) => {
    if (!session || !activeProject || !file) return;
    setError("");
    setNotice("");

    try {
      await uploadTransferReceipt(session.token, activeProject.id, payment.id, file);
      setNotice(`Comprobante enviado. El administrador revisará el pago por ${payment.method === "yape_plin" ? "Yape/Plin" : "transferencia"}.`);
      await refreshPayments(activeProject.id);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el comprobante.");
    }
  };

  const downloadFile = async (file: ProjectFile) => {
    if (!session || !selectedProject) return;
    setDownloadingId(file.id);
    setError("");

    try {
      const result = await downloadProjectFile(session.token, selectedProject.id, file.id);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "No se pudo descargar el archivo.");
    } finally {
      setDownloadingId(null);
    }
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;
    setError("");
    setNotice("");

    try {
      const result = await changeClientPassword(session.token, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      setNotice(result.mensaje);
      localStorage.removeItem("digitalpyme.client.token");
      localStorage.removeItem("digitalpyme.client.user");
      setSession(null);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "No se pudo actualizar la contraseña.");
    }
  };

  const logout = async () => {
    if (!session) return;
    try {
      await clientLogout(session.token);
      closePortal();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "No se pudo cerrar la sesión.");
    }
  };

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-story">
          <button className="auth-brand" onClick={onClose} type="button"><Brand light /></button>
          <div className="auth-story-copy">
            <span className="kicker kicker-light">Tu espacio de trabajo</span>
            <h1>Todo tu proyecto, en un solo lugar.</h1>
            <p>Revisa tus avances, aprueba entregables y mantente en contacto con nuestro equipo.</p>
            <div className="auth-proof"><span><Icon name="check" /></span><p><b>Avances transparentes</b>Seguimiento de tu proyecto en tiempo real.</p></div>
            <div className="auth-proof"><span><Icon name="file" /></span><p><b>Archivos y comprobantes</b>Documentos de tu proyecto siempre disponibles.</p></div>
          </div>
          <small>© 2025 DigitalPyme. Hecho en Perú.</small>
        </section>
        <section className="auth-form-wrap">
          <button className="auth-close" type="button" aria-label="Volver a la página" onClick={onClose}><Icon name="x" /></button>
          <form className="auth-form" onSubmit={login}>
            <div className="auth-mobile-logo"><Brand /></div>
            <span className="kicker">Bienvenido de nuevo</span>
            <h2>Portal cliente</h2>
            <p>Ingresa con el correo y la contraseña de tu cuenta.</p>
            {notice && <p className="form-status success">{notice}</p>}
            <label>
              Correo electrónico
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Contraseña
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <p className="form-status error">{error}</p>}
            <button className="button" type="submit" disabled={loginBusy}>
              {loginBusy ? "Ingresando..." : "Iniciar sesión"}
            </button>
            <small><Icon name="check" size={13} /> Acceso privado y seguro</small>
          </form>
        </section>
      </main>
    );
  }

  const activeProject = selectedProject;
  const files = activeProject?.documents ?? [];
  const payments = paymentOptions?.payments ?? [];
  const quoteAmount = activeProject?.cotizacion ? Number(activeProject.cotizacion.monto) : 0;
  const hasActiveFullPayment = payments.some((payment) => payment.milestone_id === null && ["pendiente", "comprobante_enviado", "pagado"].includes(payment.status));
  const hasActiveMilestonePayment = payments.some((payment) => payment.milestone_id !== null && ["pendiente", "comprobante_enviado", "pagado"].includes(payment.status));
  const paidAmount = payments
    .filter((payment) => payment.status === "pagado")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const approvedMilestones = activeProject?.milestones.filter((milestone) => milestone.estado === "aprobado").length ?? 0;
  const milestonesPendingReview = activeProject?.milestones.filter((milestone) => milestone.estado === "pendiente_aprobacion").length ?? 0;
  const milestonesPending = activeProject?.milestones.filter((milestone) => milestone.estado === "pendiente").length ?? 0;
  const remainingBalance = Math.max(quoteAmount - paidAmount, 0);
  const milestoneBars = [
    { label: "Aprobados", count: approvedMilestones },
    { label: "En revisión", count: milestonesPendingReview },
    { label: "Pendientes", count: milestonesPending },
  ];
  const milestoneBarScale = Math.max(...milestoneBars.map((item) => item.count), 1);
  const stages = ["Diagnóstico", "Propuesta", "Desarrollo", "Entrega"];
  const stageIndex = activeProject?.estado === "completado"
    ? 3
    : activeProject?.estado === "revision"
      ? 2
      : activeProject?.estado === "en_progreso"
        ? 2
        : 0;

  const renderFileList = (fileList: ProjectFile[]) => fileList.length === 0
    ? <p>No hay archivos disponibles por ahora.</p>
    : (
      <div className="file-list">
        {fileList.map((file) => (
          <div key={file.id}>
            <span className="summary-icon lilac"><Icon name="file" size={17} /></span>
            <p><b>{file.original_name}</b><small>{file.tipo === "comprobante" ? "Comprobante" : "Documento"} · {(file.size / 1024).toFixed(0)} KB</small></p>
            <button type="button" disabled={downloadingId === file.id} onClick={() => void downloadFile(file)}>
              {downloadingId === file.id ? "Descargando..." : "Descargar"}
            </button>
          </div>
        ))}
      </div>
    );

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
            <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
              <Icon name={icon} size={17} />{label}
            </button>
          ))}
          <span className="portal-nav-label portal-nav-label-secondary">CUENTA</span>
          {([
            ["cuenta", "Mi cuenta", "user"],
          ] as const).map(([key, label, icon]) => (
            <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
              <Icon name={icon} size={17} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="account"><span>{session.usuario.name.slice(0, 2).toUpperCase()}</span><p><b>{session.usuario.name}</b>{session.usuario.email}</p></div>
          <button type="button" onClick={() => void logout()}><Icon name="x" size={15} /> Cerrar sesión</button>
          <button type="button" onClick={onClose}><Icon name="arrow" size={15} /> Volver al sitio</button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <button className="mobile-portal-brand" type="button" onClick={onClose}><Brand /></button>
          <div><button type="button" aria-label="Ir a mi cuenta" title="Mi cuenta" onClick={() => setTab("cuenta")}><Icon name="user" size={17} /></button></div>
        </header>
        <div className="portal-content">
          <div className="portal-heading">
            <div><span>Bienvenido, {session.usuario.name}</span><h1>{tab === "resumen" ? "Resumen de tu proyecto" : tab === "proyecto" ? "Mi proyecto" : tab === "pagos" ? "Pagos" : tab === "archivos" ? "Archivos y comprobantes" : tab === "pedidos" ? "Mis pedidos" : "Mi cuenta"}</h1></div>
            {projects.length > 0 && (
              <select aria-label="Seleccionar proyecto" value={selectedProjectId ?? ""} onChange={(event) => setSelectedProjectId(Number(event.target.value))}>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.nombre}</option>)}
              </select>
            )}
          </div>

          {error && <p className="form-status error">{error}</p>}
          {notice && <p className="form-status success">{notice}</p>}
          {loading && <p>Cargando tu información...</p>}
          {!loading && projects.length === 0 && !error && tab !== "pedidos" && tab !== "resumen" && <div className="portal-panel"><h2>Aún no tienes proyectos activos</h2><p>Cuando aceptes una propuesta, aquí podrás revisar tu presupuesto y los avances.</p></div>}
          {tab === "pedidos" && <ClientStoreOrders token={session.token} />}

          {tab === "resumen" && (
            <section className="client-dashboard" aria-label="Resumen del cliente">
              {activeProject ? (
                <>
                  <div className="client-dashboard-metrics">
                    <article className="client-metric-card client-metric-featured">
                      <span>Presupuesto aprobado</span>
                      <strong>S/ {formatCurrency(quoteAmount)}</strong>
                      <small>{activeProject.cotizacion?.servicio ?? activeProject.nombre}</small>
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
                          <div><h2>Hitos del proyecto</h2><p>Estado actual de tus entregables.</p></div>
                          <button className="client-text-button" type="button" onClick={() => setTab("proyecto")}>Ver proyecto <Icon name="arrow" size={14} /></button>
                        </div>
                        {activeProject.milestones.length === 0 ? (
                          <div className="client-chart-empty">
                            <span><Icon name="spark" size={18} /></span>
                            <p>Aún no hay hitos registrados para mostrar.</p>
                          </div>
                        ) : (
                          <div className="client-milestone-chart">
                            {milestoneBars.map((item) => (
                              <div className="client-milestone-bar" key={item.label}>
                                <div className="client-milestone-bar-value">{item.count}</div>
                                <div className="client-milestone-bar-track">
                                  <i className={item.count > 0 ? "has-value" : ""} style={{ height: `${(item.count / milestoneBarScale) * 100}%` }} />
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
                          <div><h2>Actividad reciente</h2><p>Pagos registrados y estado de verificación.</p></div>
                          <button className="client-text-button" type="button" onClick={() => setTab("pagos")}>Ver pagos <Icon name="arrow" size={14} /></button>
                        </div>
                        {payments.length === 0 ? (
                          <p>Aún no hay pagos registrados para este proyecto.</p>
                        ) : (
                          <>
                            <div className="client-transaction-head"><span>Concepto</span><span>Fecha</span><span>Estado</span><span>Monto</span></div>
                            {payments.slice(0, 5).map((payment) => (
                              <div className="client-transaction-row" key={payment.id}>
                                <span className="client-transaction-method"><i className={payment.status === "pagado" ? "is-paid" : ""}><Icon name={payment.status === "pagado" ? "check" : "money"} size={14} /></i><b>{payment.milestone?.titulo ?? (payment.milestone_id ? "Pago por hito" : "Proyecto completo")}<small>{payment.method === "card" ? "Tarjeta" : payment.method === "yape_plin" ? "Yape/Plin" : "Transferencia bancaria"}</small></b></span>
                                <span>{new Date(payment.created_at).toLocaleDateString("es-PE")}</span>
                                <i className={`client-transaction-status ${payment.status === "pagado" ? "is-paid" : ""}`}>{payment.status.replace(/_/g, " ")}</i>
                                <strong>S/ {formatCurrency(Number(payment.amount))}</strong>
                              </div>
                            ))}
                          </>
                        )}
                      </section>
                    </div>

                    <aside className="client-dashboard-aside">
                      <section className="client-project-card client-performance-card">
                        <div className="client-performance-heading"><span className="client-project-card-label">AVANCE DEL PROYECTO</span><Icon name="grid" size={17} /></div>
                        <div className="client-project-card-heading">
                          <h2>{activeProject.nombre}</h2>
                          <div className="client-project-radial" style={{ background: `conic-gradient(var(--lime) ${activeProject.progreso}%, #48635e 0)` }}>
                            <strong>{activeProject.progreso}%</strong><span>avance</span>
                          </div>
                        </div>
                        <span className="client-project-status"><i />{activeProject.estado.replace(/_/g, " ")}</span>
                        <div className="client-project-progress"><i style={{ width: `${activeProject.progreso}%` }} /></div>
                        <div className="client-project-delivery"><span>Hitos aprobados</span><b>{approvedMilestones} de {activeProject.milestones.length}</b></div>
                        <button type="button" onClick={() => setTab("proyecto")}>Ver proyecto <Icon name="arrow" size={15} /></button>
                      </section>

                      <section className="portal-panel client-next-card">
                        <span className="client-next-card-icon"><Icon name="calendar" size={16} /></span>
                        <span className="client-project-card-label">PRÓXIMO PASO</span>
                        <h3>{activeProject.milestones.find((milestone) => milestone.estado !== "aprobado")?.titulo ?? (activeProject.estado === "completado" ? "Proyecto completado" : "Pendiente de coordinación")}</h3>
                        <p>{activeProject.fecha_entrega ? `Fecha de entrega estimada: ${activeProject.fecha_entrega}` : "Revisa tus hitos para conocer las próximas entregas."}</p>
                        <button type="button" onClick={() => setTab("proyecto")}>Ver avances <Icon name="arrow" size={14} /></button>
                      </section>
                    </aside>
                  </div>
                </>
              ) : projects.length > 0 ? (
                <div className="portal-panel client-dashboard-empty"><p>{loading ? "Cargando el resumen del proyecto..." : "No se pudo mostrar el resumen del proyecto seleccionado."}</p></div>
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
                          <div><h2>Actividad del proyecto</h2><p>Hitos y entregables aparecerán aquí cuando inicie tu proyecto.</p></div>
                        </div>
                        <div className="client-chart-empty">
                          <span><Icon name="spark" size={18} /></span>
                          <p>Aún no tienes hitos registrados.</p>
                        </div>
                      </section>

                      <section className="portal-panel client-transactions-panel">
                        <div className="panel-head">
                          <div><h2>Actividad reciente</h2><p>Pagos y movimientos de tus proyectos.</p></div>
                        </div>
                        <div className="client-empty-activity">
                          <span className="client-activity-icon"><Icon name="money" size={15} /></span>
                          <div><b>Sin movimientos por ahora</b><small>Tu actividad aparecerá en este espacio.</small></div>
                        </div>
                      </section>
                    </div>

                    <aside className="client-dashboard-aside">
                      <section className="client-project-card client-performance-card client-empty-project-card">
                        <div className="client-performance-heading"><span className="client-project-card-label">TU ESPACIO DIGITALPYME</span><Icon name="grid" size={17} /></div>
                        <div className="client-empty-project-visual"><Icon name="spark" size={25} /></div>
                        <h2>Aún no tienes proyectos activos</h2>
                        <p>Cuando aceptes una propuesta, aquí podrás revisar tus avances, pagos y archivos.</p>
                        <button type="button" onClick={onClose}>Explorar servicios <Icon name="arrow" size={15} /></button>
                      </section>
                      <section className="portal-panel client-next-card">
                        <span className="client-next-card-icon"><Icon name="file" size={16} /></span>
                        <span className="client-project-card-label">TUS DOCUMENTOS</span>
                        <h3>Archivos y comprobantes</h3>
                        <p>Cuando haya documentos de tu proyecto, podrás descargarlos desde aquí.</p>
                        <button type="button" onClick={() => setTab("archivos")}>Ir a archivos <Icon name="arrow" size={14} /></button>
                      </section>
                    </aside>
                  </div>
                </>
              )}
            </section>
          )}

          {activeProject && (tab === "resumen" || tab === "proyecto") && (
            <>
              {tab === "proyecto" && <div className="project-overview">
                <div><span>Proyecto</span><strong>{activeProject.nombre}</strong><div className="progress-track"><i style={{ width: `${activeProject.progreso}%` }} /></div></div>
                <div><span>Estado</span><b>{activeProject.estado.replace(/_/g, " ")}</b></div>
                <div><span>Progreso</span><b>{activeProject.progreso}%</b></div>
                <div><span>Entrega</span><b>{activeProject.fecha_entrega ?? "Por definir"}</b></div>
              </div>}
              {tab === "proyecto" && (
                <div className="portal-panel">
                  <div className="panel-head"><div><h2>Presupuesto y avances</h2><p>{activeProject.cotizacion?.servicio ?? activeProject.nombre}</p></div><strong>S/ {formatCurrency(quoteAmount)}</strong></div>
                  {activeProject.cotizacion?.descripcion && <p>{activeProject.cotizacion.descripcion}</p>}
                  <div className="timeline">
                    {stages.map((stage, index) => (
                      <div key={stage} className={`timeline-step ${index < stageIndex ? "done" : ""} ${index === stageIndex ? "current" : ""}`}>
                        <span>{index < stageIndex ? <Icon name="check" size={15} /> : `0${index + 1}`}</span><h3>{stage}</h3>
                      </div>
                    ))}
                  </div>
                  <h2>Hitos del proyecto</h2>
                  {activeProject.milestones.length === 0 && <p>Aún no hay hitos registrados.</p>}
                  {activeProject.milestones.map((milestone) => (
                    <div className="payment-row" key={milestone.id}>
                      <span><Icon name={milestone.estado === "aprobado" ? "check" : "file"} size={15} /></span>
                      <p><b>{milestone.titulo}</b>{milestone.descripcion}</p>
                      <strong>{milestone.monto === null ? "—" : `S/ ${formatCurrency(Number(milestone.monto))}`}</strong>
                      <i className={milestone.estado === "aprobado" ? "pagado" : "pendiente"}>{milestone.estado.replace(/_/g, " ")}</i>
                      {milestone.estado === "pendiente_aprobacion" && <button className="button" type="button" onClick={() => void approveMilestone(milestone.id)}>Aprobar hito</button>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeProject && tab === "archivos" && (
            <div className="portal-panel">
              <div className="panel-head"><div><h2>Documentos de tu proyecto</h2><p>Descarga archivos y comprobantes disponibles.</p></div></div>
              {renderFileList(files)}
            </div>
          )}

          {activeProject && tab === "pagos" && (
            <>
              <div className="payment-summary">
                <div><span>Presupuesto aceptado</span><strong>S/ {formatCurrency(quoteAmount)}</strong></div>
                <div><span>Pagado</span><strong>S/ {formatCurrency(payments.filter((payment) => payment.status === "pagado").reduce((sum, payment) => sum + Number(payment.amount), 0))}</strong></div>
                <div><span>Por verificar</span><strong>S/ {formatCurrency(payments.filter((payment) => payment.status === "pendiente" || payment.status === "comprobante_enviado").reduce((sum, payment) => sum + Number(payment.amount), 0))}</strong></div>
              </div>

              <div className="portal-panel">
                <div className="panel-head">
                  <div><h2>Realizar un pago</h2><p>Paga el presupuesto completo o un hito aprobado.</p></div>
                </div>
                <div className="payment-row">
                  <span><Icon name="money" size={16} /></span>
                  <p><b>Proyecto completo</b>{activeProject.cotizacion?.servicio ?? activeProject.nombre}</p>
                  <strong>S/ {formatCurrency(quoteAmount)}</strong>
                  <i className={payments.some((payment) => payment.milestone_id === null && payment.status === "pagado") ? "pagado" : "próximo"}>
                    {payments.some((payment) => payment.milestone_id === null && payment.status === "pagado") ? "pagado" : "disponible"}
                  </i>
                  <div>
                    <button className="button" type="button" disabled={hasActiveFullPayment || hasActiveMilestonePayment} onClick={() => void createTransfer()}>
                      Transferencia
                    </button>
                    {paymentOptions?.yape_plin.enabled && <button className="button button-secondary" type="button" disabled={hasActiveFullPayment || hasActiveMilestonePayment} onClick={() => void createTransfer(undefined, "yape_plin")}>
                      Yape/Plin
                    </button>}
                    <button className="button button-secondary" type="button" disabled={!paymentOptions?.card_enabled || hasActiveFullPayment || hasActiveMilestonePayment} onClick={() => void payByCard()}>
                      Tarjeta
                    </button>
                  </div>
                </div>

                {activeProject.milestones.filter((milestone) => milestone.estado === "aprobado" && milestone.monto !== null && Number(milestone.monto) > 0).map((milestone) => {
                  const milestonePayments = payments.filter((payment) => payment.milestone_id === milestone.id);
                  const isActive = hasActiveFullPayment || milestonePayments.some((payment) => ["pendiente", "comprobante_enviado", "pagado"].includes(payment.status));
                  const isPaid = milestonePayments.some((payment) => payment.status === "pagado");
                  return (
                    <div className="payment-row" key={milestone.id}>
                      <span><Icon name="check" size={16} /></span>
                      <p><b>{milestone.titulo}</b>Hito aprobado</p>
                      <strong>S/ {formatCurrency(Number(milestone.monto))}</strong>
                      <i className={isPaid ? "pagado" : "próximo"}>{isPaid ? "pagado" : "disponible"}</i>
                      <div>
                        <button className="button" type="button" disabled={isActive} onClick={() => void createTransfer(milestone.id)}>Transferencia</button>
                        {paymentOptions?.yape_plin.enabled && <button className="button button-secondary" type="button" disabled={isActive} onClick={() => void createTransfer(milestone.id, "yape_plin")}>Yape/Plin</button>}
                        <button className="button button-secondary" type="button" disabled={!paymentOptions?.card_enabled || isActive} onClick={() => void payByCard(milestone.id)}>Tarjeta</button>
                      </div>
                    </div>
                  );
                })}

                {!paymentOptions?.card_enabled && (
                  <p>El pago con tarjeta se habilitará al configurar credenciales reales de Mercado Pago en el servidor.</p>
                )}
                {paymentOptions?.yape_plin.enabled && (
                  <div className="client-yape-instructions">
                    <div><span className="client-yape-mark">Y</span><div><b>Yape/Plin</b><small>Pago manual con comprobante sujeto a verificación.</small></div></div>
                    {paymentOptions.yape_plin.qr_url && <img src={paymentOptions.yape_plin.qr_url} alt="Código QR para realizar el pago por Yape o Plin" />}
                    {paymentOptions.yape_plin.phone && <p>Número de destino <strong>{paymentOptions.yape_plin.phone}</strong></p>}
                    {paymentOptions.yape_plin.holder && <p>Titular <strong>{paymentOptions.yape_plin.holder}</strong></p>}
                    <small>Selecciona Yape/Plin en el monto que vas a pagar. Luego adjunta el comprobante desde el historial.</small>
                  </div>
                )}
                {paymentOptions?.bank_transfer && (paymentOptions.bank_transfer.bank || paymentOptions.bank_transfer.account || paymentOptions.bank_transfer.cci) && (
                  <dl>
                    {paymentOptions.bank_transfer.bank && <div><dt>Banco</dt><dd>{paymentOptions.bank_transfer.bank}</dd></div>}
                    {paymentOptions.bank_transfer.holder && <div><dt>Titular</dt><dd>{paymentOptions.bank_transfer.holder}</dd></div>}
                    {paymentOptions.bank_transfer.account && <div><dt>Cuenta</dt><dd>{paymentOptions.bank_transfer.account}</dd></div>}
                    {paymentOptions.bank_transfer.cci && <div><dt>CCI</dt><dd>{paymentOptions.bank_transfer.cci}</dd></div>}
                  </dl>
                )}
              </div>

              <div className="portal-panel">
                <div className="panel-head"><div><h2>Historial de pagos</h2><p>El estado se actualiza cuando se verifica el pago.</p></div></div>
                {payments.length === 0 && <p>Aún no hay pagos registrados para este proyecto.</p>}
                {payments.map((payment) => (
                  <div className="payment-row" key={payment.id}>
                    <span><Icon name={payment.status === "pagado" ? "check" : "money"} size={16} /></span>
                    <p><b>{payment.milestone?.titulo ?? (payment.milestone_id ? "Pago por hito" : "Proyecto completo")}</b>
                      {payment.method === "card" ? "Tarjeta · Mercado Pago" : payment.method === "yape_plin" ? "Yape/Plin" : "Transferencia bancaria"} · {new Date(payment.created_at).toLocaleDateString("es-PE")}
                    </p>
                    <strong>S/ {formatCurrency(Number(payment.amount))}</strong>
                    <i className={payment.status === "pagado" ? "pagado" : payment.status === "fallido" || payment.status === "rechazado" ? "pendiente" : "próximo"}>{payment.status.replace(/_/g, " ")}</i>
                    {payment.receipt && (
                      <button type="button" onClick={() => void downloadFile(payment.receipt!)}>Descargar comprobante</button>
                    )}
                    {payment.method !== "card" && payment.status === "pendiente" && !payment.receipt && (
                      <label className="button">
                        Adjuntar comprobante
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          hidden
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void sendReceipt(payment, file);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    )}
                    {payment.receipt && <i className={payment.status === "pagado" ? "pagado" : "pendiente"}>{payment.status === "pagado" ? "verificado" : "en revisión"}</i>}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "cuenta" && (
            <div className="portal-panel">
              <div className="panel-head"><div><h2>Cambiar contraseña</h2><p>Usa una contraseña de al menos 12 caracteres.</p></div></div>
              <form className="auth-form" onSubmit={updatePassword}>
                <label>Contraseña actual<input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
                <label>Nueva contraseña<input type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
                <label>Confirmar nueva contraseña<input type="password" autoComplete="new-password" minLength={12} required value={newPasswordConfirmation} onChange={(event) => setNewPasswordConfirmation(event.target.value)} /></label>
                <button className="button" type="submit">Actualizar contraseña</button>
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
          ] as const).map(([key, label, icon]) => <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}><Icon name={icon} size={17} />{label}</button>)}
        </nav>
      </main>
    </div>
  );
}

function updateMeta(selector: string, attribute: "name" | "property", key: string, content: string | null) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

function applySiteSettings(settings: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty("--ink", settings.theme.dark);
  root.style.setProperty("--lime", settings.theme.lime);
  root.style.setProperty("--lime-dark", settings.theme.lime === defaultSiteSettings.theme.lime ? "#a9d835" : settings.theme.lime);
  root.style.setProperty("--cream", settings.theme.cream);
  root.style.setProperty("--font-sans", `'${settings.theme.font_sans}', sans-serif`);
  root.style.setProperty("--font-display", `'${settings.theme.font_display}', serif`);
  if (settings.brand.logo_url) root.dataset.brandLogo = settings.brand.logo_url;
  else delete root.dataset.brandLogo;

  const title = settings.seo.title || defaultSiteSettings.seo.title;
  const description = settings.seo.description || defaultSiteSettings.seo.description;
  const slug = (settings.seo.slug ?? "").replace(/^\/+|\/+$/g, "");
  const canonicalUrl = new URL(slug ? `/${slug}` : "/", window.location.origin).toString();
  document.title = title;
  updateMeta('meta[name="description"]', "name", "description", description);
  updateMeta('meta[name="robots"]', "name", "robots", new URLSearchParams(window.location.search).get("admin") === "1" ? "noindex, nofollow" : "index, follow");
  updateMeta('meta[name="theme-color"]', "name", "theme-color", settings.theme.cream);
  updateMeta('meta[property="og:title"]', "property", "og:title", title);
  updateMeta('meta[property="og:description"]', "property", "og:description", description);
  updateMeta('meta[property="og:type"]', "property", "og:type", "website");
  updateMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
  updateMeta('meta[property="og:image"]', "property", "og:image", settings.seo.og_image || null);
  updateMeta('meta[name="twitter:card"]', "name", "twitter:card", settings.seo.og_image ? "summary_large_image" : "summary");
  updateMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  updateMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  updateMeta('meta[name="twitter:image"]', "name", "twitter:image", settings.seo.og_image || null);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

  let fontLink = document.getElementById("digitalpyme-custom-fonts") as HTMLLinkElement | null;
  const googleFonts = [settings.theme.font_sans, settings.theme.font_display]
    .filter((font, index, list) => list.indexOf(font) === index && font !== "Georgia");
  if (googleFonts.length > 0 && (settings.theme.font_sans !== defaultSiteSettings.theme.font_sans || settings.theme.font_display !== defaultSiteSettings.theme.font_display)) {
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = "digitalpyme-custom-fonts";
      fontLink.rel = "stylesheet";
      document.head.append(fontLink);
    }
    const fonts = googleFonts.map((font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}`);
    fontLink.href = `https://fonts.googleapis.com/css2?${fonts.join("&")}&display=swap`;
  } else {
    fontLink?.remove();
  }
}

function LegalDialog({ kind, settings, onClose }: {
  kind: "privacy" | "warranty" | "terms" | "returns";
  settings: SiteSettings;
  onClose: () => void;
}) {
  const title = kind === "privacy" ? "Política de privacidad" : kind === "warranty" ? "Garantía" : kind === "returns" ? "Política de devoluciones" : "Términos de contratación";
  const body = kind === "privacy" ? settings.legal.privacy : kind === "warranty" ? settings.legal.warranty : kind === "returns" ? settings.legal.returns : settings.legal.terms;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <button className="modal-close" type="button" aria-label="Cerrar" onClick={onClose}><Icon name="x" /></button>
        <span className="kicker">Información para clientes</span>
        <h2 id="legal-title">{title}</h2>
        <p>{body}</p>
        <button className="button" type="button" onClick={onClose}>Entendido</button>
      </section>
    </div>
  );
}

function App() {
  const [faq, setFaq] = useState<number | null>(0);
  const [filter, setFilter] = useState("Todos");
  const [serviceFilter, setServiceFilter] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [services, setServices] = useState(fallbackServices);
  const [projects, setProjects] = useState<ApiPortfolioProject[]>([]);
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(() => new URLSearchParams(window.location.search).get("admin") === "1");
  const [quoteInitialServices, setQuoteInitialServices] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [servicePath, setServicePath] = useState<string | null>(() => window.location.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null);
  const [storePath, setStorePath] = useState(() => window.location.pathname === "/tienda");
  const [legalOpen, setLegalOpen] = useState<"privacy" | "warranty" | "terms" | "returns" | null>(null);

  const openQuote = (service?: string) => {
    setQuoteInitialServices(service ? [service] : []);
    setQuoteOpen(true);
  };

  useEffect(() => {
    void Promise.all([
      getServices(fallbackServices),
      getPortfolioProjects([]),
      getTestimonials([]),
      getServiceReviews(),
      getServiceCategories(),
    ]).then(([loadedServices, loadedProjects, loadedTestimonials, loadedReviews, loadedCategories]) => {
      setServices(loadedServices);
      setProjects(loadedProjects);
      setTestimonials(loadedTestimonials);
      setReviews(loadedReviews);
      setCategories(loadedCategories.length ? loadedCategories : loadedServices.flatMap((item) => item.category ? [item.category] : []));
    });
  }, []);

  useEffect(() => {
    if (!servicePath && !storePath) applySiteSettings(siteSettings);
  }, [servicePath, storePath, siteSettings]);

  const navigateToPath = (path: string) => {
    const destination = path;
    window.history.pushState({}, "", destination);
    const destinationUrl = new URL(destination, window.location.origin);
    setServicePath(destinationUrl.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null);
    setStorePath(destinationUrl.pathname === "/tienda");
    const anchor = destination.split("#")[1];
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }), 0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPopState = () => {
      setServicePath(window.location.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null);
      setStorePath(window.location.pathname === "/tienda");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let active = true;
    const applySettings = (settings: SiteSettings) => {
      setSiteSettings(settings);
      applySiteSettings(settings);
    };
    const handleSettingsUpdate = (event: Event) => {
      const settings = (event as CustomEvent<SiteSettings>).detail;
      if (settings) applySettings(settings);
    };

    applySiteSettings(siteSettings);
    void getPublicSiteSettings().then((settings) => {
      if (active) applySettings(settings);
    });
    window.addEventListener("digitalpyme:site-settings", handleSettingsUpdate);
    return () => {
      active = false;
      window.removeEventListener("digitalpyme:site-settings", handleSettingsUpdate);
    };
  }, []);

  if (adminOpen) {
    return <AdminPortal onClose={() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("admin");
      window.history.replaceState({}, "", url);
      applySiteSettings(siteSettings);
      setAdminOpen(false);
    }} />;
  }

  if (portalOpen) {
    return <ClientPortal onClose={() => setPortalOpen(false)} />;
  }

  if (storePath) {
    return <StoreDemo onClosePortal={() => navigateToPath("/")} />;
  }

  if (servicePath) {
    const detailService = services.find((service) => serviceSlug(service) === servicePath);
    return (
      <div className="page-shell">
        <Header onQuote={() => openQuote()} onPortal={() => setPortalOpen(true)} onNavigate={navigateToPath} />
        <ServiceDetail
          slug={servicePath}
          service={detailService}
          projects={projects}
          onQuote={openQuote}
          onNavigate={navigateToPath}
        />
        <footer><div className="container footer-grid"><Brand light /><p>Soluciones digitales simples para negocios que quieren crecer.</p><div><a href="/#servicios" onClick={(event) => { event.preventDefault(); navigateToPath("/#servicios"); }}>Servicios</a><a href="/#proyectos" onClick={(event) => { event.preventDefault(); navigateToPath("/#proyectos"); }}>Proyectos</a><button type="button" onClick={() => setLegalOpen("warranty")}>Garantía</button><button type="button" onClick={() => setLegalOpen("terms")}>Términos</button>{siteSettings.legal.privacy_published && siteSettings.legal.privacy?.trim() && <button type="button" onClick={() => setLegalOpen("privacy")}>Privacidad</button>}</div><span>© 2025 DigitalPyme. Hecho en Perú.</span></div></footer>
        {quoteOpen && <QuoteBuilder services={services} initialServices={quoteInitialServices} onClose={() => setQuoteOpen(false)} />}
        {legalOpen && <LegalDialog kind={legalOpen} settings={siteSettings} onClose={() => setLegalOpen(null)} />}
      </div>
    );
  }

  const filteredServices = services.filter((service) => {
    const matchesCategory = !serviceFilter || String(service.category_id ?? service.category?.id ?? "") === serviceFilter;
    const query = serviceSearch.trim().toLocaleLowerCase("es");
    const matchesSearch = !query || `${service.nombre} ${service.descripcion ?? ""} ${service.category?.nombre ?? ""}`.toLocaleLowerCase("es").includes(query);
    return matchesCategory && matchesSearch;
  });
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = filter === "Todos" || project.categoria === filter;
    const query = projectSearch.trim().toLocaleLowerCase("es");
    return matchesCategory && (!query || `${project.nombre} ${project.categoria} ${project.resultado}`.toLocaleLowerCase("es").includes(query));
  });

  return (
    <div className="page-shell">
      <Header onQuote={() => openQuote()} onPortal={() => setPortalOpen(true)} onNavigate={navigateToPath} />

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><span /> Soluciones digitales que convierten</span>
              <h1>
                Tu <em>negocio</em> necesita una web que trabaje por ti.
              </h1>
              <p>
                Creamos soluciones digitales para negocios que quieren fortalecer su presencia y sus procesos en línea.
              </p>
              <div className="hero-actions">
                <a href="#contacto" className="button" onClick={(event) => { event.preventDefault(); openQuote(); }}>Solicitar cotización</a>
                <a href={projects.length > 0 ? "#proyectos" : "#servicios"} className="button button-secondary">
                  {projects.length > 0 ? "Ver proyectos" : "Ver servicios"}
                </a>
              </div>
              <TrustLine />
            </div>

            <div className="hero-visual" aria-hidden="true">
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
              <div className="visual-card main-card">
                <div className="visual-top">
                  <span>DigitalPyme</span>
                  <span>Ilustración</span>
                </div>
                <strong>Analítica web</strong>
                <small>Vista conceptual</small>
                <div className="chart" aria-hidden="true">
                  <i style={{ height: "33%" }} />
                  <i style={{ height: "55%" }} />
                  <i style={{ height: "48%" }} />
                  <i style={{ height: "72%" }} />
                  <i style={{ height: "62%" }} />
                  <i style={{ height: "82%" }} />
                  <i style={{ height: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section services" id="servicios">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Nuestros servicios</span>
                <h2>Soluciones digitales para tu negocio.</h2>
              </div>
              <p>Conoce nuestros servicios y solicita una propuesta de acuerdo con las necesidades y el alcance de tu proyecto.</p>
            </div>

            <div className="catalog-controls">
              <label><span className="sr-only">Buscar servicios</span><input type="search" placeholder="Buscar servicios..." value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} /></label>
              <label><span className="sr-only">Filtrar servicios por categoría</span><select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
              </select></label>
            </div>

            <div className="service-list">
              {filteredServices.map((service, index) => (
                <div className="service-row" key={service.id ?? service.nombre}>
                  <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3><a href={`/servicios/${serviceSlug(service)}`} onClick={(event) => { event.preventDefault(); navigateToPath(`/servicios/${serviceSlug(service)}`); }}>{service.nombre}</a></h3>
                    {service.etiqueta && <span className="catalog-badge">{service.etiqueta}</span>}
                    <p>{service.descripcion}</p>
                    <a className="service-detail-link" href={`/servicios/${serviceSlug(service)}`} onClick={(event) => { event.preventDefault(); navigateToPath(`/servicios/${serviceSlug(service)}`); }}>Ver detalles</a>
                  </div>
                  <span className="service-meta">{formatServiceMeta(service)}</span>
                  <button className="circle-arrow" aria-label={`Agregar ${service.nombre} a tu proyecto`} onClick={() => openQuote(service.nombre)}>
                    <Icon name="arrow" size={18} />
                  </button>
                </div>
              ))}
              {filteredServices.length === 0 && <p className="catalog-empty">No encontramos servicios con esos criterios.</p>}
            </div>
          </div>
        </section>

        <section className="section process" id="proceso">
          <div className="container">
            <span className="kicker kicker-light">Un proceso claro</span>
            <h2>
              De la idea a resultados,<br />
              <em>paso a paso.</em>
            </h2>

            <div className="process-grid">
              {[
                ["01", "Diagnóstico", "Entendemos tu negocio, clientes y objetivos."],
                ["02", "Propuesta", "Recibes alcance, inversión y fechas sin letra pequeña."],
                ["03", "Desarrollo", "Creamos contigo y ves cada avance en tu portal."],
                ["04", "Entrega", "Publicamos, capacitamos y seguimos cerca."],
              ].map((step, index) => (
                <div className="process-step" key={step[0]}>
                  <span>{step[0]}</span>
                  <div className="process-icon">
                    <Icon name={index === 0 ? "message" : index === 1 ? "file" : index === 2 ? "spark" : "check"} />
                  </div>
                  <h3>{step[1]}</h3>
                  <p>{step[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section projects" id="proyectos">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Proyectos</span>
                <h2>
                  Casos publicados<br />
                  con autorización.
                </h2>
              </div>
              {projects.length > 0 && <div className="project-catalog-tools">
                <label><span className="sr-only">Buscar proyectos</span><input type="search" placeholder="Buscar proyectos..." value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} /></label>
              <div className="filters">
                {['Todos', ...new Set(projects.map((project) => project.categoria))].map((item) => (
                  <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                    {item}
                  </button>
                ))}
              </div>
              </div>}
            </div>

            <div className="project-grid">
              {filteredProjects.map((project, index) => (
                  <article className={`project-card ${index === 0 ? "project-featured" : ""}`} key={project.id ?? project.nombre}>
                    <img src={project.imagen} alt={project.imagen_alt || `Proyecto digital para ${project.nombre}`} loading="lazy" decoding="async" />
                    {project.etiqueta && <span className="catalog-badge project-badge">{project.etiqueta}</span>}
                    <div className="project-overlay">
                      <span>{project.categoria}</span>
                      <h3>{project.nombre}</h3>
                      <p>{project.resultado}</p>
                      <button aria-label={`Ver caso ${project.nombre}`}>
                        <Icon name="arrow" />
                      </button>
                    </div>
                  </article>
                ))}
              {filteredProjects.length === 0 && <p className="catalog-empty">{projects.length === 0 ? "Aún no hay proyectos publicados. Escríbenos y conversemos sobre lo que necesitas." : "No encontramos proyectos con esos criterios."}</p>}
            </div>
          </div>
        </section>

        {testimonials.length > 0 && <section className="section testimonial">
          <div className="container quote-wrap">
            <div className="quote-mark">“</div>
            <blockquote>{testimonials[0].contenido}</blockquote>
            <div className="quote-author">
              <span>{testimonials[0].iniciales}</span>
              <p>
                <b>{testimonials[0].autor}</b>
                <br />
                {testimonials[0].cargo}
              </p>
            </div>
            <div className="quote-result">
              <strong>{testimonials[0].resultado}</strong>
              <span>
                {testimonials[0].resultado_descripcion}
                <br />
                {testimonials[0].resultado_periodo}
              </span>
            </div>
          </div>
        </section>}

        <section className="section review-wall" id="resenas">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Opiniones de clientes</span>
                <h2>Reseñas y valoraciones reales.</h2>
              </div>
              <p>Comentarios publicados después de su revisión. Cada calificación corresponde a una experiencia compartida por un cliente.</p>
            </div>
            {reviews.length > 0 ? (
              <div className="review-wall-grid">
                {reviews.map((review) => (
                  <article className="review-wall-card" key={review.id}>
                    <span className="review-wall-stars" aria-label={`${review.calificacion} de 5 estrellas`}>
                      {"★".repeat(review.calificacion)}{"☆".repeat(5 - review.calificacion)}
                    </span>
                    <h3>{review.titulo || review.service?.nombre || "Reseña de cliente"}</h3>
                    <p>{review.comentario}</p>
                    <footer>
                      <b>{review.nombre}</b>
                      {review.service?.nombre && <span>{review.service.nombre}</span>}
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="review-wall-empty">
                <p>Aún no hay reseñas aprobadas para mostrar. Si ya trabajaste con nosotros, puedes dejar tu valoración desde la página del servicio.</p>
                <a className="button button-secondary" href="#servicios">Ver servicios</a>
              </div>
            )}
          </div>
        </section>

        <section className="section agenda-section" id="agenda">
          <div className="container agenda-grid">
            <div>
              <span className="kicker">Conversemos</span>
              <h2>30 minutos pueden cambiar el rumbo de tu negocio.</h2>
              <p>
                Elige el momento que mejor te acomode. Revisaremos tu idea y te daremos una
                recomendación clara, sin compromiso.
              </p>
              <TrustLine />
            </div>

            <AgendaScheduler />
          </div>
        </section>

        <section className="section faq">
          <div className="container faq-grid">
            <div>
              <span className="kicker">Preguntas frecuentes</span>
              <h2>Lo que necesitas saber antes de empezar.</h2>
              <p>¿Tienes otra pregunta? Escríbenos y te respondemos personalmente.</p>
              <a href="#contacto">
                Hablar con un asesor <Icon name="arrow" size={17} />
              </a>
            </div>

            <div>
              {faqs.map((item, index) => (
                <div className={`faq-item ${faq === index ? "open" : ""}`} key={item[0]}>
                  <button onClick={() => setFaq(faq === index ? null : index)}>
                    <span>{item[0]}</span>
                    <b>{faq === index ? "−" : "+"}</b>
                  </button>
                  {faq === index && <p>{item[1]}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="container contact-grid">
            <div>
              <span className="kicker kicker-light">Empecemos</span>
              <h2>Tu próximo cliente ya está en internet.</h2>
              <p>Cuéntanos qué tienes en mente. Revisaremos el alcance y te contactaremos para conversar sobre los siguientes pasos.</p>

              <div className="contact-points">
                {siteSettings.contact.whatsapp_phone && (
                  <span><b>WhatsApp</b><a href={`https://wa.me/${siteSettings.contact.whatsapp_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{siteSettings.contact.whatsapp_phone}</a></span>
                )}
                <span><b>Correo</b>hola@digitalpyme.pe</span>
                <span><b>{siteSettings.coverage.digital_mode === "virtual" ? "Modalidad" : "Estamos en"}</b>
                  {siteSettings.coverage.digital_mode === "virtual" ? "Atención virtual en todo el Perú" : "Lima, Perú · Trabajamos en todo el país"}
                </span>
              </div>
            </div>

            <ContactForm services={services} />
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-grid">
          <Brand light />
          <p>Soluciones digitales simples para negocios que quieren crecer.</p>
          <div>
            <a href="#servicios">Servicios</a>
            <a href="/tienda" onClick={(event) => { event.preventDefault(); navigateToPath("/tienda"); }}>Tienda</a>
            <a href="#proyectos">Proyectos</a>
            <a href="#agenda">Agendar llamada</a>
            <button type="button" onClick={() => setLegalOpen("warranty")}>Garantía</button>
            <button type="button" onClick={() => setLegalOpen("terms")}>Términos</button>
            {siteSettings.legal.privacy_published && siteSettings.legal.privacy?.trim() && <button type="button" onClick={() => setLegalOpen("privacy")}>Privacidad</button>}
          </div>
          <span>© 2025 DigitalPyme. Hecho en Perú.</span>
        </div>
      </footer>

      {siteSettings.contact.whatsapp_phone && (
        <a className="whatsapp-float" href={`https://wa.me/${siteSettings.contact.whatsapp_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp">
          <Icon name="whatsapp" size={25} />
          <span>¿Conversamos?</span>
        </a>
      )}
      {quoteOpen && (
        <QuoteBuilder
          services={services}
          initialServices={quoteInitialServices}
          onClose={() => setQuoteOpen(false)}
        />
      )}
      {legalOpen && <LegalDialog kind={legalOpen} settings={siteSettings} onClose={() => setLegalOpen(null)} />}
    </div>
  );
}

export default App;
