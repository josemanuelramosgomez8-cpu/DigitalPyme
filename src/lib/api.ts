const configuredUrl = import.meta.env.VITE_API_URL as string | undefined;

export const API_URL = (
  configuredUrl ?? (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api")
).replace(/\/+$/, "");

export interface ApiService {
  id?: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  descripcion_larga?: string | null;
  incluye?: string[] | null;
  precio_desde: number | string | null;
  duracion: string | null;
  slug?: string | null;
  etiqueta?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  category?: ServiceCategory | null;
  subcategory?: ServiceSubcategory | null;
  calificacion_promedio?: number | string | null;
  total_resenas?: number;
  activo: boolean;
  orden: number;
}

export interface ServiceCategory {
  id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  orden: number;
  subcategories?: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: number;
  category_id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  orden: number;
}

export interface ServiceReview {
  id: number;
  servicio_id: number;
  nombre: string;
  email?: string;
  calificacion: number;
  titulo: string | null;
  comentario: string;
  aprobada?: boolean;
  created_at?: string;
  service?: { id: number; nombre: string };
}

export interface ApiPortfolioProject {
  id?: number;
  nombre: string;
  categoria: string;
  resultado: string;
  descripcion_larga?: string | null;
  desafio?: string | null;
  solucion?: string | null;
  entregables?: string[] | null;
  tecnologias?: string[] | null;
  imagen: string;
  imagen_alt: string | null;
  etiqueta?: string | null;
  related_service_id?: number | null;
  activo: boolean;
  orden: number;
}

export interface ApiTestimonial {
  id?: number;
  contenido: string;
  autor: string;
  cargo: string;
  iniciales: string;
  resultado: string;
  resultado_descripcion: string;
  resultado_periodo: string;
  activo: boolean;
  orden: number;
}

export interface SolicitudResponse {
  mensaje: string;
  inversion_estimada: number | string | null;
  incluye_servicios_a_cotizar?: boolean;
  metodo_pago_preferido?: QuotePaymentPreference;
  email_enviado: boolean;
  whatsapp_url: string | null;
}

export type QuotePaymentPreference = "undecided" | "card" | "bank_transfer" | "yape" | "plin" | "yape_plin" | "paypal";

export interface QuoteVerificationResponse {
  mensaje: string;
  verification_token?: string;
}

export interface AgendaSlot {
  id: number;
  date: string;
  time: string;
  available: number;
  low: boolean;
}

export interface AgendaMonth {
  month: string;
  slots: AgendaSlot[];
}

export interface ClientSession {
  token: string;
  usuario: { name: string; email: string; must_change_password?: boolean };
}

export interface ClientProject {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  estado: string;
  progreso: number;
  fecha_inicio: string | null;
  fecha_entrega: string | null;
  cotizacion: {
    id: number;
    servicio: string;
    descripcion: string | null;
    monto: number | string;
    estado: string;
  } | null;
  milestones: ProjectMilestone[];
  documents?: ProjectFile[];
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  titulo: string;
  descripcion: string | null;
  monto: number | string | null;
  estado: "pendiente" | "pendiente_aprobacion" | "aprobado";
  approved_at: string | null;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  original_name: string;
  tipo: "documento" | "comprobante";
  mime_type: string;
  size: number;
  created_at: string;
}

export interface ProjectPayment {
  id: number;
  reference: string;
  project_id: number;
  milestone_id: number | null;
  method: "bank_transfer" | "yape_plin" | "card";
  provider: string | null;
  amount: number | string;
  currency: string;
  status: "pendiente" | "comprobante_enviado" | "pagado" | "rechazado" | "fallido";
  paid_at: string | null;
  created_at: string;
  receipt_email_sent?: boolean;
  milestone?: { id: number; titulo: string } | null;
  receipt?: ProjectFile | null;
}

export interface ClientPaymentOptions {
  payments: ProjectPayment[];
  card_enabled: boolean;
  bank_transfer: {
    bank: string | null;
    holder: string | null;
    account: string | null;
    cci: string | null;
  };
  yape_plin: {
    enabled: boolean;
    phone: string | null;
    holder: string | null;
    qr_url: string | null;
  };
}

export interface AdminLead {
  id: number;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  servicio: string;
  mensaje: string | null;
  inversion_estimada: number | string | null;
  estado: "nuevo" | "contactado" | "cotizado" | "ganado" | "perdido";
  created_at: string;
  cotizaciones: AdminQuote[];
  client?: { id: number; lead_id: number; user_id: number } | null;
}

export interface AdminManagedClient {
  id: number;
  nombre: string;
  empresa: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    must_change_password: boolean;
    created_at: string;
  };
  lead: {
    id: number;
    nombre: string;
    email: string | null;
    telefono: string | null;
    created_at: string;
    cotizaciones?: AdminQuote[];
  } | null;
  requests?: {
    id: number;
    nombre: string;
    email: string | null;
    telefono: string | null;
    servicio: string;
    mensaje: string | null;
    estado: string;
    created_at: string;
    cotizaciones: AdminQuote[];
  }[];
  projects?: {
    id: number;
    nombre: string;
    estado: string;
    created_at: string;
    cotizacion: AdminQuote | null;
    payments?: {
      id: number;
      amount: number | string;
      status: string;
      method: string;
      paid_at: string | null;
      milestone: { id: number; titulo: string } | null;
      receipt: { id: number; original_name: string } | null;
    }[];
  }[];
}

