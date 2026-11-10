import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import AdminPortal from "./AdminPortal";
import ClientStoreOrders from "./ClientStoreOrders";
import PhysicalStore from "./PhysicalStore";
import PasswordResetPage from "./PasswordResetPage";
import ServiceCart, { addServicesToCart, serviceImage } from "./ServiceCart";
import {
  getCoverage,
  getPortfolioProjects,
  getServiceBySlug,
  getServiceCategories,
  getServiceReviews,
  refreshServiceReviews,
  getServices,
  getTestimonials,
  getAgendaSlots,
  reserveAgendaSlot,
  approveProjectMilestone,
  adminLogin,
  changeClientPassword,
  clientLogin,
  clientLogout,
  downloadClientPaymentReceipt,
  downloadProjectFile,
  getClientPaymentOptions,
  getClientProject,
  getClientProjects,
  getPublicSiteSettings,
  registerClient,
  requestQuoteVerificationCode,
  submitServiceReview,
  startBankTransfer,
  submitLead,
  submitProposal,
  verifyQuoteEmailCode,
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
  type QuotePaymentPreference,
  type SolicitudResponse,
  type SiteSettings,
  type ServiceCategory,
  type ServiceReview,
  type CoverageResult,
  defaultSiteSettings,
  SESSION_EXPIRED_EVENT,
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

const serviceProposalGuidance: Record<string, { description: string; details: string[] }> = {
  "paginas-web": {
    description: "La estructura y las funciones del sitio se ajustan a lo que necesita comunicar tu negocio y a las acciones que quieres que realicen tus visitantes.",
    details: [
      "Objetivo del sitio y páginas o secciones necesarias.",
      "Textos, fotografías y elementos de identidad disponibles.",
      "Formularios, integraciones u otras funciones que quieras evaluar.",
      "Necesidades de dominio, alojamiento o migración, si aplican.",
    ],
  },
  "tiendas-en-linea": {
    description: "La propuesta considera el recorrido de compra y la forma en que tu negocio administra productos y pedidos.",
    details: [
      "Cantidad aproximada de productos y variantes.",
      "Métodos de pago y opciones de envío que deseas ofrecer.",
      "Cómo se recibirán y gestionarán los pedidos.",
      "Integraciones o carga inicial de productos que quieras evaluar.",
    ],
  },
  branding: {
    description: "La identidad visual se plantea según la personalidad de tu marca, las personas a quienes se dirige y los usos que tendrá.",
    details: [
      "Público al que se dirige la marca y qué deseas comunicar.",
      "Logotipo, materiales o elementos visuales que ya utilizas.",
      "Referencias visuales y preferencias que quieras compartir.",
      "Formatos y aplicaciones de marca que necesitas.",
    ],
  },
  "marketing-digital": {
    description: "El plan se organiza en función de tus objetivos y los canales digitales que tengan sentido para tu negocio.",
    details: [
      "Objetivos principales y productos o servicios a promover.",
      "Público al que quieres llegar.",
      "Canales digitales que utilizas o deseas explorar.",
      "Frecuencia, entregables y criterios de seguimiento por definir.",
    ],
  },
  mantenimiento: {
    description: "El alcance se define según la plataforma de tu sitio, su estado actual y la frecuencia de revisión que necesitas.",
    details: [
      "Plataforma y proveedor de alojamiento de tu sitio.",
      "Problemas actuales o tareas técnicas que quieres atender.",
      "Frecuencia de actualizaciones y revisiones deseada.",
      "Tareas de respaldo o monitoreo que quieras incluir en la propuesta.",
    ],
  },
};

const defaultServiceProposalGuidance = {
  description: "Cada propuesta se adapta al objetivo de tu negocio y al alcance que acordemos antes de comenzar.",
  details: [
    "Qué objetivo quieres alcanzar con este servicio.",
    "Qué materiales o información ya tienes disponibles.",
    "Qué funciones o entregables son prioritarios para ti.",
    "Cualquier requisito o fecha importante que debamos considerar.",
  ],
};

const faqs = [
  ["¿Cuánto cuesta trabajar con DigitalPyme?", "El costo depende del servicio, el alcance y los entregables que necesite tu negocio. Revisamos tu idea y te enviamos una propuesta con el alcance, el precio y los plazos antes de empezar."],
  ["¿Atienden empresas fuera de Lima?", "Sí, podemos conversar sobre proyectos desde otras ciudades y coordinar la atención de forma virtual. La modalidad para cada servicio se confirma en la propuesta."],
  ["¿Qué servicios ofrece DigitalPyme?", "Ofrecemos diseño y desarrollo de páginas web, tiendas en línea, branding, marketing digital y mantenimiento. Puedes revisar el catálogo y solicitar una propuesta según tus objetivos."],
  ["¿Cuánto cuesta una página web?", "No hay un precio único: depende de las páginas, funcionalidades, contenido e integraciones que necesites. Cuéntanos qué tienes en mente para preparar una cotización a medida."],
  ["¿Qué diferencia a DigitalPyme de otras agencias?", "Trabajamos con un alcance y próximos pasos claros. Si tu proyecto usa el portal de clientes, podrás revisar allí sus avances, entregas, documentos y pagos."],
  ["¿Seré dueño de mi página web?", "La propiedad, las cuentas y los archivos que se entregan se especifican en la propuesta del proyecto. Revisamos esos detalles contigo antes de iniciar."],
  ["¿Cómo puedo empezar mi proyecto con DigitalPyme?", "Solicita una cotización o agenda una conversación. Cuéntanos sobre tu negocio, qué quieres resolver y qué servicios te interesan; revisaremos contigo los siguientes pasos."],
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

        <nav id="primary-navigation" aria-label="Navegación principal" className={open ? "nav-links nav-open" : "nav-links"}>
          <a href="/#servicios" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#servicios"); }}>Servicios</a>
          <a href="/precios" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/precios"); }}>Precios</a>
          <a href="/catalogo-servicios" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/catalogo-servicios"); }}>Catálogo de servicios</a>
          <a href="/#proyectos" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#proyectos"); }}>Proyectos</a>
          <a href="/#proceso" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#proceso"); }}>Cómo trabajamos</a>
          <a href="/#contacto" onClick={(event) => { event.preventDefault(); setOpen(false); onNavigate("/#contacto"); }}>Contacto</a>
          <a href="#portal" className="button portal-link" onClick={(event) => { event.preventDefault(); setOpen(false); onPortal(); }}><Icon name="user" size={17} /> Ingresar</a>
          <a href="#contacto" className="button" onClick={(event) => { event.preventDefault(); setOpen(false); onQuote(); }}>Solicita tu cotización</a>
        </nav>

        <button
          className="menu-button"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
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
  initialMessage,
  privacyPublished,
  onClose,
  onOpenLegal,
}: {
  services: ApiService[];
  initialServices: string[];
  initialMessage: string;
  privacyPublished: boolean;
  onClose: () => void;
  onOpenLegal: (kind: "privacy" | "warranty" | "terms" | "returns") => void;
}) {
  const [savedServices] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("digitalpyme.cart") ?? "[]");
      return Array.isArray(saved) ? saved.filter((name): name is string => typeof name === "string") : [];
    } catch {
      return [];
    }
  });
  const isServiceCartRequest = initialMessage === "Servicios seleccionados desde el carrito";
  const requestedServices = [...new Set(isServiceCartRequest ? initialServices : [...savedServices, ...initialServices])];
  const initialType = requestedServices.some((name) => /tienda/i.test(name))
    ? "store"
    : /landing/i.test(initialMessage)
      ? "landing"
      : "website";
  const requestedPlan = initialMessage.match(/plan\s+(Profesional|Empresarial|Corporativo)/i)?.[1];
  const [typeId, setTypeId] = useState(initialType);
  const [selectedPlanName, setSelectedPlanName] = useState(requestedPlan ?? "Empresarial");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [step, setStep] = useState(isServiceCartRequest ? 3 : 0);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pais, setPais] = useState("Perú|+51");
  const [mensaje, setMensaje] = useState("");
  const [metodoPagoPreferido, setMetodoPagoPreferido] = useState<QuotePaymentChoice>("undecided");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [website, setWebsite] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [respuesta, setRespuesta] = useState<SolicitudResponse | null>(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
  const selectedType = quoteTypes.find((type) => type.id === typeId) ?? quoteTypes[0];
  const planCategory = pricingCategories.find((category) => category.title === selectedType.pricingCategory);
  const selectedPlan = isServiceCartRequest ? null : planCategory?.plans.find((plan) => plan.name === selectedPlanName) ?? planCategory?.plans[1] ?? null;
  const chosenModules = isServiceCartRequest ? [] : quoteModules.filter((module) => selectedModules.includes(module.id));
  const estimatedTotal = (selectedPlan?.price ?? 0) + chosenModules.reduce((total, module) => total + (module.price ?? 0), 0);
  const hasUnpricedModules = chosenModules.some((module) => module.price === null);
  const hasPublishedPrice = selectedPlan !== null || chosenModules.some((module) => module.price !== null);
  const annualRenewal = selectedPlan?.renewal ?? null;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setTimeout(() => setResendCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const toggleModule = (id: string) => {
    setSelectedModules((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < 3) {
      setError("");
      setStep((current) => Math.min(current + 1, 3));
      return;
    }
    if (!email.trim() && !telefono.trim()) {
      setError("Ingresa tu correo o WhatsApp para que podamos contactarte.");
      return;
    }
    if (!verificationToken) {
      setError("Verifica tu correo con el código de seis dígitos antes de enviar la solicitud.");
      return;
    }

    setEstado("enviando");
    setError("");

    try {
      const serviceNames = [...new Set(requestedServices.length ? requestedServices : [selectedType.service])];
      const unavailableServices = serviceNames.filter((name) => !services.some((service) => service.nombre === name));
      if (unavailableServices.length > 0) {
        setError(`No encontramos estos servicios en el catálogo actual: ${unavailableServices.join(", ")}. Actualiza la página e inténtalo nuevamente.`);
        setEstado("error");
        return;
      }
      const moduleSummary = chosenModules.length
        ? chosenModules.map((module) => `- ${module.name}${module.price === null ? " (a cotizar)" : module.price === 0 ? " (incluido)" : ` (S/ ${formatCurrency(module.price)})`}`).join("\n")
        : "- Sin módulos adicionales";
      const details = [
        `Tipo de proyecto: ${isServiceCartRequest ? "Servicios seleccionados" : selectedType.name}`,
        `Plan: ${isServiceCartRequest ? "Cotización a medida" : selectedPlan?.name ?? "Personalizado"}`,
        `Precio publicado del plan: ${selectedPlan ? `S/ ${formatCurrency(selectedPlan.price)}` : "A cotizar"}`,
        selectedPlan ? `Renovación anual referencial: S/ ${formatCurrency(selectedPlan.renewal)}` : "",
        `Módulos adicionales:\n${moduleSummary}`,
        isServiceCartRequest || !hasPublishedPrice ? "Inversión: a cotizar según el alcance." : `Inversión referencial: S/ ${formatCurrency(estimatedTotal)}${hasUnpricedModules ? " más los módulos a cotizar" : ""}.`,
        `Método de pago preferido (referencial): ${quotePaymentOptions.find((option) => option.value === metodoPagoPreferido)?.label ?? "Aún no lo sé"}.`,
        mensaje.trim() ? `Detalles del proyecto: ${mensaje.trim()}` : "",
        initialMessage.trim() ? `Referencia de la página: ${initialMessage.trim()}` : "",
      ].filter(Boolean).join("\n\n");
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
        metodo_pago_preferido: quotePaymentOptions.find((option) => option.value === metodoPagoPreferido)?.apiPreference ?? "undecided",
        mensaje: details,
      });
      setRespuesta(result);
      setEstado("ok");
      localStorage.removeItem("digitalpyme.cart");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar la propuesta.");
      setEstado("error");
    }
  };

  const validateRegistration = (): boolean => {
    if (!nombre.trim() || !apellido.trim() || !empresa.trim() || !email.trim() || !telefono.trim()) {
      setError("Completa todos los campos obligatorios del registro comercial.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return false;
    }
    const digits = telefono.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      setError("Revisa el número de WhatsApp e incluye el código de país correcto.");
      return false;
    }
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setError("Debes aceptar los términos y autorizar el uso de tus datos para continuar.");
      return false;
    }
    return true;
  };

  const sendVerificationCode = async () => {
    setError("");
    setVerificationStatus("");
    if (!validateRegistration()) return;

    setSendingCode(true);
    try {
      const result = await requestQuoteVerificationCode({ email: email.trim(), website });
      setCodeSent(true);
      setVerificationToken("");
      setVerificationCode("");
      setResendCountdown(60);
      setVerificationStatus(result.mensaje);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo enviar el código de verificación.");
    } finally {
      setSendingCode(false);
    }
  };

  const verifyEmailCode = async () => {
    setError("");
    setVerificationStatus("");
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Ingresa el código de seis dígitos que enviamos a tu correo.");
      return;
    }

    setVerifyingCode(true);
    try {
      const result = await verifyQuoteEmailCode({ email: email.trim(), code: verificationCode, website });
      if (!result.verification_token) {
        throw new Error("No se recibió la confirmación de seguridad. Solicita un nuevo código.");
      }
      setVerificationToken(result.verification_token);
      setVerificationStatus(result.mensaje);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "No se pudo verificar el código.");
    } finally {
      setVerifyingCode(false);
    }
  };

  return (
    <div className="quote-configurator-backdrop">
      <section className="quote-configurator" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <header className="quote-configurator-header">
          <div>
            <span className="kicker">{isServiceCartRequest ? "Checkout de servicios" : "Cotizador digital"}</span>
            <h2 id="quote-title">{isServiceCartRequest ? "Finaliza tu solicitud" : "Configura tu proyecto"}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Cerrar cotizador" onClick={onClose}><Icon name="x" /></button>
        </header>

        {estado === "ok" ? (
          <div className="quote-success quote-configurator-success">
            <ol className="quote-wizard-steps" aria-label="Pasos de cotización">
              {(isServiceCartRequest ? ["Carrito", "Checkout"] : ["Tipo", "Plan", "Módulos", "Envío"]).map((label, index) => <li key={label} className="complete"><span>{index + 1}</span>{label}</li>)}
            </ol>
            <span><Icon name="check" size={32} /></span>
            <h2>¡Recibimos tu solicitud!</h2>
            <p>Revisaremos el alcance de tu proyecto y te contactaremos para enviarte una propuesta. Método elegido: <strong>{quotePaymentOptions.find((option) => option.value === metodoPagoPreferido)?.label ?? "Aún no lo sé"}</strong>.{respuesta && !respuesta.email_enviado ? " El aviso por correo no pudo enviarse." : ""}</p>
            {(metodoPagoPreferido === "yape" || metodoPagoPreferido === "bank_transfer") && (
              <section className="quote-payment-confirmation" aria-label="Instrucciones de pago">
                <div className="quote-payment-confirmation-total">
                  <span>{hasPublishedPrice ? "Monto estimado" : "Monto"}</span>
                  <strong>{respuesta?.inversion_estimada != null
                    ? `S/ ${formatCurrency(Number(respuesta.inversion_estimada))}`
                    : hasPublishedPrice
                      ? `S/ ${formatCurrency(estimatedTotal)}${hasUnpricedModules ? " + módulos a cotizar" : ""}`
                      : "A cotizar"}</strong>
                  <small>El importe final se confirmará en la propuesta.</small>
                </div>
                {metodoPagoPreferido === "yape" ? (
                  <div className="quote-payment-confirmation-details">
                    <h3>Paga con Yape</h3>
                    <img src="/images/yape-qr.png" alt="Código QR de pago de DigitalPyme por Yape" />
                    <p>Titular: <strong>Juan Joseph Yacila Mogollon</strong></p>
                    <p>Escanea el QR desde Yape e ingresa el monto indicado.</p>
                  </div>
                ) : (
                  <div className="quote-payment-confirmation-details">
                    <h3>Transfiere por BCP</h3>
                    <p>Titular: <strong>Juan Joseph Yacila Mogollon</strong></p>
                    <p>Cuenta: <strong>4557881878532185</strong></p>
                    <p>CCI: <strong>00257511695581204198</strong></p>
                    <p>Transfiere el monto indicado y conserva tu constancia.</p>
                  </div>
                )}
                <label className="quote-payment-receipt">
                  Adjunta tu constancia (PDF, JPG o PNG; máximo 10 MB)
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        setPaymentReceiptFile(null);
                        event.currentTarget.value = "";
                        setError("La constancia no puede superar los 10 MB.");
                        return;
                      }
                      setError("");
                      setPaymentReceiptFile(file);
                    }}
                  />
                </label>
                {error && <p className="form-status error" role="alert">{error}</p>}
                {paymentReceiptFile && <p className="quote-payment-receipt-name">Archivo seleccionado: {paymentReceiptFile.name}</p>}
                <p className="quote-payment-confirmation-note">El archivo queda seleccionado en esta pantalla, pero todavía no se envía al sistema para verificación. No cierres esta ventana si necesitas conservar la selección.</p>
              </section>
            )}
            {respuesta?.whatsapp_url && <a className="button" href={respuesta.whatsapp_url} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={17} /> Continuar por WhatsApp</a>}
          </div>
        ) : (
          <>
            <ol className="quote-wizard-steps" aria-label="Pasos de cotización">
              {(isServiceCartRequest ? ["Carrito", "Checkout"] : ["Tipo", "Plan", "Módulos", "Envío"]).map((label, index) => (
                <li key={label} className={isServiceCartRequest ? (index === 0 ? "complete" : "active") : step === index ? "active" : step > index ? "complete" : ""}>
                  <span>{index + 1}</span>{label}
                </li>
              ))}
            </ol>
            {isServiceCartRequest && (
              <p className="quote-request-status" role="status">
                Tu pedido se está cotizando. Completa el registro y verifica tu correo para formalizar la solicitud; no se realizará ningún cobro todavía.
              </p>
            )}
            <div className={`quote-wizard-layout${isServiceCartRequest ? " quote-checkout-layout" : ""}`}>
              <form className="quote-wizard-main" onSubmit={(event) => void enviar(event)}>
                {step === 0 && (
                  <section>
                    <h3>¿Qué tipo de web necesitas?</h3>
                    <p className="quote-step-intro">Elige el tipo de proyecto que mejor se ajuste a tu objetivo.</p>
                    <div className="quote-type-grid">
                      {quoteTypes.map((type) => (
                        <button key={type.id} type="button" className={typeId === type.id ? "selected" : ""} aria-pressed={typeId === type.id} onClick={() => { setTypeId(type.id); setSelectedPlanName("Empresarial"); }}>
                          <span className="quote-type-icon" aria-hidden="true">{type.icon}</span>
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
                    <p className="quote-step-intro">Compara las opciones. El alcance definitivo se confirma en la propuesta.</p>
                    {planCategory ? (
                      <div className="quote-plan-grid">
                        {planCategory.plans.map((plan) => (
                          <button key={plan.name} type="button" className={selectedPlanName === plan.name ? "selected" : ""} aria-pressed={selectedPlanName === plan.name} onClick={() => setSelectedPlanName(plan.name)}>
                            <span className="quote-plan-audience">{plan.audience}</span>
                            <strong>{plan.name}</strong>
                            <b>S/ {formatCurrency(plan.price)}</b>
                            <span>{plan.pages} · {plan.sections}</span>
                            <small>{plan.extras.slice(0, 4).join(" · ")}</small>
                            <span className="quote-plan-time">Entrega estimada: {plan.delivery}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="quote-custom-plan">
                        <span className="kicker">A medida</span>
                        <h4>Catálogo online</h4>
                        <p>Definiremos contigo el número de productos y las funciones para mostrar tu catálogo. El precio se confirma en la propuesta.</p>
                        <strong>Cotización personalizada</strong>
                      </div>
                    )}
                  </section>
                )}

                {step === 2 && (
                  <section>
                    <h3>Selecciona módulos adicionales</h3>
                    <p className="quote-step-intro">Marca las funciones que te interesan. Las opciones por cotizar se detallarán en la propuesta.</p>
                    <div className="quote-module-grid">
                      {quoteModules.map((module) => {
                        const checked = selectedModules.includes(module.id);
                        return (
                          <label key={module.id} className={checked ? "selected" : ""}>
                            <input type="checkbox" checked={checked} onChange={() => toggleModule(module.id)} />
                            <span>
                              <strong>{module.name}</strong>
                              <small>{module.description}</small>
                            </span>
                            <b>{module.price === null ? "A cotizar" : module.price === 0 ? "Incluido" : `S/ ${formatCurrency(module.price)}`}</b>
                          </label>
                        );
                      })}
                    </div>
                    <p className="quote-included-note">El hosting, dominio, correos y SSL se incluyen o cotizan según el plan y sus condiciones de renovación.</p>
                  </section>
                )}

                {step === 3 && (
                  <section>
                    <h3>{isServiceCartRequest ? "Información de contacto" : "Registro comercial para formalizar tu cotización"}</h3>
                    <p className="quote-step-intro">{isServiceCartRequest ? "Completa tus datos para que podamos preparar y enviarte la cotización." : "Completa tus datos de contacto y verifica tu correo. Tu solicitud no se enviará hasta completar este paso."}</p>
                    <div className="quote-contact-grid">
                      <label><span>Nombre *</span><input required maxLength={120} value={nombre} onChange={(event) => setNombre(event.target.value)} autoComplete="given-name" /></label>
                      <label><span>Apellido *</span><input required maxLength={120} value={apellido} onChange={(event) => setApellido(event.target.value)} autoComplete="family-name" /></label>
                      <label><span>País *</span><select value={pais} onChange={(event) => setPais(event.target.value)}>{quoteCountries.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}</select></label>
                      <label><span>WhatsApp *</span><span className="quote-phone-field"><span>{pais.split("|")[1]}</span><input required type="tel" inputMode="tel" maxLength={20} value={telefono} onChange={(event) => setTelefono(event.target.value)} autoComplete="tel-national" /></span></label>
                      <label><span>Correo electrónico *</span><input required type="email" maxLength={255} value={email} onChange={(event) => { setEmail(event.target.value); setCodeSent(false); setVerificationToken(""); setVerificationCode(""); setVerificationStatus(""); setResendCountdown(0); }} autoComplete="email" /></label>
                      <label><span>Nombre de tu empresa *</span><input required maxLength={255} value={empresa} onChange={(event) => setEmpresa(event.target.value)} autoComplete="organization" /></label>
                      <label className="quote-contact-message"><span>Cuéntanos brevemente sobre tu proyecto (opcional)</span><textarea maxLength={500} value={mensaje} onChange={(event) => setMensaje(event.target.value)} /></label>
                    </div>
                    <fieldset className={`quote-payment-preference${isServiceCartRequest ? " quote-checkout-payment" : ""}`}>
                      <legend>¿Cómo deseas pagar?</legend>
                      <p>Al enviar la solicitud verás los datos del método elegido y el monto estimado de tu cotización.</p>
                      <div>
                        {quotePaymentOptions.filter((option) => ["bank_transfer", "yape", "undecided"].includes(option.value)).map((option) => (
                          <label key={option.value} className={metodoPagoPreferido === option.value ? "selected" : ""}>
                            <input
                              type="radio"
                              name="metodo-pago-preferido"
                              value={option.value}
                              checked={metodoPagoPreferido === option.value}
                              onChange={() => setMetodoPagoPreferido(option.value)}
                            />
                            <QuotePaymentIcon method={option.icon} />
                            <span><strong>{option.label}</strong><small>{option.description}</small></span>
                          </label>
                        ))}
                      </div>
                      <p className="quote-payment-disclaimer">El monto es estimado y puede cambiar al revisar el alcance. No compartas claves, PIN ni códigos bancarios.</p>
                    </fieldset>
                    <div className="quote-consents">
                      <label><input type="checkbox" checked={aceptaTerminos} onChange={(event) => setAceptaTerminos(event.target.checked)} /><span>Acepto los términos de contratación para solicitar esta cotización. * <button type="button" onClick={() => onOpenLegal("terms")}>Leer términos</button></span></label>
                      <label><input type="checkbox" checked={aceptaPrivacidad} onChange={(event) => setAceptaPrivacidad(event.target.checked)} /><span>Autorizo el uso de mis datos personales para gestionar esta solicitud y contactarme por los medios indicados. *{privacyPublished && <> <button type="button" onClick={() => onOpenLegal("privacy")}>Leer aviso de privacidad</button></>}</span></label>
                    </div>
                    <p className="quote-contact-hint">El código se enviará al correo electrónico. El WhatsApp es obligatorio para el contacto, pero no se verifica por SMS en esta versión.</p>
                    <div className="quote-email-verification">
                      <div>
                        <strong>Verificación de seguridad por correo</strong>
                        <small>Enviaremos un código de seis dígitos a {email.trim() || "tu correo electrónico"}. El código vence en 10 minutos.</small>
                      </div>
                      <button className="button button-secondary" type="button" disabled={sendingCode || verifyingCode || resendCountdown > 0 || Boolean(verificationToken)} onClick={() => void sendVerificationCode()}>
                        {sendingCode ? "Enviando código..." : verificationToken ? "Correo verificado" : resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : codeSent ? "Reenviar código" : "Enviar código"}
                      </button>
                      {codeSent && !verificationToken && (
                        <div className="quote-verify-code">
                          <label><span>Código de verificación</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label>
                          <button className="button" type="button" disabled={verifyingCode || verificationCode.length !== 6} onClick={() => void verifyEmailCode()}>{verifyingCode ? "Verificando..." : "Validar código"}</button>
                        </div>
                      )}
                      {verificationStatus && <p className={verificationToken ? "quote-verification-success" : "quote-verification-status"} role="status">{verificationStatus}</p>}
                    </div>
                    <label className="quote-honeypot" aria-hidden="true">Deja este campo vacío<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
                  </section>
                )}

                {error && <p className="form-status error">{error}</p>}
                <div className="quote-wizard-actions">
                  {step > 0 && !isServiceCartRequest && <button className="button button-secondary" type="button" onClick={() => { setError(""); setStep((current) => current - 1); }}>Anterior</button>}
                  <button className="button" type="submit" disabled={estado === "enviando" || (step === 3 && !verificationToken)}>
                    {step < 3 ? "Siguiente" : estado === "enviando" ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </form>

              <aside className={`quote-summary${isServiceCartRequest ? " quote-checkout-summary" : ""}`}>
                <h3>{isServiceCartRequest ? "Resumen de solicitud" : "Tu inversión estimada"}</h3>
                <div className="quote-summary-price">
                  {hasPublishedPrice ? <>S/ {formatCurrency(estimatedTotal)}{hasUnpricedModules && <small> más módulos a cotizar</small>}</> : "A cotizar"}
                </div>
                {selectedPlan && <p className="quote-summary-delivery">Entrega estimada en {selectedPlan.delivery}</p>}
                {annualRenewal !== null && <p className="quote-summary-renewal">Renovación anual referencial: S/ {formatCurrency(annualRenewal)}</p>}
                <div className="quote-summary-section">
                  <strong>{isServiceCartRequest ? "Servicios seleccionados" : "Resumen del proyecto"}</strong>
                  {isServiceCartRequest
                    ? requestedServices.map((name) => {
                      const service = services.find((item) => item.nombre === name);
                      return (
                        <div className="quote-checkout-item" key={name}>
                          <img src={service ? serviceImage(service) : "/images/services/servicio-digital.jpg"} alt="" />
                          <span><b>{name}</b><small>{service?.category?.nombre ?? service?.categoria ?? "Servicio digital"}</small></span>
                          <small>{service ? formatServiceMeta(service) : "A cotizar"}</small>
                        </div>
                      );
                    })
                    : <>
                      <p>{selectedType.name}: {selectedPlan?.name ?? "Plan personalizado"}</p>
                      {selectedPlan && <small>{selectedPlan.pages} / {selectedPlan.sections}</small>}
                      {requestedServices.filter((name) => name !== selectedType.service).map((name) => <small key={name}>{name}</small>)}
                    </>}
                </div>
                {!isServiceCartRequest && <div className="quote-summary-section">
                  <strong>Módulos</strong>
                  {chosenModules.length > 0
                    ? chosenModules.map((module) => <small key={module.id}>{module.name}{module.price === null ? " · a cotizar" : module.price === 0 ? " · incluido" : ` · S/ ${formatCurrency(module.price)}`}</small>)
                    : <small>No seleccionaste módulos adicionales.</small>}
                </div>}
                <p className="quote-summary-disclaimer">{isServiceCartRequest ? "La solicitud no genera cobros. Revisaremos los servicios y te enviaremos una cotización formal para que puedas aprobarla antes de pagar." : "Precios referenciales en soles, sin IGV. El precio final y los plazos se confirman en la propuesta. No se realizará ningún cobro desde este formulario."}</p>
              </aside>
            </div>
          </>
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
  const [detail, setDetail] = useState<(ApiService & { proyectos_relacionados?: ApiPortfolioProject[] }) | null>(service ?? null);

  useEffect(() => {
    let active = true;
    setDetail(service ?? null);
    void getServiceBySlug(slug).then((result) => {
      if (!active || !result) return;
      setDetail(result);
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

  if (!detail) {
    return <main className="service-detail container"><p>Servicio no encontrado.</p><a className="button" href="/">Volver al inicio</a></main>;
  }

  const relatedProjects = detail.proyectos_relacionados?.length
    ? detail.proyectos_relacionados
    : projects.filter((project) => project.related_service_id === detail.id);
  const proposalGuidance = serviceProposalGuidance[serviceSlug(detail)] ?? defaultServiceProposalGuidance;

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
      </div>
      <button className="button" type="button" onClick={() => onQuote(detail.nombre)}>Añadir a mi proyecto</button>

      {detail.incluye?.length ? <section><h2>Qué incluye</h2><ul className="service-includes">{detail.incluye.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      <section className="service-detail-guidance">
        <h2>Más información del servicio</h2>
        <p>{proposalGuidance.description}</p>
        <div className="service-guidance-grid">
          <article>
            <h3>Para preparar tu propuesta</h3>
            <ul>{proposalGuidance.details.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <h3>Cómo avanzamos</h3>
            <ol>
              <li>Conversamos sobre tu negocio y lo que necesitas.</li>
              <li>Definimos el alcance, los entregables y el precio en una propuesta.</li>
              <li>Con tu aprobación, coordinamos el inicio y las revisiones del proyecto.</li>
            </ol>
          </article>
        </div>
      </section>
      {/tienda|e-commerce|ecommerce/i.test(detail.nombre) && <section className="store-detail-coverage"><h2>Envío y cobertura</h2><StoreCoverage /></section>}
      {relatedProjects.length > 0 && (
        <section><h2>Proyectos relacionados</h2><div className="related-projects">
          {relatedProjects.map((project) => <a href="/#proyectos" key={project.id ?? project.nombre} onClick={(event) => { event.preventDefault(); onNavigate("/#proyectos"); }}>
            <img src={project.imagen} alt={project.imagen_alt || `Proyecto digital para ${project.nombre}`} loading="lazy" decoding="async" />
            <span><b>{project.nombre}</b>{project.resultado}</span>
          </a>)}
        </div></section>
      )}
    </main>
  );
}

type PortalTab = "resumen" | "proyecto" | "pagos" | "archivos" | "pedidos" | "cuenta";
type CheckoutDemoMethod = "card" | "paypal" | "yape";
type CheckoutDemoTarget = { label: string; amount: number };

function restoreClientSession(): ClientSession | null {
  try {
    localStorage.removeItem("digitalpyme.client.token");
    localStorage.removeItem("digitalpyme.client.user");
    const token = sessionStorage.getItem("digitalpyme.client.token");
    const usuario = sessionStorage.getItem("digitalpyme.client.user");
    if (!token || !usuario) return null;
    return { token, usuario: JSON.parse(usuario) as ClientSession["usuario"] };
  } catch {
    return null;
  }
}

function ClientPortal({ onClose, onAdminLogin }: { onClose: () => void; onAdminLogin: (session: ClientSession) => void }) {
  const [session, setSession] = useState<ClientSession | null>(restoreClientSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registrationName, setRegistrationName] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
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
  const [checkoutDemoTarget, setCheckoutDemoTarget] = useState<CheckoutDemoTarget | null>(null);
  const [checkoutDemoMethod, setCheckoutDemoMethod] = useState<CheckoutDemoMethod>("card");
  const [checkoutDemoNotice, setCheckoutDemoNotice] = useState("");

  useEffect(() => {
    const expireSession = () => {
      sessionStorage.removeItem("digitalpyme.client.token");
      sessionStorage.removeItem("digitalpyme.client.user");
      localStorage.removeItem("digitalpyme.client.token");
      localStorage.removeItem("digitalpyme.client.user");
      setSession(null);
      setError("Tu sesión venció. Inicia sesión nuevamente.");
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession);
  }, []);

  useEffect(() => {
    if (!session || session.usuario.must_change_password) return;
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
    if (!session || session.usuario.must_change_password || selectedProjectId === null) {
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
    sessionStorage.removeItem("digitalpyme.client.token");
    sessionStorage.removeItem("digitalpyme.client.user");
    localStorage.removeItem("digitalpyme.client.token");
    localStorage.removeItem("digitalpyme.client.user");
    onClose();
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setError("");

    try {
      let result: ClientSession;
      let isAdmin = false;
      try {
        result = await adminLogin(email, password);
        isAdmin = true;
      } catch (adminLoginError) {
        if (!(adminLoginError instanceof Error) || adminLoginError.message !== "Correo o contraseña incorrectos") {
          throw adminLoginError;
        }
        result = await clientLogin(email, password);
        sessionStorage.removeItem("digitalpyme.admin.token");
        sessionStorage.removeItem("digitalpyme.admin.user");
      }
      if (isAdmin) {
        onAdminLogin(result);
        return;
      }
      sessionStorage.setItem("digitalpyme.client.token", result.token);
      sessionStorage.setItem("digitalpyme.client.user", JSON.stringify(result.usuario));
      setSession(result);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setLoginBusy(false);
    }
  };

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await registerClient({
        nombre: registrationName.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      sessionStorage.removeItem("digitalpyme.admin.token");
      sessionStorage.removeItem("digitalpyme.admin.user");
      sessionStorage.setItem("digitalpyme.client.token", result.token);
      sessionStorage.setItem("digitalpyme.client.user", JSON.stringify(result.usuario));
      setSession(result);
      setPassword("");
      setPasswordConfirmation("");
      setNotice(result.notificacion_admin_enviada
        ? "Cuenta creada. También se notificó al administrador; tu contraseña no se comparte por correo."
        : "Cuenta creada, pero no se envió el aviso al administrador. El servidor necesita correo saliente (SMTP) configurado.");
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "No se pudo crear la cuenta.");
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

  const createTransfer = async (milestoneId?: number) => {
    if (!session || !activeProject) return;
    setError("");
    setNotice("");

    try {
      const result = await startBankTransfer(session.token, activeProject.id, milestoneId);
      setNotice(result.mensaje);
      await refreshPayments(activeProject.id);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "No se pudo registrar el pago por transferencia.");
    }
  };

  const openCheckoutDemo = (label: string, amount: number) => {
    setCheckoutDemoTarget({ label, amount });
    setCheckoutDemoMethod("card");
    setCheckoutDemoNotice("");
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

  const downloadPaymentReceipt = async (payment: ProjectPayment) => {
    if (!session || !selectedProject || payment.status !== "pagado") return;
    setDownloadingId(payment.id);
    setError("");

    try {
      const result = await downloadClientPaymentReceipt(session.token, selectedProject.id, payment.id);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "No se pudo descargar el recibo.");
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
      sessionStorage.removeItem("digitalpyme.client.token");
      sessionStorage.removeItem("digitalpyme.client.user");
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
          <form className="auth-form" onSubmit={authMode === "login" ? login : register}>
            <div className="auth-mobile-logo"><Brand /></div>
            <span className="kicker">{authMode === "login" ? "Bienvenido de nuevo" : "Únete a DigitalPyme"}</span>
            <h2>{authMode === "login" ? "Ingresar" : "Crear cuenta"}</h2>
            <p>{authMode === "login"
              ? "Ingresa con tu cuenta de cliente o administrador. Te llevaremos al panel que corresponda."
              : "Regístrate como cliente para acceder a tu portal. El administrador recibirá tu nombre y correo, nunca tu contraseña."}</p>
            {notice && <p className="form-status success">{notice}</p>}
            {authMode === "register" && (
              <label>
                Nombre completo
                <input type="text" autoComplete="name" maxLength={255} required value={registrationName} onChange={(event) => setRegistrationName(event.target.value)} />
              </label>
            )}
            <label>
              Correo electrónico
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Contraseña
              <span className="password-field">
                <input type={showPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={authMode === "register" ? 12 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} />
                <button type="button" className="password-visibility-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />{showPassword && <path d="m4 4 16 16" />}</svg>
                </button>
              </span>
            </label>
            {authMode === "register" && (
              <label>
                Confirmar contraseña
                <span className="password-field">
                  <input type={showPasswordConfirmation ? "text" : "password"} autoComplete="new-password" minLength={12} required value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} />
                  <button type="button" className="password-visibility-toggle" aria-label={showPasswordConfirmation ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"} aria-pressed={showPasswordConfirmation} onClick={() => setShowPasswordConfirmation((visible) => !visible)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />{showPasswordConfirmation && <path d="m4 4 16 16" />}</svg>
                  </button>
                </span>
              </label>
            )}
            {error && <p className="form-status error">{error}</p>}
            <button className="button" type="submit" disabled={loginBusy}>
              {loginBusy ? (authMode === "login" ? "Ingresando..." : "Creando cuenta...") : (authMode === "login" ? "Ingresar" : "Registrarme")}
            </button>
            <button className="auth-mode-toggle" type="button" onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setShowPassword(false);
              setShowPasswordConfirmation(false);
              setError("");
              setNotice("");
            }}>
              {authMode === "login" ? "¿No tienes cuenta? Crear cuenta de cliente" : "¿Ya tienes cuenta? Ingresar"}
            </button>
            <small><Icon name="check" size={13} /> Acceso privado y seguro</small>
          </form>
        </section>
      </main>
    );
  }

  if (session.usuario.must_change_password) {
    return (
      <main className="auth-shell">
        <section className="auth-story">
          <div className="auth-story-copy">
            <span className="kicker kicker-light">Seguridad de la cuenta</span>
            <h1>Actualiza tu contraseña para continuar.</h1>
            <p>El administrador asignó una contraseña temporal. Define una nueva, personal y segura.</p>
          </div>
        </section>
        <section className="auth-form-wrap">
          <form className="auth-form" onSubmit={(event) => void updatePassword(event)}>
            <span className="kicker">Cambio obligatorio</span>
            <h2>Crea tu contraseña</h2>
            <p>Usa al menos 12 caracteres. Después del cambio, vuelve a ingresar con tu nueva contraseña.</p>
            <label>Contraseña temporal<input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
            <label>Nueva contraseña<input type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
            <label>Confirmar nueva contraseña<input type="password" autoComplete="new-password" minLength={12} required value={newPasswordConfirmation} onChange={(event) => setNewPasswordConfirmation(event.target.value)} /></label>
            {error && <p className="form-status error">{error}</p>}
            {notice && <p className="form-status success">{notice}</p>}
            <button className="button" type="submit">Actualizar y continuar</button>
            <button className="button button-secondary" type="button" onClick={() => void logout()}>Cerrar sesión</button>
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
                    <button className="button button-secondary" type="button" disabled={hasActiveFullPayment || hasActiveMilestonePayment} onClick={() => openCheckoutDemo(activeProject.cotizacion?.servicio ?? activeProject.nombre, quoteAmount)}>
                    Pasarela de pago
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
                        <button className="button button-secondary" type="button" disabled={isActive} onClick={() => openCheckoutDemo(milestone.titulo, Number(milestone.monto))}>Pasarela de pago</button>
                      </div>
                    </div>
                  );
                })}

                <p>La pasarela de tarjeta, PayPal y Yape está en modo de demostración. No se procesan cobros ni se registran pagos simulados.</p>
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
                    {payment.status === "pagado" && (
                      <button type="button" disabled={downloadingId === payment.id} onClick={() => void downloadPaymentReceipt(payment)}>
                        {downloadingId === payment.id ? "Preparando recibo..." : "Descargar recibo PDF"}
                      </button>
                    )}
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
      {checkoutDemoTarget && (
        <ProjectPaymentDemo
          target={checkoutDemoTarget}
          method={checkoutDemoMethod}
          notice={checkoutDemoNotice}
          onMethodChange={(method) => { setCheckoutDemoMethod(method); setCheckoutDemoNotice(""); }}
          onSimulate={() => setCheckoutDemoNotice("Prueba visual completada. No se realizó ningún cobro ni se registró un pago en el panel del cliente o del administrador.")}
          onClose={() => setCheckoutDemoTarget(null)}
        />
      )}
    </div>
  );
}

function ProjectPaymentDemo({
  target,
  method,
  notice,
  onMethodChange,
  onSimulate,
  onClose,
}: {
  target: CheckoutDemoTarget;
  method: CheckoutDemoMethod;
  notice: string;
  onMethodChange: (method: CheckoutDemoMethod) => void;
  onSimulate: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const methods: { id: CheckoutDemoMethod; label: string; detail: string }[] = [
    { id: "card", label: "Tarjeta de crédito o débito", detail: "Visa · Mastercard · American Express" },
    { id: "paypal", label: "PayPal", detail: "Pago mediante una futura conexión con PayPal" },
    { id: "yape", label: "Yape", detail: "Pago con Yape cuando se habilite el proveedor" },
  ];

  return (
    <div className="modal-backdrop checkout-demo-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="checkout-demo-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-demo-title">
        <header className="checkout-demo-header">
          <div><span className="kicker">Portal cliente · modo de prueba</span><h2 id="checkout-demo-title">Método de pago</h2></div>
          <button className="modal-close" type="button" aria-label="Cerrar métodos de pago" onClick={onClose}><Icon name="x" /></button>
        </header>
        <div className="checkout-demo-amount"><span>{target.label}</span><strong>S/ {formatCurrency(target.amount)}</strong></div>
        <p className="checkout-demo-warning" role="note">Esta es solo una vista de demostración. No ingreses datos reales: no hay una pasarela conectada y no se realizará ningún cobro.</p>
        <fieldset className="checkout-demo-methods">
          <legend>Elige una opción</legend>
          {methods.map((item) => (
            <label key={item.id} className={method === item.id ? "selected" : ""}>
              <input type="radio" name="checkout-demo-method" value={item.id} checked={method === item.id} onChange={() => onMethodChange(item.id)} />
              <span className={`checkout-demo-mark checkout-demo-mark-${item.id}`} aria-hidden="true">{item.id === "card" ? "▰" : item.id === "paypal" ? "P" : "Y"}</span>
              <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              {item.id === "card" && <span className="checkout-demo-card-brands">VISA · MC</span>}
            </label>
          ))}
        </fieldset>
        <div className="checkout-demo-detail" aria-live="polite">
          {method === "card" && <p>Los campos de tarjeta aparecerán únicamente al conectar una pasarela segura. Esta demo no recopila números, fechas ni códigos de seguridad.</p>}
          {method === "paypal" && <p>PayPal se podrá habilitar cuando se integre un proveedor. Por ahora esta opción solo muestra el diseño del proceso.</p>}
          {method === "yape" && <p>El pago con Yape se habilitará al integrar la solución correspondiente. No se muestra un QR real ni se registra una operación.</p>}
        </div>
        {notice && <p className="checkout-demo-result" role="status">{notice}</p>}
        <button className="button checkout-demo-submit" type="button" onClick={onSimulate}>Simular (sin cobro)</button>
        <p className="checkout-demo-legal">La solicitud y los pagos reales siguen sujetos a la cotización aceptada y a la configuración del proveedor.</p>
      </section>
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

function mergeSiteSettings(settings: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    ...defaultSiteSettings,
    ...settings,
    seo: { ...defaultSiteSettings.seo, ...settings?.seo },
    brand: { ...defaultSiteSettings.brand, ...settings?.brand },
    contact: { ...defaultSiteSettings.contact, ...settings?.contact },
    theme: { ...defaultSiteSettings.theme, ...settings?.theme },
    coverage: {
      ...defaultSiteSettings.coverage,
      ...settings?.coverage,
      shipping_zones: settings?.coverage?.shipping_zones ?? defaultSiteSettings.coverage.shipping_zones,
      shipping_methods: settings?.coverage?.shipping_methods ?? defaultSiteSettings.coverage.shipping_methods,
    },
    legal: { ...defaultSiteSettings.legal, ...settings?.legal },
  };
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
    <div className="modal-backdrop legal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
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

function PortfolioProjectDialog({ project, onClose }: {
  project: ApiPortfolioProject;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleDialogKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKeys);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const isSample = project.categoria === "Concepto de muestra";
  const deliverables = project.entregables ?? [];
  const technologies = project.tecnologias ?? [];

  return (
    <div
      className="modal-backdrop project-detail-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
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
        <button ref={closeButtonRef} className="modal-close" type="button" aria-label="Cerrar detalle del proyecto" onClick={onClose}>
          <Icon name="x" />
        </button>
        <img className="project-detail-image" src={project.imagen} alt={project.imagen_alt || `Vista de ${project.nombre}`} />
        <div className="project-detail-content">
          <div className="project-detail-eyebrow">
            <span className="project-detail-category">{project.categoria}</span>
            {isSample && <span className="project-detail-disclaimer">Concepto visual; no es un proyecto de cliente.</span>}
            {isSample && <span className="project-detail-photo-note">Fotografía ilustrativa de Unsplash.</span>}
          </div>
          <h2 id="project-detail-title">{project.nombre}</h2>
          <p id="project-detail-description" className="project-detail-summary">
            {project.descripcion_larga || project.resultado}
          </p>

          <div className="project-detail-result">
            <span>{isSample ? "Enfoque del concepto" : "Resumen del proyecto"}</span>
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
              <ul>{deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}

          {technologies.length > 0 && (
            <section className="project-detail-list">
              <h3>{isSample ? "Enfoque de diseño" : "Tecnologías y herramientas"}</h3>
              <div className="project-detail-tags">
                {technologies.map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
          )}

          <div className="project-detail-actions">
            <button className="button" type="button" onClick={onClose}>Volver al portafolio</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const demoReviewExamples = [
  {
    titulo: "Ejemplo de tienda en línea",
    comentario: "Ejemplo ficticio: “El catálogo es fácil de recorrer y ayuda a encontrar los productos con claridad.”",
    servicio: "Tienda en línea",
    calificacion: 5,
  },
  {
    titulo: "Ejemplo de página web",
    comentario: "Ejemplo ficticio: “La información del negocio queda organizada y es sencilla de consultar desde el celular.”",
    servicio: "Página web",
    calificacion: 5,
  },
  {
    titulo: "Ejemplo de identidad visual",
    comentario: "Ejemplo ficticio: “La propuesta visual comunica mejor la personalidad de la marca.”",
    servicio: "Branding",
    calificacion: 4,
  },
  {
    titulo: "Ejemplo de agenda digital",
    comentario: "Ejemplo ficticio: “El flujo de consulta permite entender los pasos para coordinar una cita.”",
    servicio: "Agenda y reservas",
    calificacion: 5,
  },
  {
    titulo: "Ejemplo de soporte web",
    comentario: "Ejemplo ficticio: “El plan de mantenimiento explica qué tareas se revisan y con qué frecuencia.”",
    servicio: "Mantenimiento",
    calificacion: 4,
  },
  {
    titulo: "Ejemplo de estrategia digital",
    comentario: "Ejemplo ficticio: “La propuesta ayuda a ordenar las prioridades de comunicación del negocio.”",
    servicio: "Marketing digital",
    calificacion: 5,
  },
];

const reviewPageSize = 6;

type QuotePaymentChoice = "undecided" | "bank_transfer" | "yape";

const quotePaymentOptions: {
  value: QuotePaymentChoice;
  label: string;
  description: string;
  icon: "bank_transfer" | "yape" | "later";
  apiPreference: QuotePaymentPreference;
}[] = [
  { value: "bank_transfer", label: "Transferencia bancaria BCP", description: "Verás los datos de la cuenta después de enviar la solicitud.", icon: "bank_transfer", apiPreference: "bank_transfer" },
  { value: "yape", label: "Yape", description: "Verás el QR y el monto estimado después de enviar la solicitud.", icon: "yape", apiPreference: "yape" },
  { value: "undecided", label: "Aún no lo sé", description: "Lo decidiré cuando revise la cotización final.", icon: "later", apiPreference: "undecided" },
];

function QuotePaymentIcon({ method }: { method: QuotePaymentChoice | "later" }) {
  if (method === "bank_transfer" || method === "yape") {
    const source = method === "bank_transfer" ? "/payment-methods/bcp.svg" : "/payment-methods/yape.png";

    return <img className={`quote-payment-icon quote-payment-icon-${method}`} src={source} alt="" aria-hidden="true" />;
  }

  const commonProps = {
    className: `quote-payment-icon quote-payment-icon-${method}`,
    viewBox: "0 0 40 40",
    "aria-hidden": true as const,
  };

  return (
    <svg {...commonProps}>
      <circle className="quote-payment-icon-badge" cx="20" cy="20" r="17" />
      <path d="M14 15h.5M20 15h.5M26 15h.5M14 21h.5M20 21h.5M26 21h.5M14 27h.5M20 27h.5M26 27h.5" />
    </svg>
  );
}

function ReviewSubmissionDialog({ services, onClose, onSubmitted }: {
  services: ApiService[];
  onClose: () => void;
  onSubmitted: (review: ServiceReview) => void;
}) {
  const [serviceId, setServiceId] = useState(() => String(services.find((service) => service.id)?.id ?? ""));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const availableServices = services.filter((service): service is ApiService & { id: number } => typeof service.id === "number");
  const firstServiceId = availableServices[0]?.id;

  useEffect(() => {
    if (!serviceId && firstServiceId !== undefined) setServiceId(String(firstServiceId));
  }, [firstServiceId, serviceId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submittingRef.current) onClose();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");
    const selectedService = availableServices.find((service) => String(service.id) === serviceId);
    if (!selectedService) {
      setError("Selecciona el servicio sobre el que quieres compartir tu experiencia.");
      return;
    }

    setSubmitting(true);
    submittingRef.current = true;
    try {
      const result = await submitServiceReview(selectedService.id, {
        nombre: name,
        email,
        calificacion: rating,
        titulo: title,
        comentario: comment,
      });
      setStatus(result.mensaje);
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
      });
      setName("");
      setEmail("");
      setTitle("");
      setComment("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar la reseña. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section ref={dialogRef} className="review-submit-dialog" role="dialog" aria-modal="true" aria-labelledby="review-submit-title">
        <button ref={closeButtonRef} className="modal-close" type="button" aria-label="Cerrar formulario de reseña" onClick={onClose} disabled={submitting}>
          <Icon name="x" />
        </button>
        <span className="kicker">Tu experiencia cuenta</span>
        <h2 id="review-submit-title">Escribe una reseña</h2>
        <p>Cuéntanos sobre un servicio que recibiste. Revisaremos tu comentario antes de publicarlo.</p>
        {status ? (
          <div className="review-submit-success" role="status">
            <strong>¡Gracias por compartir tu experiencia!</strong>
            <p>{status}</p>
            <button className="button" type="button" onClick={onClose}>Entendido</button>
          </div>
        ) : availableServices.length === 0 ? (
          <div className="review-submit-error" role="alert">
            <p>No se pudieron cargar los servicios para asociar tu reseña. Intenta de nuevo más tarde.</p>
          </div>
        ) : (
          <form className="review-submit-form" onSubmit={(event) => void submitReview(event)}>
            <label>Servicio
              <select required value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
                <option value="" disabled>Selecciona un servicio</option>
                {availableServices.map((service) => <option key={service.id} value={service.id}>{service.nombre}</option>)}
              </select>
            </label>
            <fieldset className="review-submit-rating">
              <legend>Calificación</legend>
              <div>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} title={`${value} ${value === 1 ? "estrella" : "estrellas"}`}>
                    <input type="radio" name="review-rating" value={value} checked={rating === value} onChange={() => setRating(value)} />
                    <span aria-hidden="true">{value <= rating ? "★" : "☆"}</span>
                    <span className="sr-only">{value} {value === 1 ? "estrella" : "estrellas"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label>Nombre<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>Correo electrónico<input required type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Título (opcional)<input maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label>Tu reseña<textarea required maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
            {error && <p className="review-submit-error" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={submitting}>{submitting ? "Enviando..." : "Enviar reseña"}</button>
          </form>
        )}
      </section>
    </div>
  );
}

function SiteFooter({
  settings,
  onNavigate,
  onOpenLegal,
}: {
  settings: SiteSettings;
  onNavigate: (path: string) => void;
  onOpenLegal: (kind: "privacy" | "warranty" | "terms" | "returns") => void;
}) {
  const whatsapp = settings.contact.whatsapp_phone?.replace(/\D/g, "");
  const coverage = settings.coverage.digital_mode === "virtual"
    ? "Atención virtual en todo el Perú"
    : "Lima, Perú · Atención en todo el país";

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div className="site-footer-brand">
          <a
            href="/#inicio"
            aria-label="DigitalPyme, ir al inicio"
            onClick={(event) => navigate(event, "/#inicio")}
          >
            <Brand light />
          </a>
          <p>Soluciones digitales simples para negocios que quieren crecer.</p>
        </div>

        <nav className="site-footer-column" aria-label="Navegación del pie de página">
          <h2>Explora</h2>
          <a href="/#servicios" onClick={(event) => navigate(event, "/#servicios")}>Servicios</a>
          <a href="/precios" onClick={(event) => navigate(event, "/precios")}>Precios</a>
          <a href="/catalogo-servicios" onClick={(event) => navigate(event, "/catalogo-servicios")}>Catálogo de servicios</a>
          <a href="/#proyectos" onClick={(event) => navigate(event, "/#proyectos")}>Proyectos</a>
          <a href="/#agenda" onClick={(event) => navigate(event, "/#agenda")}>Agenda</a>
          <a href="/#contacto" onClick={(event) => navigate(event, "/#contacto")}>Contacto</a>
        </nav>

        <div className="site-footer-column">
          <h2>Hablemos</h2>
          <a href="mailto:hola@digitalpyme.pe">hola@digitalpyme.pe</a>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp: {settings.contact.whatsapp_phone}
            </a>
          )}
          <span>{coverage}</span>
        </div>

        <nav className="site-footer-column" aria-label="Información legal">
          <h2>Información</h2>
          <button type="button" onClick={() => onOpenLegal("warranty")}>Garantía</button>
          <button type="button" onClick={() => onOpenLegal("terms")}>Términos y condiciones</button>
          {settings.legal.privacy_published && settings.legal.privacy?.trim() && (
            <button type="button" onClick={() => onOpenLegal("privacy")}>Privacidad</button>
          )}
          {settings.legal.returns.trim() && (
            <button type="button" onClick={() => onOpenLegal("returns")}>Cambios y devoluciones</button>
          )}
        </nav>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} DigitalPyme. Todos los derechos reservados.</span>
          <span>Hecho en Perú</span>
        </div>
      </div>
    </footer>
  );
}

type PricingPlan = {
  name: string;
  price: number;
  regularPrice: number;
  audience: string;
  pages: string;
  sections: string;
  extras: string[];
  delivery: string;
  renewal: number;
};

const pricingCategories: { title: string; description: string; service: string; plans: PricingPlan[] }[] = [
  {
    title: "Planes de páginas web",
    description: "Sitios administrables para presentar tu negocio y sus servicios.",
    service: "Páginas web",
    plans: [
      { name: "Profesional", price: 1250, regularPrice: 1500, audience: "Emprendedores y PYMES", pages: "1 página interna", sections: "10 bloques o secciones", extras: ["100% administrable", "WhatsApp y Google SEO", "Tema WordPress", "5 correos profesionales", "Hosting, dominio .COM y SSL", "Soporte y capacitación"], delivery: "5 días", renewal: 450 },
      { name: "Empresarial", price: 1750, regularPrice: 2000, audience: "Negocios en crecimiento", pages: "5 páginas internas", sections: "25 bloques o secciones", extras: ["100% administrable", "WhatsApp y Google SEO", "Tema WordPress", "5 correos profesionales", "Hosting, dominio .COM y SSL", "Soporte y capacitación"], delivery: "10 días", renewal: 450 },
      { name: "Corporativo", price: 2250, regularPrice: 2500, audience: "Empresas consolidadas", pages: "10 páginas internas", sections: "50 bloques o secciones", extras: ["100% administrable", "WhatsApp y Google SEO", "Tema WordPress", "5 correos profesionales", "Hosting, dominio .COM y SSL", "Soporte y capacitación"], delivery: "15 días", renewal: 450 },
    ],
  },
  {
    title: "Planes de landing pages",
    description: "Páginas de aterrizaje para campañas, lanzamientos y captación de contactos.",
    service: "Páginas web",
    plans: [
      { name: "Profesional", price: 950, regularPrice: 1250, audience: "Emprendedores y PYMES", pages: "1 página", sections: "5 bloques o secciones", extras: ["1 correo profesional", "Formulario de contacto", "WhatsApp y Google SEO", "Tag Manager y Facebook Pixel", "Tema WordPress", "Hosting, dominio .COM y SSL"], delivery: "5 días", renewal: 350 },
      { name: "Empresarial", price: 1450, regularPrice: 1850, audience: "Negocios en crecimiento", pages: "1 página", sections: "10 bloques o secciones", extras: ["1 correo profesional", "Formulario de contacto", "WhatsApp y Google SEO", "Tag Manager y Facebook Pixel", "Tema WordPress", "Hosting, dominio .COM y SSL"], delivery: "5 días", renewal: 350 },
      { name: "Corporativo", price: 1850, regularPrice: 2250, audience: "Empresas consolidadas", pages: "1 página", sections: "15 bloques o secciones", extras: ["1 correo profesional", "Formulario de contacto", "WhatsApp y Google SEO", "Tag Manager y Facebook Pixel", "Tema WordPress", "Hosting, dominio .COM y SSL"], delivery: "5 días", renewal: 350 },
    ],
  },
  {
    title: "Planes de tiendas virtuales",
    description: "Catálogo y flujo de compra en línea para vender tus productos.",
    service: "Tiendas en línea",
    plans: [
      { name: "Profesional", price: 1950, regularPrice: 2250, audience: "Emprendedores y PYMES", pages: "1 página interna", sections: "10 bloques o secciones", extras: ["10 productos iniciales", "100% administrable", "WhatsApp y Google SEO", "Tema WordPress", "5 correos profesionales", "Hosting, dominio .COM y SSL", "Soporte y capacitación"], delivery: "10 días", renewal: 750 },
      { name: "Empresarial", price: 2450, regularPrice: 2750, audience: "Negocios en crecimiento", pages: "5 páginas internas", sections: "25 bloques o secciones", extras: ["10 productos iniciales", "100% administrable", "WhatsApp y Google SEO", "Tema WordPress", "5 correos profesionales", "Hosting, dominio .COM y SSL", "Soporte y capacitación"], delivery: "15 días", renewal: 750 },
      { name: "Corporativo", price: 2950, regularPrice: 3250, audience: "Empresas consolidadas", pages: "10 páginas internas", sections: "50 bloques o secciones", extras: ["10 productos iniciales", "100% administrable", "WhatsApp y Google SEO", "Tema WordPress", "5 correos profesionales", "Hosting, dominio .COM y SSL", "Soporte y capacitación"], delivery: "30 días", renewal: 750 },
    ],
  },
];

const additionalDigitalServices = [
  {
    title: "Integración de pasarela de pago",
    label: "Pagos en línea",
    price: "S/ 550",
    service: "Tiendas en línea",
    description: "Configuración de una pasarela para recibir pagos en línea. Los métodos disponibles y las comisiones se confirman con el proveedor elegido.",
    details: ["Aceptación de tarjetas y métodos disponibles del proveedor (Izipay, según disponibilidad)", "Configuración y pruebas del flujo de pago", "Comisiones de referencia de la imagen: tarjetas nacionales 4.49% + IGV e internacionales 6.99% + IGV; confirmar tarifas vigentes con el proveedor"],
  },
  {
    title: "Experiencia UI/UX",
    label: "Diseño centrado en tus clientes",
    price: "Cotización a medida",
    service: "Branding",
    description: "Diseño personalizado y adaptable para que tus clientes encuentren y usen mejor la información de tu negocio.",
    details: ["Diseño adaptable a móviles", "Accesos a WhatsApp y llamadas", "Integración con Google Maps y redes sociales", "Formularios de contacto y libro de reclamaciones virtual"],
  },
  {
    title: "SEO para Google",
    label: "Visibilidad orgánica",
    price: "Cotización a medida",
    service: "Marketing digital",
    description: "Mejoras técnicas y de contenido para facilitar que los buscadores comprendan e indexen tu sitio. No se garantizan posiciones específicas.",
    details: ["Mapa del sitio e indexación en Search Console", "Configuración de Google Analytics", "Optimización de títulos, metadescripciones y URLs", "Revisión SEO de la página principal y páginas acordadas"],
  },
  {
    title: "Hosting, dominio y correos",
    label: "Servicios cloud",
    price: "Incluidos según plan",
    service: "Mantenimiento",
    description: "Alojamiento web, dominio .COM y cuentas de correo profesional de acuerdo con el plan contratado.",
    details: ["Dominio .COM y correos profesionales según el plan", "Hosting dimensionado para el proyecto", "Certificado SSL y copias de seguridad según el plan", "Soporte técnico y renovaciones indicados en la propuesta"],
  },
  {
    title: "Capacitación y soporte",
    label: "Acompañamiento",
    price: "Según propuesta",
    service: "Mantenimiento",
    description: "Acompañamiento para que puedas administrar tu sitio y resolver dudas sobre las herramientas entregadas.",
    details: ["Capacitación del panel administrativo (referencia: 1 hora para 1 persona)", "Orientación para las consultas acordadas", "Acceso al panel según el proyecto", "Seguimiento y alcance definidos en la propuesta"],
  },
];

const quoteTypes = [
  { id: "website", name: "Página web", service: "Páginas web", pricingCategory: "Planes de páginas web", icon: "🌐", description: "Sitio para presentar tu marca y servicios." },
  { id: "store", name: "Tienda virtual", service: "Tiendas en línea", pricingCategory: "Planes de tiendas virtuales", icon: "🛒", description: "Vende en línea con catálogo y carrito." },
  { id: "catalog", name: "Catálogo online", service: "Tiendas en línea", pricingCategory: null, icon: "▤", description: "Muestra tus productos para venta consultiva." },
  { id: "landing", name: "Landing page", service: "Páginas web", pricingCategory: "Planes de landing pages", icon: "◎", description: "Página enfocada en una campaña u objetivo." },
];

const quoteModules = [
  { id: "maps", name: "Google Maps interactivo", description: "Ubicación y referencias para que tus clientes te encuentren.", price: null },
  { id: "images", name: "Banco de imágenes con licencia", description: "Selección de imágenes para las páginas del proyecto.", price: null },
  { id: "blog", name: "Blog / novedades", description: "Sección para publicar artículos y noticias.", price: null },
  { id: "portfolio", name: "Portafolio", description: "Galería para mostrar proyectos, productos o trabajos.", price: null },
  { id: "quote-form", name: "Cotizador personalizado", description: "Formulario configurado para las necesidades de tu negocio.", price: null },
  { id: "payment", name: "Integración de pasarela de pago (Izipay)", description: "Configuración inicial; las comisiones del proveedor son aparte.", price: 550 },
];

const quoteCountries = [
  { value: "Perú|+51", label: "Perú (+51)" },
  { value: "Argentina|+54", label: "Argentina (+54)" },
  { value: "Bolivia|+591", label: "Bolivia (+591)" },
  { value: "Chile|+56", label: "Chile (+56)" },
  { value: "Colombia|+57", label: "Colombia (+57)" },
  { value: "Ecuador|+593", label: "Ecuador (+593)" },
  { value: "España|+34", label: "España (+34)" },
  { value: "Estados Unidos|+1", label: "Estados Unidos (+1)" },
  { value: "México|+52", label: "México (+52)" },
];

function PricingPage({ onQuote }: { onQuote: (service?: string, message?: string) => void }) {
  useEffect(() => {
    const title = "Precios y planes | DigitalPyme";
    const description = "Conoce los planes de páginas web, landing pages, tiendas virtuales y servicios digitales de DigitalPyme.";
    document.title = title;
    updateMeta('meta[name="description"]', "name", "description", description);
    updateMeta('meta[property="og:title"]', "property", "og:title", title);
    updateMeta('meta[property="og:description"]', "property", "og:description", description);
    updateMeta('meta[property="og:url"]', "property", "og:url", `${window.location.origin}/precios`);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}/precios`;
  }, []);

  return (
    <main className="pricing-page">
      <section className="pricing-hero">
        <div className="container">
          <span className="kicker kicker-light">Precios claros, soluciones a tu medida</span>
          <h1>Planes y precios para hacer crecer tu negocio.</h1>
          <p>Compara opciones para tu página web, landing page o tienda virtual. El alcance final se confirma en una propuesta antes de iniciar.</p>
        </div>
      </section>

      <div className="container pricing-content">
        {pricingCategories.map((category, categoryIndex) => (
          <section className="pricing-category" key={category.title}>
            <div className="pricing-category-heading">
              <span className="kicker">0{categoryIndex + 1} · Precios en soles</span>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
            </div>
            <div className="pricing-plans">
              {category.plans.map((plan) => (
                <article className="pricing-card" key={plan.name}>
                  <h3>{plan.name}</h3>
                  <div className="pricing-card-price">
                    <strong>S/ {plan.price.toLocaleString("es-PE")}</strong>
                    <del>Precio regular: S/ {plan.regularPrice.toLocaleString("es-PE")}</del>
                    <span>{plan.audience}</span>
                  </div>
                  <ul className="pricing-plan-features">
                    <li><b>{plan.pages}</b></li>
                    <li><b>{plan.sections}</b></li>
                    {plan.extras.map((extra) => <li key={extra}>{extra}</li>)}
                    <li className="pricing-delivery">Tiempo estimado: {plan.delivery}</li>
                  </ul>
                  <div className="pricing-renewal">Renovación anual: S/ {plan.renewal}</div>
                  <button className="button" type="button" onClick={() => onQuote(category.service, `Quiero cotizar el plan ${plan.name} de ${category.title} (S/ ${plan.price}).`)}>Generar cotización</button>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="pricing-addons">
          <div className="pricing-category-heading">
            <span className="kicker">Servicios complementarios</span>
            <h2>Completa tu solución digital.</h2>
            <p>Agrega los servicios que tu negocio necesita. El precio y alcance se validan en la cotización.</p>
          </div>
          <div className="pricing-addon-grid">
            {additionalDigitalServices.map((service) => (
              <article className="pricing-addon" key={service.title}>
                <span>{service.label}</span>
                <h3>{service.title}</h3>
                <strong>{service.price}</strong>
                <p>{service.description}</p>
                <ul>{service.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                <button className="button button-secondary" type="button" onClick={() => onQuote(service.service, `Quiero información y cotización para: ${service.title}.`)}>Consultar servicio</button>
              </article>
            ))}
          </div>
        </section>

        <aside className="pricing-notes">
          <h2>Antes de contratar</h2>
          <ul>
            <li>Precios expresados en soles y no incluyen IGV.</li>
            <li>El hosting, dominio .COM, correos profesionales y SSL se incluyen según el plan; las renovaciones anuales tienen el precio indicado.</li>
            <li>Los tiempos de entrega son estimados y empiezan cuando se recibe el contenido y la información necesarios.</li>
            <li>Las comisiones de pasarela, condiciones de hosting y alcance de soporte dependen del proveedor y se confirman antes de contratar.</li>
          </ul>
          <p>¿No sabes qué plan elegir? Cuéntanos qué necesitas y te ayudamos a definir el alcance.</p>
          <button className="button" type="button" onClick={() => onQuote()}>Solicitar orientación</button>
        </aside>
      </div>
    </main>
  );
}

const heroImages = [
  "/images/hero-banner.png",
  "/images/hero-developer.png",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2200&q=85",
];

function HeroBanner({ onQuote, hasProjects }: { onQuote: () => void; hasProjects: boolean }) {
  const [activeSlide, setActiveSlide] = useState(1);
  const [paused, setPaused] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slideCount = heroImages.length + 1;

  useEffect(() => {
    if (paused || reducedMotion) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [activeSlide, paused, reducedMotion, slideCount]);

  const showSlide = (index: number) => {
    setActiveSlide((index + slideCount) % slideCount);
  };

  return (
    <section
      className="hero"
      id="inicio"
      aria-label="Banner principal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="hero-backgrounds" aria-hidden="true">
        {activeSlide === 0 && (
          <video
            className="hero-backdrop hero-video is-active"
            autoPlay={!reducedMotion}
            muted={videoMuted}
            playsInline
            preload="auto"
            poster={heroImages[0]}
          >
            <source src="/videos/banner.mp4" type="video/mp4" />
          </video>
        )}
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero-backdrop${index + 1 === activeSlide ? " is-active" : ""}`}
            style={{ backgroundImage: `url("${image}")` }}
          />
        ))}
      </div>
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
            <button type="button" className="button" onClick={onQuote}>Solicitar cotización</button>
            <a href={hasProjects ? "#proyectos" : "#servicios"} className="button button-secondary">
              {hasProjects ? "Ver proyectos" : "Ver servicios"}
            </a>
          </div>
          <TrustLine />
        </div>
      </div>
      <div className="container hero-controls" aria-label="Controles del banner">
        <button type="button" className="hero-arrow" aria-label="Diapositiva anterior" onClick={() => showSlide(activeSlide - 1)}>
          <Icon name="arrow" size={18} />
        </button>
        {activeSlide === 0 && (
          <button
            type="button"
            className="hero-sound"
            aria-pressed={!videoMuted}
            onClick={() => setVideoMuted((muted) => !muted)}
          >
            {videoMuted ? "Activar sonido" : "Silenciar"}
          </button>
        )}
        <div className="hero-dots" role="group" aria-label="Seleccionar diapositiva">
          {Array.from({ length: slideCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`hero-dot${index === activeSlide ? " is-active" : ""}`}
              aria-label={index === 0 ? "Mostrar video" : `Mostrar imagen ${index}`}
              aria-pressed={index === activeSlide}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>
        <button type="button" className="hero-arrow" aria-label="Diapositiva siguiente" onClick={() => showSlide(activeSlide + 1)}>
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </section>
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
  const [selectedPortfolioProject, setSelectedPortfolioProject] = useState<ApiPortfolioProject | null>(null);
  const closePortfolioProject = useCallback(() => setSelectedPortfolioProject(null), []);
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [pendingReviewPreviews, setPendingReviewPreviews] = useState<ServiceReview[]>([]);
  const [visibleReviewCount, setVisibleReviewCount] = useState(3);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [reviewLoadError, setReviewLoadError] = useState("");
  const [refreshingReviews, setRefreshingReviews] = useState(false);
  const refreshingReviewsRef = useRef(false);
  const [reviewRefreshStatus, setReviewRefreshStatus] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const closeReviewDialog = useCallback(() => setReviewDialogOpen(false), []);
  const handleReviewSubmitted = useCallback((review: ServiceReview) => {
    setPendingReviewPreviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
    setReviewRefreshStatus("Tu reseña ya aparece aquí como pendiente de revisión. Después de aprobarla, quedará publicada para todos.");
  }, []);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(() => new URLSearchParams(window.location.search).get("admin") === "1");
  const [quoteInitialServices, setQuoteInitialServices] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [servicePath, setServicePath] = useState<string | null>(() => window.location.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null);
  const [storePath, setStorePath] = useState(() => ["/tienda", "/carrito"].includes(window.location.pathname));
  const [serviceCartPath, setServiceCartPath] = useState(() => ["/catalogo-servicios", "/carrito-servicios"].includes(window.location.pathname));
  const [pricingPath, setPricingPath] = useState(() => window.location.pathname === "/precios");
  const [legalOpen, setLegalOpen] = useState<"privacy" | "warranty" | "terms" | "returns" | null>(null);
  const [quoteInitialMessage, setQuoteInitialMessage] = useState("");

  const openQuote = (service?: string, message = "") => {
    setQuoteInitialServices(service ? [service] : []);
    setQuoteInitialMessage(message);
    setQuoteOpen(true);
  };

  useEffect(() => {
    void Promise.all([
      getServices(fallbackServices),
      getPortfolioProjects([]),
      getTestimonials([]),
      getServiceReviews(0, reviewPageSize + 1),
      getServiceCategories(),
    ]).then(([loadedServices, loadedProjects, loadedTestimonials, loadedReviews, loadedCategories]) => {
      setServices(loadedServices);
      setProjects(loadedProjects);
      setTestimonials(loadedTestimonials);
      setReviews(loadedReviews.slice(0, reviewPageSize));
      setHasMoreReviews(loadedReviews.length > reviewPageSize);
      setCategories(loadedCategories.length ? loadedCategories : loadedServices.flatMap((item) => item.category ? [item.category] : []));
    });
  }, []);

  const loadMoreReviews = async () => {
    setReviewLoadError("");
    if (reviews.length === 0) {
      setVisibleReviewCount((count) => Math.min(count + 3, demoReviewExamples.length));
      return;
    }
    if (visibleReviewCount < reviews.length) {
      setVisibleReviewCount((count) => count + 3);
      return;
    }
    if (!hasMoreReviews || loadingMoreReviews) return;

    setLoadingMoreReviews(true);
    try {
      const nextReviews = await getServiceReviews(reviews.length, reviewPageSize + 1);
      setReviews((current) => [...current, ...nextReviews.slice(0, reviewPageSize)]);
      setVisibleReviewCount((count) => count + 3);
      setHasMoreReviews(nextReviews.length > reviewPageSize);
    } catch (loadError) {
      setReviewLoadError(loadError instanceof Error ? loadError.message : "No se pudieron cargar más reseñas.");
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const refreshApprovedReviews = async () => {
    if (refreshingReviewsRef.current) return;
    refreshingReviewsRef.current = true;
    setRefreshingReviews(true);
    setReviewLoadError("");
    try {
      const loadedReviews = await refreshServiceReviews(reviewPageSize + 1);
      const approvedReviews = loadedReviews.slice(0, reviewPageSize);
      setReviews(approvedReviews);
      setVisibleReviewCount(3);
      setHasMoreReviews(loadedReviews.length > reviewPageSize);
      const approvedPendingReviews = pendingReviewPreviews.filter((pending) =>
        approvedReviews.some((approved) => approved.id === pending.id),
      );
      if (approvedPendingReviews.length > 0) {
        const approvedIds = new Set(approvedPendingReviews.map((review) => review.id));
        setPendingReviewPreviews((current) => current.filter((review) => !approvedIds.has(review.id)));
        setReviewRefreshStatus("¡Tu reseña fue aprobada y ya aparece publicada!");
      } else {
        setReviewRefreshStatus(
          pendingReviewPreviews.length > 0
            ? "Reseñas actualizadas. La tuya todavía está pendiente de aprobación."
            : "Reseñas actualizadas.",
        );
      }
    } catch (loadError) {
      setReviewLoadError(loadError instanceof Error ? loadError.message : "No se pudieron actualizar las reseñas.");
    } finally {
      refreshingReviewsRef.current = false;
      setRefreshingReviews(false);
    }
  };

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshApprovedReviews();
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [pendingReviewPreviews]);

  useEffect(() => {
    if (!servicePath && !storePath && !serviceCartPath && !pricingPath) applySiteSettings(siteSettings);
  }, [servicePath, storePath, serviceCartPath, pricingPath, siteSettings]);

  const navigateToPath = (path: string) => {
    const destination = path;
    window.history.pushState({}, "", destination);
    const destinationUrl = new URL(destination, window.location.origin);
    setServicePath(destinationUrl.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null);
    setStorePath(["/tienda", "/carrito"].includes(destinationUrl.pathname));
    setServiceCartPath(["/catalogo-servicios", "/carrito-servicios"].includes(destinationUrl.pathname));
    setPricingPath(destinationUrl.pathname === "/precios");
    const anchor = destination.split("#")[1];
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }), 0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPopState = () => {
      setServicePath(window.location.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null);
      setStorePath(["/tienda", "/carrito"].includes(window.location.pathname));
      setServiceCartPath(["/catalogo-servicios", "/carrito-servicios"].includes(window.location.pathname));
      setPricingPath(window.location.pathname === "/precios");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let active = true;
    const applySettings = (settings: SiteSettings) => {
      const mergedSettings = mergeSiteSettings(settings);
      setSiteSettings(mergedSettings);
      if (!servicePath && !storePath && !serviceCartPath && !pricingPath) applySiteSettings(mergedSettings);
    };
    const handleSettingsUpdate = (event: Event) => {
      const settings = (event as CustomEvent<SiteSettings>).detail;
      if (settings) applySettings(settings);
    };

    if (!servicePath && !storePath && !serviceCartPath && !pricingPath) applySiteSettings(siteSettings);
    void getPublicSiteSettings().then((settings) => {
      if (active) applySettings(settings);
    });
    window.addEventListener("digitalpyme:site-settings", handleSettingsUpdate);
    return () => {
      active = false;
      window.removeEventListener("digitalpyme:site-settings", handleSettingsUpdate);
    };
  }, []);

  if (window.location.pathname === "/restablecer-contrasena") {
    return <PasswordResetPage />;
  }

  if (adminOpen) {
    return <AdminPortal onClose={() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("admin");
      if (url.pathname === "/admin") url.pathname = "/";
      window.history.replaceState({}, "", url);
      applySiteSettings(siteSettings);
      setAdminOpen(false);
    }} />;
  }

  if (portalOpen) {
    return <ClientPortal
      onClose={() => setPortalOpen(false)}
      onAdminLogin={(session) => {
        sessionStorage.removeItem("digitalpyme.client.token");
        sessionStorage.removeItem("digitalpyme.client.user");
        sessionStorage.setItem("digitalpyme.admin.token", session.token);
        sessionStorage.setItem("digitalpyme.admin.user", JSON.stringify(session.usuario));
        setPortalOpen(false);
        setAdminOpen(true);
      }}
    />;
  }

  if (storePath) {
    return <PhysicalStore />;
  }

  if (serviceCartPath) {
    return (
      <ServiceCart
        services={services}
        onQuote={(serviceNames) => {
          setQuoteInitialServices(serviceNames);
          setQuoteInitialMessage("Servicios seleccionados desde el carrito");
          setQuoteOpen(true);
          navigateToPath("/");
        }}
        onClosePortal={() => navigateToPath("/")}
      />
    );
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
        <SiteFooter settings={siteSettings} onNavigate={navigateToPath} onOpenLegal={setLegalOpen} />
        {quoteOpen && <QuoteBuilder services={services} initialServices={quoteInitialServices} initialMessage={quoteInitialMessage} privacyPublished={siteSettings.legal.privacy_published} onClose={() => setQuoteOpen(false)} onOpenLegal={setLegalOpen} />}
        {legalOpen && <LegalDialog kind={legalOpen} settings={siteSettings} onClose={() => setLegalOpen(null)} />}
      </div>
    );
  }

  if (pricingPath) {
    return (
      <div className="page-shell">
        <Header onQuote={() => openQuote()} onPortal={() => setPortalOpen(true)} onNavigate={navigateToPath} />
        <PricingPage onQuote={openQuote} />
        <SiteFooter settings={siteSettings} onNavigate={navigateToPath} onOpenLegal={setLegalOpen} />
        {quoteOpen && <QuoteBuilder services={services} initialServices={quoteInitialServices} initialMessage={quoteInitialMessage} privacyPublished={siteSettings.legal.privacy_published} onClose={() => setQuoteOpen(false)} onOpenLegal={setLegalOpen} />}
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
        <HeroBanner onQuote={openQuote} hasProjects={projects.length > 0} />

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
                  <button className="circle-arrow" aria-label={`Agregar ${service.nombre} al carrito de servicios`} onClick={() => {
                    addServicesToCart([service]);
                    navigateToPath("/carrito-servicios");
                  }}>
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
                <span className="kicker">Nuestro trabajo</span>
                <h2>Nuestro portafolio de proyectos.</h2>
              </div>
              <p>Conoce el sitio propio de DigitalPyme y explora conceptos visuales de muestra, identificados como tales.</p>
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
                    <span className="catalog-badge project-badge">{project.etiqueta || project.categoria}</span>
                    <div className="project-overlay">
                      <span>{project.categoria}</span>
                      <h3>{project.nombre}</h3>
                      <p>{project.resultado}</p>
                      <button
                        type="button"
                        aria-label={`Ver detalle del proyecto ${project.nombre}`}
                        onClick={() => setSelectedPortfolioProject(project)}
                      >
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
                <h2>Testimonios de nuestros clientes.</h2>
              </div>
              <p>Las opiniones reales se publican después de su revisión. Los ejemplos se identifican claramente como demostraciones, no como reseñas de clientes.</p>
            </div>
            <div className="review-wall-toolbar">
              <div className="review-wall-summary">
                <span className="review-wall-mark" aria-hidden="true">★</span>
                <div>
                  {reviews.length > 0 ? (
                    <>
                      <strong>{(reviews.reduce((total, review) => total + review.calificacion, 0) / reviews.length).toFixed(1)} / 5</strong>
                      <span>{reviews.length} reseñas aprobadas recientes</span>
                    </>
                  ) : (
                    <>
                      <strong>Opiniones verificadas</strong>
                      <span>Aún no hay reseñas aprobadas</span>
                    </>
                  )}
                </div>
              </div>
              <div className="review-wall-actions">
                <button className="button button-secondary review-wall-refresh" type="button" onClick={() => void refreshApprovedReviews()} disabled={refreshingReviews}>
                  {refreshingReviews ? "Actualizando..." : pendingReviewPreviews.length > 0 ? "Comprobar aprobación" : "Actualizar reseñas"}
                </button>
                <button className="button review-wall-write" type="button" onClick={() => setReviewDialogOpen(true)}>Escribir una reseña</button>
              </div>
            </div>
            {reviewRefreshStatus && <p className="review-wall-refresh-status" role="status">{reviewRefreshStatus}</p>}
            {reviews.length === 0 && pendingReviewPreviews.length === 0 && (
              <p className="review-wall-demo-note" role="note">Ejemplos ficticios para mostrar el diseño. No son opiniones ni resultados de clientes reales.</p>
            )}
            <div className="review-wall-grid">
              {pendingReviewPreviews.map((review) => (
                <article className="review-wall-card" key={`pending-${review.id}`}>
                  <span className="review-wall-pending">Pendiente de revisión</span>
                  <span className="review-wall-stars" aria-label={`${review.calificacion} de 5 estrellas`}>
                    {"★".repeat(review.calificacion)}{"☆".repeat(5 - review.calificacion)}
                  </span>
                  <h3>{review.titulo || review.service?.nombre || "Tu reseña"}</h3>
                  <p>{review.comentario}</p>
                  <footer>
                    <b>{review.nombre}</b>
                    {review.service?.nombre && <span>{review.service.nombre}</span>}
                  </footer>
                </article>
              ))}
              {reviews.length > 0
                ? reviews.slice(0, visibleReviewCount).map((review) => (
                  <article className="review-wall-card" key={review.id}>
                    <span className="review-wall-approved">Reseña aprobada</span>
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
                ))
                : pendingReviewPreviews.length === 0 && demoReviewExamples.slice(0, visibleReviewCount).map((review) => (
                  <article className="review-wall-card review-wall-card-demo" key={review.titulo}>
                    <span className="review-wall-demo-badge">Ejemplo ficticio</span>
                    <span className="review-wall-stars" aria-label={`Calificación ilustrativa: ${review.calificacion} de 5 estrellas`}>
                      {"★".repeat(review.calificacion)}{"☆".repeat(5 - review.calificacion)}
                    </span>
                    <h3>{review.titulo}</h3>
                    <p>{review.comentario}</p>
                    <footer>
                      <b>No corresponde a un cliente</b>
                      <span>{review.servicio}</span>
                    </footer>
                  </article>
                ))}
            </div>
            {reviewLoadError && <p className="review-submit-error" role="alert">{reviewLoadError}</p>}
            {(reviews.length > visibleReviewCount || hasMoreReviews || (reviews.length === 0 && demoReviewExamples.length > visibleReviewCount)) && (
              <div className="review-wall-load-more">
                <button className="button button-secondary" type="button" disabled={loadingMoreReviews} onClick={() => void loadMoreReviews()}>
                  {loadingMoreReviews ? "Cargando..." : "Cargar más"}
                </button>
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

        <section className="section faq" id="preguntas-frecuentes">
          <div className="container">
            <div className="faq-heading">
              <div>
                <span className="kicker">Conoce más...</span>
                <h2>Preguntas frecuentes</h2>
              </div>
              <p>¿Tienes otra consulta? <a href="#contacto">Escríbenos y conversemos.</a></p>
            </div>
            <div className="faq-list">
              {faqs.map((item, index) => {
                const answerId = `faq-answer-${index}`;
                const isOpen = faq === index;
                return (
                  <div className={`faq-item ${isOpen ? "open" : ""}`} key={item[0]}>
                    <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setFaq(isOpen ? null : index)}>
                      <span>{item[0]}</span>
                      <b aria-hidden="true">{isOpen ? "−" : "+"}</b>
                    </button>
                    <p id={answerId} hidden={!isOpen}>{item[1]}</p>
                  </div>
                );
              })}
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

      <SiteFooter settings={siteSettings} onNavigate={navigateToPath} onOpenLegal={setLegalOpen} />

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
          initialMessage={quoteInitialMessage}
          privacyPublished={siteSettings.legal.privacy_published}
          onClose={() => setQuoteOpen(false)}
          onOpenLegal={setLegalOpen}
        />
      )}
      {legalOpen && <LegalDialog kind={legalOpen} settings={siteSettings} onClose={() => setLegalOpen(null)} />}
      {selectedPortfolioProject && (
        <PortfolioProjectDialog project={selectedPortfolioProject} onClose={closePortfolioProject} />
      )}
      {reviewDialogOpen && <ReviewSubmissionDialog services={services} onClose={closeReviewDialog} onSubmitted={handleReviewSubmitted} />}
    </div>
  );
}

export default App;