export interface AdminQuote {
  id: number;
  lead_id: number;
  servicio: string;
  descripcion: string | null;
  monto: number | string;
  estado: "borrador" | "enviada" | "aceptada" | "rechazada";
  created_at: string;
  email_enviado?: boolean;
}

export interface AdminProject extends ClientProject {
  client_id: number;
  client: { id: number; nombre: string; empresa: string | null };
}

export interface AdminPayment extends ProjectPayment {
  project: {
    id: number;
    nombre: string;
    client: { id: number; nombre: string; empresa: string | null };
  };
}

export interface AdminReservation {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  estado: string;
  slot: { id: number; date: string; time: string };
}

export interface AdminSlot {
  id: number;
  date: string;
  time: string;
  capacity: number;
  available: number;
  active: boolean;
}

export interface AdminDashboard {
  leads_total: number;
  leads_nuevos: number;
  cotizaciones_total: number;
  cotizaciones_pendientes: number;
  proyectos_total: number;
  proyectos_en_progreso: number;
  proyectos_por_estado: Record<string, number>;
  pagos_por_verificar: number;
  ingresos_confirmados: number | string;
  reservas_del_mes: number;
  cupos_proyecto: {
    capacidad: number;
    reservados: number;
    disponibles: number;
    alerta_pocos_cupos: boolean;
  } | null;
  inventario?: {
    productos_bajo_reorden: number;
    productos_agotados: number;
    unidades_vendidas: number;
    rotacion: number;
  };
}

export interface AdminProjectCapacity {
  month: string;
  capacity: number;
  reserved: number;
  available: number;
  alerta_pocos_cupos: boolean;
}

export interface StoreProduct {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precio: number | string;
  stock: number;
  punto_reorden: number;
  ubicacion_almacen: string | null;
  imagen_url: string | null;
  activo: boolean;
  estado_stock: "disponible" | "agotado";
  alerta_reorden: boolean;
}

export interface StoreStockMovement {
  id: number;
  product_id: number;
  order_id: number | null;
  tipo: "entrada" | "salida";
  cantidad: number;
  motivo: string;
  created_at: string;
  product: { id: number; sku: string; nombre: string };
}

export interface StoreOrderItem {
  id: number;
  product_id: number | null;
  sku: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
  product?: { ubicacion_almacen: string | null } | null;
}

export interface StoreReturnRequest {
  id: number;
  order_id: number;
  estado: "solicitada" | "aprobada" | "recibida" | "inspeccionada" | "resuelta";
  motivo: string;
  resolucion: "reventa" | "reparacion" | "desecho" | "reembolso" | null;
  notas_inspeccion: string | null;
  order?: { id: number; client_id: number; estado: string; total: number | string; client?: { id: number; nombre: string; empresa: string | null }; items?: StoreOrderItem[] };
}

export interface StoreOrder {
  id: number;
  client_id: number;
  estado: "recibido" | "en_picking" | "empacado" | "enviado" | "entregado" | "cancelado";
  payment_method: "bank_transfer" | "yape_plin" | "card" | null;
  payment_status: "pendiente" | "comprobante_enviado" | "pagado" | "rechazado" | "expirado";
  provider_payment_id: string | null;
  paid_at: string | null;
  receipt_original_name: string | null;
  receipt_uploaded_at: string | null;
  payment_due_at: string | null;
  tipo_operacion: "in-house" | "3PL";
  operador_logistico: string | null;
  metodo_envio: string;
  ubicacion_entrega: string;
  direccion_entrega: string;
  nombre_cliente: string | null;
  email_cliente: string | null;
  telefono_cliente: string | null;
  tipo_comprobante: "boleta" | "factura" | null;
  tipo_documento: "dni" | "ruc" | null;
  numero_documento: string | null;
  empresa_facturacion: string | null;
  codigo_rastreo: string | null;
  subtotal: number | string;
  costo_envio: number | string;
  discount_amount: number | string;
  coupon_code: string | null;
  igv_rate: number | string;
  igv_amount: number | string;
  total: number | string;
  email_enviado?: boolean;
  items: StoreOrderItem[];
  return_request?: StoreReturnRequest | null;
  returnRequest?: StoreReturnRequest | null;
  client?: { id: number; nombre: string; empresa: string | null };
}

export interface PublicStoreProduct {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precio: number | string;
  stock: number;
  imagen_url: string | null;
}

export interface StoreShippingMethod {
  key: "estandar" | "express" | "same_day";
  nombre: string;
  cost: number | string;
  delivery_days: number;
  enabled: boolean;
}

export interface StorePaymentOptions {
  card_enabled: boolean;
  card_environment: "sandbox" | "production";
  igv_rate: number;
  bank_transfer: {
    enabled: boolean;
    bank: string | null;
    holder: string | null;
    account: string | null;
    cci: string | null;
  };
  yape_plin: {
    enabled: boolean;
    phone: string | null;
    holder: string | null;
    qr_url: string | null;
  };
}

export interface StoreCoupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number | string;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

export interface ClientStoreProfile {
  nombre: string;
  empresa: string | null;
  telefono: string | null;
  tipo_documento: "dni" | "ruc" | null;
  numero_documento: string | null;
  tipo_comprobante: "boleta" | "factura" | null;
  direccion_entrega: string | null;
  ubicacion_entrega: string | null;
}

export interface AdminStoreData {
  products: StoreProduct[];
  movements: StoreStockMovement[];
  orders: StoreOrder[];
  returns: StoreReturnRequest[];
  coupons: StoreCoupon[];
  metrics: {
    low_stock: number;
    out_of_stock: number;
    units_sold: number;
    inventory_rotation: number;
    fast_movers: {
      product_id: number;
      sku: string | null;
      nombre: string;
      ubicacion_almacen: string | null;
      units_sold: number;
    }[];
    return_resolutions: {
      reventa: number;
      reparacion: number;
      desecho: number;
      reembolso: number;
    };
  };
}

export interface SiteSettings {
  seo: {
    title: string;
    description: string;
    slug: string;
    og_image: string;
  };
  brand: {
    logo_url: string;
  };
  contact: {
    whatsapp_phone: string | null;
  };
  theme: {
    dark: string;
    lime: string;
    cream: string;
    font_sans: string;
    font_display: string;
  };
  coverage: {
    digital_mode: "virtual" | "virtual_presencial_lima";
    shipping_zones: { location: string; fee: number | string; delivery_days: number | null }[];
    shipping_methods: StoreShippingMethod[];
    free_shipping_threshold: number | string;
  };
  legal: {
    privacy: string | null;
    privacy_published: boolean;
    warranty: string;
    terms: string;
    returns: string;
  };
}

export interface CoverageResult {
  servicio_digital: { modalidad: SiteSettings["coverage"]["digital_mode"]; detalle: string };
  envio?: {
    ubicacion_requerida?: boolean;
    zonas?: SiteSettings["coverage"]["shipping_zones"];
    ubicacion?: string;
    cubierto?: boolean;
    costo?: number;
    plazo_dias?: number | null;
    mensaje?: string;
  };
}

export const defaultSiteSettings: SiteSettings = {
  seo: {
    title: "DigitalPyme | Agencia digital para pymes en Lima",
    description: "Creamos páginas web, tiendas en línea y estrategias digitales para pymes en Lima, Perú.",
    slug: "",
    og_image: "",
  },
  brand: { logo_url: "" },
  contact: { whatsapp_phone: null },
  theme: {
    dark: "#102c2c",
    lime: "#c9f45b",
    cream: "#f6f4ed",
    font_sans: "Manrope",
    font_display: "Playfair Display",
  },
  coverage: {
    digital_mode: "virtual_presencial_lima",
    shipping_zones: [],
    shipping_methods: [
      { key: "estandar", nombre: "Estándar", cost: 12, delivery_days: 3, enabled: true },
      { key: "express", nombre: "Express", cost: 20, delivery_days: 1, enabled: true },
      { key: "same_day", nombre: "Same-day", cost: 28, delivery_days: 0, enabled: true },
    ],
    free_shipping_threshold: 200,
  },
  legal: {
    privacy: null,
    privacy_published: false,
    warranty: "La garantía y el alcance del soporte se detallan en cada propuesta aprobada. Antes de contratar, confirma por escrito las condiciones aplicables a tu proyecto.",
    terms: "Las propuestas describen alcance, plazos, entregables y condiciones de pago. El trabajo comienza después de la aceptación formal de la propuesta. Los pagos se gestionan desde el Portal cliente.",
    returns: "Puedes solicitar la devolución de un pedido entregado desde el Portal cliente e indicar el motivo. El equipo revisará la solicitud y te informará si fue aprobada. La resolución puede ser reventa, reparación, desecho o reembolso, según la inspección y las condiciones aplicables.",
  },
};

/* ------------------------------------------------------------------ */
/* Utilidades de red                                                   */
/* ------------------------------------------------------------------ */

type ApiErrorBody = {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
} | null;

const REQUEST_TIMEOUT_MS = 30000;
export const SESSION_EXPIRED_EVENT = "digitalpyme:session-expired";

function notifySessionExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorMessage(response: Response, data: unknown): string {
  const body = data as ApiErrorBody;
  const validation = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
  return validation ?? body?.mensaje ?? body?.message ?? `La API respondió con estado ${response.status}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: "application/json", ...init.headers },
    });

    if (response.status === 401 && new Headers(init.headers).has("Authorization")) {
      notifySessionExpired();
      throw new Error("Tu sesión venció o ya no es válida. Inicia sesión nuevamente.");
    }

    const data = await parseJson(response);

    if (!response.ok) throw new Error(errorMessage(response, data));
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder. Inténtalo de nuevo.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function postJson<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function clientRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, {
    ...init,
    headers: { ...authHeader(token), ...init.headers },
  });
}

async function getPublicJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return await request<T>(path);
  } catch (error) {
    console.warn(`No se pudo cargar ${path} desde la API; se usarán los valores locales.`, error);
    return fallback;
  }
}

async function getPublicCollection<T>(path: string, fallback: T[]): Promise<T[]> {
  const data = await getPublicJson<unknown>(path, null);
  return Array.isArray(data) ? (data as T[]) : fallback;
}

async function downloadFile(
  path: string,
  token: string,
  fallbackName: string,
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`${API_URL}/${path}`, { headers: authHeader(token) });

  if (response.status === 401) {
    notifySessionExpired();
    throw new Error("Tu sesión venció o ya no es válida. Inicia sesión nuevamente.");
  }

  if (!response.ok) {
    throw new Error(errorMessage(response, await parseJson(response)));
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const quoted = disposition.match(/filename="?([^";]+)"?/i)?.[1];

  return {
    blob: await response.blob(),
    filename: encoded ? decodeURIComponent(encoded) : quoted ?? fallbackName,
  };
}

/* ------------------------------------------------------------------ */
/* Público                                                             */
/* ------------------------------------------------------------------ */

export function getServices(fallback: ApiService[]): Promise<ApiService[]> {
  return getPublicCollection("servicios", fallback);
}

export function getPortfolioProjects(fallback: ApiPortfolioProject[]): Promise<ApiPortfolioProject[]> {
  return getPublicCollection("portafolio", fallback);
}

export function getTestimonials(fallback: ApiTestimonial[]): Promise<ApiTestimonial[]> {
  return getPublicCollection("testimonios", fallback);
}

export function getServiceReviews(offset = 0, limit = 6): Promise<ServiceReview[]> {
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  const path = `resenas?${query.toString()}`;
  return offset === 0 ? getPublicCollection(path, []) : request<ServiceReview[]>(path);
}

export function refreshServiceReviews(limit = 7): Promise<ServiceReview[]> {
  const query = new URLSearchParams({ offset: "0", limit: String(limit) });
  return request<ServiceReview[]>(`resenas?${query.toString()}`);
}

export function getServiceCategories(): Promise<ServiceCategory[]> {
  return getPublicCollection("categorias-servicios", []);
}

export function getServiceBySlug(slug: string): Promise<(ApiService & {
  resenas: ServiceReview[];
  proyectos_relacionados: ApiPortfolioProject[];
}) | null> {
  return getPublicJson(`servicios/${encodeURIComponent(slug)}`, null);
}

export function submitServiceReview(serviceId: number, payload: {
  nombre: string;
  email: string;
  calificacion: number;
  titulo?: string;
  comentario: string;
}): Promise<{ mensaje: string; id: number }> {
  return postJson(`servicios/${serviceId}/resenas`, payload);
}

export function submitLead(payload: Record<string, string | undefined>): Promise<{
  mensaje: string;
  email_enviado: boolean;
  whatsapp_url: string | null;
}> {
  return postJson("leads", payload);
}

export function submitProposal(payload: {
  nombre: string;
  apellido: string;
  empresa: string;
  pais: string;
  email: string;
  telefono: string;
  servicios: string[];
  verification_token: string;
  acepta_terminos: boolean;
  acepta_privacidad: boolean;
  website: string;
  metodo_pago_preferido: QuotePaymentPreference;
  mensaje?: string;
}): Promise<SolicitudResponse> {
  return postJson("propuestas", payload);
}

export function requestQuoteVerificationCode(payload: {
  email: string;
  website: string;
}): Promise<QuoteVerificationResponse> {
  return postJson("propuestas/codigo", payload);
}

export function verifyQuoteEmailCode(payload: {
  email: string;
  code: string;
  website: string;
}): Promise<QuoteVerificationResponse> {
  return postJson("propuestas/verificar-codigo", payload);
}

export function getAgendaSlots(month: string): Promise<AgendaMonth> {
  return request<AgendaMonth>(`agenda/horarios?month=${encodeURIComponent(month)}`);
}

export function reserveAgendaSlot(payload: {
  agenda_slot_id: number;
  nombre: string;
  email?: string;
  telefono?: string;
}): Promise<{ mensaje: string; email_enviado: boolean; whatsapp_url: string | null }> {
  return postJson("agenda/reservas", payload);
}

export function getPublicSiteSettings(): Promise<SiteSettings> {
  return getPublicJson("site-settings", defaultSiteSettings);
}

export function getCoverage(ubicacion?: string, servicio?: string): Promise<CoverageResult> {
  const params = new URLSearchParams();
  if (ubicacion) params.set("ubicacion", ubicacion);
  if (servicio) params.set("servicio", servicio);
  const query = params.toString();
  return getPublicJson(`cobertura${query ? `?${query}` : ""}`, {
    servicio_digital: { modalidad: "virtual_presencial_lima", detalle: "Atención virtual en todo el Perú y presencial en Lima." },
  });
}

/* ------------------------------------------------------------------ */
/* Portal cliente                                                      */
/* ------------------------------------------------------------------ */

export function clientLogin(email: string, password: string): Promise<ClientSession> {
  return postJson("client/login", { email, password });
}

export function registerClient(payload: {
  nombre: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<ClientSession & { notificacion_admin_enviada: boolean }> {
  return postJson("client/register", payload);
}

export function getClientStoreProfile(token: string): Promise<ClientStoreProfile> {
  return clientRequest<ClientStoreProfile>("client/profile", token);
}

export function getClientProjects(token: string): Promise<ClientProject[]> {
  return clientRequest("client/projects", token);
}

export function getClientProject(token: string, projectId: number): Promise<ClientProject> {
  return clientRequest(`client/projects/${projectId}`, token);
}

export function getClientPaymentOptions(token: string, projectId: number): Promise<ClientPaymentOptions> {
  return clientRequest(`client/projects/${projectId}/payments`, token);
}

export function startBankTransfer(token: string, projectId: number, milestoneId?: number, method: "bank_transfer" | "yape_plin" = "bank_transfer"): Promise<{
  mensaje: string;
  payment: ProjectPayment;
}> {
  return clientRequest(`client/projects/${projectId}/payments/transfers`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...(milestoneId ? { milestone_id: milestoneId } : {}), method }),
  });
}

export function startCardPayment(token: string, projectId: number, milestoneId?: number): Promise<{
  payment: ProjectPayment;
  checkout_url: string;
}> {
  return clientRequest(`client/projects/${projectId}/payments/card`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(milestoneId ? { milestone_id: milestoneId } : {}),
  });
}

export function uploadTransferReceipt(
  token: string,
  projectId: number,
  paymentId: number,
  file: File,
): Promise<ProjectFile> {
  const formData = new FormData();
  formData.append("file", file);

  return clientRequest(`client/projects/${projectId}/payments/${paymentId}/receipt`, token, {
    method: "POST",
    body: formData,
  });
}

export function approveProjectMilestone(
  token: string,
  projectId: number,
  milestoneId: number,
): Promise<ProjectMilestone> {
  return clientRequest(`client/projects/${projectId}/milestones/${milestoneId}/approve`, token, {
    method: "POST",
  });
}

export function downloadProjectFile(token: string, projectId: number, documentId: number) {
  return downloadFile(
    `client/projects/${projectId}/documents/${documentId}/download`,
    token,
    `documento-${documentId}`,
  );
}

export function downloadClientPaymentReceipt(token: string, projectId: number, paymentId: number) {
  return downloadFile(
    `client/projects/${projectId}/payments/${paymentId}/receipt`,
    token,
    `recibo-digitalpyme-${String(paymentId).padStart(8, "0")}.pdf`,
  );
}

export function changeClientPassword(token: string, payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ mensaje: string }> {
  return clientRequest("client/password", token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function clientLogout(token: string): Promise<{ mensaje: string }> {
  return clientRequest("logout", token, { method: "POST" });
}

/* ------------------------------------------------------------------ */
/* Tienda (cliente)                                                    */
/* ------------------------------------------------------------------ */

export function getStoreProducts(): Promise<PublicStoreProduct[]> {
  return request<PublicStoreProduct[]>("store/products");
}

export function getStoreShippingOptions(): Promise<{
  methods: StoreShippingMethod[];
  zones: { location: string; fee: number | string; delivery_days: number }[];
  free_shipping_threshold: number | string;
}> {
  return request<{
    methods: StoreShippingMethod[];
    zones: { location: string; fee: number | string; delivery_days: number }[];
    free_shipping_threshold: number | string;
  }>("store/shipping-options");
}

export function getStorePaymentOptions(): Promise<StorePaymentOptions> {
  return request<StorePaymentOptions>("store/payment-options");
}

export function createStoreOrder(token: string, payload: {
  items: { product_id: number; cantidad: number }[];
  metodo_envio: StoreShippingMethod["key"];
  payment_method: "bank_transfer" | "yape_plin" | "card";
  ubicacion_entrega: string;
  direccion_entrega: string;
  telefono: string;
  tipo_comprobante: "boleta" | "factura";
  tipo_documento: "dni" | "ruc";
  numero_documento: string;
  empresa_facturacion?: string;
  coupon_code?: string;
  tipo_operacion?: "in-house" | "3PL";
  operador_logistico?: string;
}): Promise<StoreOrder> {
  return clientRequest("client/store/orders", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function validateStoreCoupon(token: string, payload: {
  code: string;
  items: { product_id: number; cantidad: number }[];
}): Promise<{
  code: string;
  discount_type: StoreCoupon["discount_type"];
  discount_value: number | string;
  discount_amount: number | string;
}> {
  return clientRequest("client/store/coupons/validate", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function startStoreCardPayment(token: string, orderId: number): Promise<{
  checkout_url: string;
  payment_status: StoreOrder["payment_status"];
}> {
  return clientRequest(`client/store/orders/${orderId}/payments/card`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

export function uploadStoreOrderReceipt(token: string, orderId: number, file: File): Promise<{ mensaje: string; payment_status: StoreOrder["payment_status"] }> {
  const formData = new FormData();
  formData.append("file", file);

  return clientRequest(`client/store/orders/${orderId}/receipt`, token, {
    method: "POST",
    body: formData,
  });
}

export function downloadStoreOrderReceipt(token: string, orderId: number, admin = false) {
  const path = admin
    ? `admin/store/orders/${orderId}/receipt`
    : `client/store/orders/${orderId}/receipt`;
  return downloadFile(path, token, `comprobante-pedido-${orderId}`);
}

export function getClientStoreOrders(token: string): Promise<StoreOrder[]> {
  return clientRequest("client/store/orders", token);
}

export function requestStoreReturn(token: string, orderId: number, motivo: string): Promise<StoreReturnRequest> {
  return clientRequest(`client/store/orders/${orderId}/returns`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo }),
  });
}

/* ------------------------------------------------------------------ */
/* Administración                                                      */
/* ------------------------------------------------------------------ */

export function adminLogin(email: string, password: string): Promise<ClientSession> {
  return postJson("login", { email, password });
}

export function adminLogout(token: string): Promise<{ mensaje: string }> {
  return clientLogout(token);
}

export function getAdminDashboard(token: string, month: string): Promise<AdminDashboard> {
  return clientRequest(`admin/dashboard?month=${encodeURIComponent(month)}`, token);
}

export function updateAdminStorePaymentStatus(
  token: string,
  orderId: number,
  payment_status: "pagado" | "rechazado",
): Promise<StoreOrder> {
  return clientRequest(`admin/store/orders/${orderId}/payment`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_status }),
  });
}

export function getAdminStore(token: string): Promise<AdminStoreData> {
  return clientRequest("admin/store", token);
}

export function saveAdminStoreProduct(token: string, id: number | null, payload: Record<string, unknown>): Promise<StoreProduct> {
  return clientRequest(id === null ? "admin/store/products" : `admin/store/products/${id}`, token, {
    method: id === null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function saveAdminStoreCoupon(token: string, id: number | null, payload: {
  code: string;
  discount_type: StoreCoupon["discount_type"];
  discount_value: number;
  active: boolean;
}): Promise<StoreCoupon> {
  return clientRequest(id === null ? "admin/store/coupons" : `admin/store/coupons/${id}`, token, {
    method: id === null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminStoreCoupon(token: string, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/store/coupons/${id}`, token, { method: "DELETE" });
}

export function uploadAdminStoreProductImage(token: string, id: number, image: File): Promise<{ mensaje: string; imagen_url: string }> {
  const formData = new FormData();
  formData.append("image", image);

  return clientRequest(`admin/store/products/${id}/image`, token, {
    method: "POST",
    body: formData,
  });
}

export function deleteAdminStoreProductImage(token: string, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/store/products/${id}/image`, token, { method: "DELETE" });
}

export function deactivateAdminStoreProduct(token: string, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/store/products/${id}`, token, { method: "DELETE" });
}

export function recordAdminStockMovement(token: string, productId: number, payload: {
  tipo: "entrada" | "salida";
  cantidad: number;
  motivo: string;
}): Promise<StoreProduct> {
  return clientRequest(`admin/store/products/${productId}/movements`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateAdminStoreOrder(token: string, id: number, payload: {
  estado?: StoreOrder["estado"];
  tipo_operacion?: StoreOrder["tipo_operacion"];
  operador_logistico?: string | null;
  codigo_rastreo?: string | null;
}): Promise<StoreOrder> {
  return clientRequest(`admin/store/orders/${id}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateAdminStoreReturn(token: string, id: number, payload: {
  estado: StoreReturnRequest["estado"];
  resolucion?: StoreReturnRequest["resolucion"];
  notas_inspeccion?: string;
}): Promise<StoreReturnRequest> {
  return clientRequest(`admin/store/returns/${id}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getAdminSiteSettings(token: string): Promise<SiteSettings> {
  return clientRequest("admin/site-settings", token);
}

export function updateAdminSiteSettings(token: string, settings: SiteSettings): Promise<SiteSettings> {
  return clientRequest("admin/site-settings", token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

export type AdminCategory = ServiceCategory;
export type AdminReview = ServiceReview;

export function getAdminCategories(token: string): Promise<AdminCategory[]> {
  return clientRequest("admin/categorias-servicios", token);
}

export function saveAdminCategory(token: string, id: number | null, payload: Record<string, unknown>): Promise<AdminCategory> {
  return clientRequest(id === null ? "admin/categorias-servicios" : `admin/categorias-servicios/${id}`, token, {
    method: id === null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCategory(token: string, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/categorias-servicios/${id}`, token, { method: "DELETE" });
}

export function saveAdminSubcategory(token: string, id: number | null, payload: Record<string, unknown>): Promise<ServiceSubcategory> {
  return clientRequest(id === null ? "admin/subcategorias-servicios" : `admin/subcategorias-servicios/${id}`, token, {
    method: id === null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminSubcategory(token: string, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/subcategorias-servicios/${id}`, token, { method: "DELETE" });
}

export function getAdminReviews(token: string): Promise<AdminReview[]> {
  return clientRequest("admin/resenas-servicios", token);
}

export function moderateAdminReview(token: string, id: number, aprobada: boolean): Promise<AdminReview> {
  return clientRequest(`admin/resenas-servicios/${id}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aprobada }),
  });
}

export function deleteAdminReview(token: string, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/resenas-servicios/${id}`, token, { method: "DELETE" });
}

export function getAdminProjectCapacity(token: string, month: string): Promise<AdminProjectCapacity> {
  return clientRequest(`admin/inventario/proyectos?month=${encodeURIComponent(month)}`, token);
}

export function updateAdminProjectCapacity(token: string, month: string, capacity: number): Promise<AdminProjectCapacity> {
  return clientRequest("admin/inventario/proyectos", token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month, capacity }),
  });
}

export function getAdminLeads(token: string): Promise<AdminLead[]> {
  return clientRequest("leads", token);
}

export function getAdminClients(token: string, search = ""): Promise<AdminManagedClient[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return clientRequest(`clients${query}`, token);
}

export function getAdminClient(token: string, clientId: number): Promise<AdminManagedClient> {
  return clientRequest(`clients/${clientId}`, token);
}

export function updateAdminClient(token: string, clientId: number, payload: {
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
}): Promise<AdminManagedClient> {
  return clientRequest(`clients/${clientId}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateAdminClientStatus(token: string, clientId: number, is_active: boolean): Promise<{ mensaje: string; is_active: boolean }> {
  return clientRequest(`clients/${clientId}/status`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active }),
  });
}

export function updateAdminClientPassword(token: string, clientId: number, payload: {
  password: string;
  password_confirmation: string;
  force_change: boolean;
}): Promise<{ mensaje: string }> {
  return clientRequest(`clients/${clientId}/password`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function sendAdminClientPasswordReset(token: string, clientId: number): Promise<{ mensaje: string; email_enviado: boolean }> {
  return clientRequest(`clients/${clientId}/password/reset-link`, token, { method: "POST" });
}

export function resetClientPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<{ mensaje: string }> {
  return postJson("password/reset", payload);
}

export function updateAdminLead(token: string, leadId: number, estado: AdminLead["estado"]): Promise<AdminLead> {
  return clientRequest(`leads/${leadId}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
}

export function convertAdminLeadToClient(token: string, leadId: number, email?: string): Promise<{
  id: number;
  lead_id: number;
  user_id: number;
  user: { id: number; name: string; email: string };
}> {
  return clientRequest(`leads/${leadId}/client`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email ? { email } : {}),
  });
}

export function createAdminQuote(token: string, leadId: number, payload: {
  servicio: string;
  descripcion: string;
  monto: number;
}): Promise<AdminQuote> {
  return clientRequest(`leads/${leadId}/cotizaciones`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateAdminQuote(token: string, quoteId: number, payload: {
  estado?: AdminQuote["estado"];
  servicio?: string;
  descripcion?: string | null;
  monto?: number;
}): Promise<AdminQuote> {
  return clientRequest(`cotizaciones/${quoteId}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function resendAdminQuote(token: string, quoteId: number): Promise<AdminQuote> {
  return clientRequest(`cotizaciones/${quoteId}/reenviar`, token, { method: "POST" });
}

export function getAdminProjects(token: string): Promise<AdminProject[]> {
  return clientRequest("admin/projects", token);
}

export function updateAdminProject(token: string, projectId: number, payload: {
  estado: string;
  progreso: number;
}): Promise<AdminProject> {
  return clientRequest(`admin/projects/${projectId}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getAdminPayments(token: string): Promise<AdminPayment[]> {
  return clientRequest("admin/payments", token);
}

export function updateAdminPayment(token: string, paymentId: number, status: "pagado" | "rechazado"): Promise<ProjectPayment> {
  return clientRequest(`admin/payments/${paymentId}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function getAdminReservations(token: string, month: string): Promise<AdminReservation[]> {
  return clientRequest(`admin/agenda/reservas?month=${encodeURIComponent(month)}`, token);
}

export function cancelAdminReservation(token: string, reservationId: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/agenda/reservas/${reservationId}`, token, { method: "DELETE" });
}

export function getAdminSlots(token: string, month: string): Promise<AdminSlot[]> {
  return clientRequest(`admin/agenda/horarios?month=${encodeURIComponent(month)}`, token);
}

export function saveAdminSlot(token: string, payload: {
  date: string;
  time: string;
  capacity: number;
  active: boolean;
}): Promise<AdminSlot> {
  return clientRequest("admin/agenda/horarios", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export type AdminCatalogType = "servicios" | "portafolio" | "testimonios";

export function getAdminCatalog<T>(token: string, type: AdminCatalogType): Promise<T[]> {
  return clientRequest(`admin/${type}`, token);
}

export function saveAdminCatalogItem<T>(
  token: string,
  type: AdminCatalogType,
  id: number | null,
  payload: Record<string, unknown>,
): Promise<T> {
  return clientRequest(id === null ? `admin/${type}` : `admin/${type}/${id}`, token, {
    method: id === null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCatalogItem(token: string, type: AdminCatalogType, id: number): Promise<{ mensaje: string }> {
  return clientRequest(`admin/${type}/${id}`, token, { method: "DELETE" });
}

export function downloadAdminProjectFile(token: string, projectId: number, documentId: number) {
  return downloadFile(
    `admin/projects/${projectId}/documents/${documentId}/download`,
    token,
    `documento-${documentId}`,
  );
}