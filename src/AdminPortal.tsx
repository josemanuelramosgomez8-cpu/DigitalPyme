import { useEffect, useState, type FormEvent } from "react";
import AdminLogistics from "./AdminLogistics";
import {
  adminLogin,
  adminLogout,
  cancelAdminReservation,
  convertAdminLeadToClient,
  createAdminQuote,
  deleteAdminCatalogItem,
  downloadAdminProjectFile,
  getAdminCatalog,
  getAdminCategories,
  getAdminDashboard,
  getAdminLeads,
  getAdminPayments,
  getAdminProjectCapacity,
  getAdminProjects,
  getAdminSiteSettings,
  getAdminReservations,
  getAdminSlots,
  getAdminReviews,
  saveAdminCatalogItem,
  saveAdminCategory,
  saveAdminSubcategory,
  deleteAdminCategory,
  deleteAdminSubcategory,
  moderateAdminReview,
  deleteAdminReview,
  saveAdminSlot,
  updateAdminLead,
  updateAdminPayment,
  updateAdminProject,
  updateAdminProjectCapacity,
  updateAdminQuote,
  updateAdminSiteSettings,
  type AdminCatalogType,
  type AdminDashboard,
  type AdminLead,
  type AdminPayment,
  type AdminProject,
  type AdminProjectCapacity,
  type AdminQuote,
  type AdminReservation,
  type AdminSlot,
  type ApiPortfolioProject,
  type ApiService,
  type ApiTestimonial,
  type AdminCategory,
  type AdminReview,
  type ClientSession,
  type SiteSettings,
  defaultSiteSettings,
} from "./lib/api";

type AdminTab = "resumen" | "solicitudes" | "proyectos" | "agenda" | "pagos" | "logistica" | "catalogos" | "configuracion";
type CatalogItem = (ApiService | ApiPortfolioProject | ApiTestimonial) & { id: number };
type CatalogDraft = Record<string, string | boolean>;

const tabs: { id: AdminTab; label: string; icon: string }[] = [
  { id: "resumen", label: "Resumen", icon: "grid" },
  { id: "solicitudes", label: "Solicitudes", icon: "message" },
  { id: "proyectos", label: "Proyectos", icon: "spark" },
  { id: "agenda", label: "Agenda", icon: "calendar" },
  { id: "pagos", label: "Pagos", icon: "money" },
  { id: "logistica", label: "Logística", icon: "file" },
  { id: "catalogos", label: "Catálogos", icon: "file" },
  { id: "configuracion", label: "SEO y tema", icon: "spark" },
];

const catalogFields: Record<AdminCatalogType, { name: string; label: string; type?: "number" | "checkbox" | "textarea" | "select" }[]> = {
  servicios: [
    { name: "nombre", label: "Nombre" },
    { name: "slug", label: "URL amigable" },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    { name: "descripcion_larga", label: "Descripción completa", type: "textarea" },
    { name: "incluye", label: "Qué incluye (un elemento por línea)", type: "textarea" },
    { name: "precio_desde", label: "Precio desde (S/)", type: "number" },
    { name: "duracion", label: "Duración" },
    { name: "etiqueta", label: "Etiqueta" , type: "select" },
    { name: "category_id", label: "Categoría", type: "select" },
    { name: "subcategory_id", label: "Subcategoría", type: "select" },
    { name: "orden", label: "Orden", type: "number" },
    { name: "activo", label: "Visible en la web", type: "checkbox" },
  ],
  portafolio: [
    { name: "nombre", label: "Nombre" },
    { name: "categoria", label: "Categoría" },
    { name: "resultado", label: "Resultado" },
    { name: "imagen", label: "URL de imagen" },
    { name: "imagen_alt", label: "Texto alternativo" },
    { name: "etiqueta", label: "Etiqueta", type: "select" },
    { name: "related_service_id", label: "Servicio relacionado", type: "select" },
    { name: "orden", label: "Orden", type: "number" },
    { name: "activo", label: "Visible en la web", type: "checkbox" },
  ],
  testimonios: [
    { name: "contenido", label: "Testimonio", type: "textarea" },
    { name: "autor", label: "Autor" },
    { name: "cargo", label: "Cargo" },
    { name: "iniciales", label: "Iniciales" },
    { name: "resultado", label: "Resultado destacado" },
    { name: "resultado_descripcion", label: "Descripción del resultado" },
    { name: "resultado_periodo", label: "Periodo" },
    { name: "orden", label: "Orden", type: "number" },
    { name: "activo", label: "Visible en la web", type: "checkbox" },
  ],
};

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function localDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function restoreAdminSession(): ClientSession | null {
  try {
    const token = localStorage.getItem("digitalpyme.admin.token");
    const usuario = localStorage.getItem("digitalpyme.admin.user");
    if (!token || !usuario) return null;
    return { token, usuario: JSON.parse(usuario) as ClientSession["usuario"] };
  } catch {
    return null;
  }
}

function formatCurrency(amount: number | string): string {
  return Number(amount).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AdminBrand({ light = false }: { light?: boolean }) {
  const logoUrl = document.documentElement.dataset.brandLogo;
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      {logoUrl
        ? <img className="brand-logo-image" src={logoUrl} alt="" aria-hidden="true" />
        : <span className="brand-mark"><span /></span>}
      <strong>DigitalPyme</strong>
    </span>
  );
}

function AdminPortal({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<ClientSession | null>(restoreAdminSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<AdminTab>("resumen");
  const [month, setMonth] = useState(currentMonth);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [projectCapacity, setProjectCapacity] = useState<AdminProjectCapacity | null>(null);
  const [capacityDraft, setCapacityDraft] = useState("");
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [catalogType, setCatalogType] = useState<AdminCatalogType>("servicios");
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [adminServices, setAdminServices] = useState<ApiService[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [subcategoryDraft, setSubcategoryDraft] = useState({ category_id: "", nombre: "" });
  const [editingCatalogId, setEditingCatalogId] = useState<number | null>(null);
  const [catalogDraft, setCatalogDraft] = useState<CatalogDraft>({});
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);
  const [quoteDraft, setQuoteDraft] = useState({ servicio: "", descripcion: "", monto: "" });
  const [slotDraft, setSlotDraft] = useState({ date: localDate(), time: "09:00", capacity: "1", active: true });
  const [loading, setLoading] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const refresh = async (activeTab = tab) => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      if (activeTab === "resumen") {
        const [metrics, capacity, loadedLeads] = await Promise.all([
          getAdminDashboard(session.token, month),
          getAdminProjectCapacity(session.token, month),
          getAdminLeads(session.token),
        ]);
        setDashboard(metrics);
        setProjectCapacity(capacity);
        setCapacityDraft(String(capacity.capacity));
        setLeads(loadedLeads);
      }
      if (activeTab === "solicitudes") setLeads(await getAdminLeads(session.token));
      if (activeTab === "proyectos") setProjects(await getAdminProjects(session.token));
      if (activeTab === "pagos") setPayments(await getAdminPayments(session.token));
      if (activeTab === "agenda") {
        const [loadedReservations, loadedSlots] = await Promise.all([
          getAdminReservations(session.token, month),
          getAdminSlots(session.token, month),
        ]);
        setReservations(loadedReservations);
        setSlots(loadedSlots);
      }
      if (activeTab === "catalogos") {
        const [items, loadedCategories, loadedReviews, loadedServices] = await Promise.all([
          getAdminCatalog<CatalogItem>(session.token, catalogType),
          getAdminCategories(session.token),
          getAdminReviews(session.token),
          getAdminCatalog<ApiService>(session.token, "servicios"),
        ]);
        setCatalogItems(items);
        setCategories(loadedCategories);
        setReviews(loadedReviews);
        setAdminServices(loadedServices);
      }
      if (activeTab === "configuracion") setSiteSettings(await getAdminSiteSettings(session.token));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la información administrativa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) void refresh(tab);
  }, [session, tab, month, catalogType]);

  const dismissAdmin = () => {
    localStorage.removeItem("digitalpyme.admin.token");
    localStorage.removeItem("digitalpyme.admin.user");
    setSession(null);
    onClose();
  };

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setError("");
    try {
      const result = await adminLogin(email, password);
      localStorage.setItem("digitalpyme.admin.token", result.token);
      localStorage.setItem("digitalpyme.admin.user", JSON.stringify(result.usuario));
      setSession(result);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = async () => {
    if (!session) return;
    setError("");
    try {
      await adminLogout(session.token);
      dismissAdmin();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "No se pudo cerrar la sesión.");
    }
  };

  const runAction = async (action: () => Promise<unknown>, message: string, activeTab = tab): Promise<boolean> => {
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(message);
      await refresh(activeTab);
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo completar la acción.");
      return false;
    }
  };

  const downloadReceipt = async (payment: AdminPayment) => {
    if (!session || !payment.receipt) return;
    setDownloadingId(payment.receipt.id);
    setError("");
    try {
      const result = await downloadAdminProjectFile(session.token, payment.project.id, payment.receipt.id);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "No se pudo descargar el comprobante.");
    } finally {
      setDownloadingId(null);
    }
  };

  const submitQuote = async (event: FormEvent, lead: AdminLead) => {
    event.preventDefault();
    if (!session) return;
    await runAction(async () => {
      await createAdminQuote(session.token, lead.id, {
        ...quoteDraft,
        monto: Number(quoteDraft.monto),
      });
      setQuoteDraft({ servicio: "", descripcion: "", monto: "" });
    }, "Cotización creada.", "solicitudes");
  };

  const changeQuoteStatus = async (quote: AdminQuote, estado: AdminQuote["estado"]) => {
    if (!session) return;
    if (estado === "aceptada" && !window.confirm("Al aceptar, se creará el proyecto del cliente y se reservará un cupo del mes actual. ¿Continuar?")) return;
    await runAction(async () => {
      await updateAdminQuote(session.token, quote.id, estado);
      if (estado === "aceptada") setProjects(await getAdminProjects(session.token));
    }, estado === "aceptada" ? "Cotización aceptada y proyecto creado." : "Estado de cotización actualizado.", "solicitudes");
  };

  const submitSlot = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    await runAction(() => saveAdminSlot(session.token, {
      ...slotDraft,
      capacity: Number(slotDraft.capacity),
    }), "Horario guardado.", "agenda");
  };

  const submitCatalogItem = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    const payload: Record<string, unknown> = { ...catalogDraft };
    for (const field of catalogFields[catalogType]) {
      if (field.name === "incluye") {
        payload[field.name] = String(catalogDraft[field.name] ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
        continue;
      }
      if (field.type === "number") {
        const value = catalogDraft[field.name];
        if (value === "") {
          if (field.name === "precio_desde") payload[field.name] = null;
          else delete payload[field.name];
        } else {
          payload[field.name] = Number(value);
        }
      }
    }
    const saved = await runAction(
      () => saveAdminCatalogItem<CatalogItem>(session.token, catalogType, editingCatalogId, payload),
      editingCatalogId === null ? "Elemento creado." : "Cambios guardados.",
      "catalogos",
    );
    if (saved) {
      setEditingCatalogId(null);
      setCatalogDraft({});
    }
  };

  const newCatalogItem = () => {
    const nextOrder = Math.max(0, ...catalogItems.map((item) => item.orden)) + 1;
    setEditingCatalogId(null);
    setCatalogDraft({ activo: true, orden: String(nextOrder) });
  };

  const submitCapacity = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    await runAction(
      () => updateAdminProjectCapacity(session.token, month, Number(capacityDraft)),
      "Cupos mensuales actualizados.",
      "resumen",
    );
  };

  const submitSiteSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    await runAction(async () => {
      const updated = await updateAdminSiteSettings(session.token, siteSettings);
      setSiteSettings(updated);
      window.dispatchEvent(new CustomEvent<SiteSettings>("digitalpyme:site-settings", { detail: updated }));
    }, "SEO, tema y cobertura guardados.", "configuracion");
  };

  const addShippingZone = () => {
    setSiteSettings((settings) => ({
      ...settings,
      coverage: {
        ...settings.coverage,
        shipping_zones: [...settings.coverage.shipping_zones, { location: "", fee: 0, delivery_days: null }],
      },
    }));
  };

  const editCatalogItem = (item: CatalogItem) => {
    const draft: CatalogDraft = {};
    for (const field of catalogFields[catalogType]) {
      const value = item[field.name as keyof CatalogItem];
      draft[field.name] = field.name === "incluye" && Array.isArray(value)
        ? value.join("\n")
        : typeof value === "boolean" ? value : value == null ? "" : String(value);
    }
    setEditingCatalogId(item.id);
    setCatalogDraft(draft);
  };

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !categoryDraft.trim()) return;
    const saved = await runAction(
      () => saveAdminCategory(session.token, null, { nombre: categoryDraft.trim() }),
      "Categoría creada.",
      "catalogos",
    );
    if (saved) setCategoryDraft("");
  };

  const saveSubcategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !subcategoryDraft.category_id || !subcategoryDraft.nombre.trim()) return;
    const saved = await runAction(
      () => saveAdminSubcategory(session.token, null, {
        category_id: Number(subcategoryDraft.category_id),
        nombre: subcategoryDraft.nombre.trim(),
      }),
      "Subcategoría creada.",
      "catalogos",
    );
    if (saved) setSubcategoryDraft({ category_id: "", nombre: "" });
  };

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-story">
          <button className="auth-brand" type="button" onClick={onClose}>
            <AdminBrand light />
          </button>
          <div className="auth-story-copy">
            <span className="kicker kicker-light">Administración</span>
            <h1>Gestiona tu operación desde un solo lugar.</h1>
            <p>Solicitudes, proyectos, pagos, agenda y contenido de tu web.</p>
          </div>
          <small>© 2025 DigitalPyme. Hecho en Perú.</small>
        </section>
        <section className="auth-form-wrap">
          <button className="auth-close" type="button" aria-label="Volver a la página" onClick={onClose}>×</button>
          <form className="auth-form" onSubmit={login}>
            <span className="kicker">Acceso privado</span>
            <h2>Panel administrador</h2>
            <p>Ingresa con tu cuenta administradora.</p>
            <label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <p className="form-status error">{error}</p>}
            <button className="button" type="submit" disabled={loginBusy}>{loginBusy ? "Ingresando..." : "Iniciar sesión"}</button>
          </form>
        </section>
      </main>
    );
  }

  const projectStatuses = [
    { key: "planificacion", label: "Planificación", color: "#9db9a8" },
    { key: "en_progreso", label: "En progreso", color: "#c9f45b" },
    { key: "revision", label: "En revisión", color: "#779b76" },
    { key: "completado", label: "Completados", color: "#294545" },
    { key: "pausado", label: "Pausados", color: "#d8ded5" },
  ];
  const projectStatusData = projectStatuses.map((status) => ({
    ...status,
    count: dashboard?.proyectos_por_estado[status.key] ?? 0,
  }));
  const projectStatusTotal = projectStatusData.reduce((sum, status) => sum + status.count, 0);
  let statusChartEnd = 0;
  const projectStatusGradient = projectStatusData.map((status) => {
    const start = statusChartEnd;
    statusChartEnd += projectStatusTotal > 0 ? (status.count / projectStatusTotal) * 100 : 0;
    return `${status.color} ${start}% ${statusChartEnd}%`;
  }).join(", ");
  const recentLeads = [...leads]
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="portal-shell admin-shell">
      <aside className="portal-sidebar">
        <AdminBrand light />
        <nav>
          {tabs.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              <span aria-hidden="true">{item.icon === "grid" ? "▦" : item.icon === "message" ? "✉" : item.icon === "spark" ? "✦" : item.icon === "calendar" ? "▣" : item.icon === "money" ? "S/" : "▤"}</span>
              {item.label}
              {item.id === "pagos" && dashboard?.pagos_por_verificar ? <i>{dashboard.pagos_por_verificar}</i> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="account"><span>{session.usuario.name.slice(0, 2).toUpperCase()}</span><p><b>{session.usuario.name}</b>{session.usuario.email}</p></div>
          <button type="button" onClick={() => void logout()}>Cerrar sesión</button>
          <button type="button" onClick={onClose}>Volver al sitio</button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <button className="mobile-portal-brand" type="button" onClick={onClose}>
            <AdminBrand />
          </button>
          <div><span>{session.usuario.name}</span></div>
        </header>
        <div className="portal-content">
          <div className="portal-heading">
            <div><span>Administración</span><h1>{tabs.find((item) => item.id === tab)?.label}</h1></div>
            {(tab === "resumen" || tab === "agenda") && <input aria-label="Mes" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />}
            <button className="button button-secondary" type="button" disabled={loading} onClick={() => void refresh()}>{loading ? "Actualizando..." : "Actualizar"}</button>
          </div>
          {error && <p className="form-status error">{error}</p>}
          {notice && <p className="form-status success">{notice}</p>}
          {loading && <p>Cargando información...</p>}

          {tab === "resumen" && dashboard && (
            <>
              <div className="admin-dashboard-kpis">
                <article className="admin-kpi-card admin-kpi-featured">
                  <div><span className="card-label">Ingresos confirmados</span><span className="admin-kpi-icon">S/</span></div>
                  <strong>S/ {formatCurrency(dashboard.ingresos_confirmados)}</strong>
                  <p>Pagos verificados en el sistema</p>
                </article>
                <article className="admin-kpi-card">
                  <span className="card-label">Solicitudes nuevas</span>
                  <strong>{dashboard.leads_nuevos}</strong>
                  <p>{dashboard.leads_total} solicitudes recibidas</p>
                </article>
                <article className="admin-kpi-card">
                  <span className="card-label">Proyectos en progreso</span>
                  <strong>{dashboard.proyectos_en_progreso}</strong>
                  <p>{dashboard.proyectos_total} proyectos en total</p>
                </article>
                <article className="admin-kpi-card">
                  <span className="card-label">Pagos por verificar</span>
                  <strong>{dashboard.pagos_por_verificar}</strong>
                  <p>{dashboard.cotizaciones_pendientes} cotizaciones por responder</p>
                </article>
              </div>

              <div className="admin-dashboard-grid">
                <section className="portal-panel admin-dashboard-chart-panel">
                  <div className="panel-head">
                    <div><h2>Proyectos por estado</h2><p>Distribución actual de los proyectos de clientes.</p></div>
                    <span className="admin-chart-total">{dashboard.proyectos_total} en total</span>
                  </div>
                  {projectStatusTotal === 0 ? (
                    <div className="admin-chart-empty"><span>✦</span><p>Aún no hay proyectos para mostrar.</p></div>
                  ) : (
                    <div className="admin-status-chart">
                      <div className="admin-status-donut" style={{ background: `conic-gradient(${projectStatusGradient})` }}>
                        <div><strong>{projectStatusTotal}</strong><span>proyectos</span></div>
                      </div>
                      <div className="admin-status-legend">
                        {projectStatusData.map((status) => (
                          <div key={status.key}><i style={{ background: status.color }} /><span>{status.label}</span><b>{status.count}</b></div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="portal-panel admin-operations-panel">
                  <div className="panel-head"><div><h2>Resumen de operación</h2><p>Indicadores del mes seleccionado.</p></div></div>
                  <div className="admin-operation-item"><span className="admin-operation-icon"><span>▣</span></span><p><b>Reservas de agenda</b><small>Este mes</small></p><strong>{dashboard.reservas_del_mes}</strong></div>
                  <div className="admin-operation-item"><span className="admin-operation-icon"><span>↻</span></span><p><b>Rotación de inventario</b><small>{dashboard.inventario?.productos_bajo_reorden ?? 0} bajo reorden · {dashboard.inventario?.productos_agotados ?? 0} agotados</small></p><strong>{dashboard.inventario?.rotacion.toFixed(2) ?? "0.00"}x</strong></div>
                  <div className="admin-operation-item"><span className="admin-operation-icon"><span>▤</span></span><p><b>Cupos disponibles</b><small>{projectCapacity?.reserved ?? 0} reservados este mes</small></p><strong>{projectCapacity?.available ?? 0}</strong></div>
                </section>
              </div>

              <section className="portal-panel admin-recent-leads">
                <div className="panel-head">
                  <div><h2>Solicitudes recientes</h2><p>Últimos contactos recibidos desde la web.</p></div>
                  <button type="button" onClick={() => setTab("solicitudes")}>Ver solicitudes →</button>
                </div>
                {recentLeads.length === 0 ? <p>Aún no hay solicitudes para mostrar.</p> : (
                  <>
                    <div className="admin-lead-table-head"><span>Cliente</span><span>Servicio</span><span>Fecha</span><span>Estado</span></div>
                    {recentLeads.map((lead) => (
                      <div className="admin-lead-table-row" key={lead.id}>
                        <span className="admin-lead-name"><i>{lead.nombre.slice(0, 1).toUpperCase()}</i><b>{lead.nombre}<small>{lead.email ?? lead.telefono ?? "Sin contacto"}</small></b></span>
                        <span>{lead.servicio}</span>
                        <span>{new Date(lead.created_at).toLocaleDateString("es-PE")}</span>
                        <span className={`admin-lead-status status-${lead.estado}`}>{lead.estado.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </>
                )}
              </section>

              {projectCapacity && (
                <div className="portal-panel admin-capacity-panel">
                  <div className="panel-head"><div><h2>Cupos de proyectos del mes</h2><p>{projectCapacity.reserved} reservados · {projectCapacity.available} disponibles</p></div></div>
                  <form className="quote-fields" onSubmit={(event) => void submitCapacity(event)}>
                    <label>Capacidad mensual<input type="number" min={projectCapacity.reserved} max="1000" required value={capacityDraft} onChange={(event) => setCapacityDraft(event.target.value)} /></label>
                    <button className="button" type="submit">Actualizar cupos</button>
                  </form>
                  {projectCapacity.alerta_pocos_cupos && <p className="form-status error">Alerta: quedan pocos cupos de proyectos este mes.</p>}
                </div>
              )}
            </>
          )}

          {tab === "solicitudes" && (
            <div className="portal-panel">
              <div className="panel-head"><div><h2>Solicitudes y cotizaciones</h2><p>Actualiza el seguimiento y gestiona las propuestas de cada cliente.</p></div></div>
              {leads.length === 0 && <p>No hay solicitudes registradas.</p>}
              {leads.map((lead) => (
                <article className="payment-row" key={lead.id}>
                  <span><span aria-hidden="true">●</span></span>
                  <p><b>{lead.nombre}{lead.empresa ? ` · ${lead.empresa}` : ""}</b>{lead.email ?? lead.telefono ?? "Sin contacto"} · {lead.servicio} · {new Date(lead.created_at).toLocaleDateString("es-PE")}</p>
                  <strong>{lead.inversion_estimada == null ? "A cotizar" : `Subtotal publicado: S/ ${formatCurrency(lead.inversion_estimada)}`}</strong>
                  <select aria-label={`Estado de solicitud ${lead.nombre}`} value={lead.estado} onChange={(event) => {
                    if (!session) return;
                    void runAction(async () => {
                      const updated = await updateAdminLead(session.token, lead.id, event.target.value as AdminLead["estado"]);
                      setLeads((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
                    }, "Estado de solicitud actualizado.", "solicitudes");
                  }}>
                    {["nuevo", "contactado", "cotizado", "ganado", "perdido"].map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <button className="button button-secondary" type="button" onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                    {expandedLeadId === lead.id ? "Cerrar" : "Cotizaciones"}
                  </button>
                  {!lead.client && lead.email && <button className="button button-secondary" type="button" onClick={() => {
                    if (!session || !window.confirm(`¿Crear el acceso de cliente para ${lead.email}?`)) return;
                    void runAction(async () => {
                      await convertAdminLeadToClient(session.token, lead.id);
                    }, "Acceso de cliente creado. Define su contraseña con el comando client:password.", "solicitudes");
                  }}>Crear acceso cliente</button>}
                  {lead.client && <span className="form-status success">Acceso de cliente creado</span>}
                  {lead.mensaje && <p className="form-status">{lead.mensaje}</p>}
                  {expandedLeadId === lead.id && (
                    <div className="portal-panel">
                      <h3>Propuestas de {lead.nombre}</h3>
                      {lead.cotizaciones.map((quote) => (
                        <div className="payment-row" key={quote.id}>
                          <span><IconCheck /></span>
                          <p><b>{quote.servicio}</b>{quote.descripcion}</p>
                          <strong>{quote.estado === "borrador" && Number(quote.monto) === 0 ? "A cotizar" : `S/ ${formatCurrency(quote.monto)}`}</strong>
                          <select aria-label={`Estado cotización ${quote.servicio}`} value={quote.estado} onChange={(event) => void changeQuoteStatus(quote, event.target.value as AdminQuote["estado"])}>
                            {["borrador", "enviada", "aceptada", "rechazada"].map((state) => <option key={state} value={state}>{state}</option>)}
                          </select>
                        </div>
                      ))}
                      {lead.cotizaciones.length === 0 && <p>Aún no hay cotizaciones.</p>}
                      <form className="auth-form" onSubmit={(event) => void submitQuote(event, lead)}>
                        <h3>Nueva cotización</h3>
                        <label>Servicio<input required maxLength={255} value={quoteDraft.servicio} onChange={(event) => setQuoteDraft({ ...quoteDraft, servicio: event.target.value })} /></label>
                        <label>Descripción<textarea maxLength={2000} value={quoteDraft.descripcion} onChange={(event) => setQuoteDraft({ ...quoteDraft, descripcion: event.target.value })} /></label>
                        <label>Monto (S/)<input required type="number" min="0" step="0.01" value={quoteDraft.monto} onChange={(event) => setQuoteDraft({ ...quoteDraft, monto: event.target.value })} /></label>
                        <button className="button" type="submit">Crear cotización</button>
                      </form>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {tab === "proyectos" && (
            <div className="portal-panel">
              <div className="panel-head"><div><h2>Proyectos de clientes</h2><p>Actualiza el estado y el progreso visible en el portal del cliente.</p></div></div>
              {projects.length === 0 && <p>No hay proyectos registrados.</p>}
              {projects.map((project) => (
                <div className="payment-row" key={project.id}>
                  <span><span aria-hidden="true">◆</span></span>
                  <p><b>{project.nombre}</b>{project.client?.nombre ?? "Cliente"}{project.client?.empresa ? ` · ${project.client.empresa}` : ""}</p>
                  <strong>{project.progreso}%</strong>
                  <select aria-label={`Estado proyecto ${project.nombre}`} value={project.estado} onChange={(event) => {
                    if (!session) return;
                    void runAction(async () => {
                      const updated = await updateAdminProject(session.token, project.id, {
                        estado: event.target.value,
                        progreso: project.progreso,
                      });
                      setProjects((items) => items.map((item) => item.id === updated.id ? updated : item));
                    }, "Estado del proyecto actualizado.", "proyectos");
                  }}>
                    {["planificacion", "en_progreso", "revision", "completado", "pausado"].map((state) => <option key={state} value={state}>{state.replace(/_/g, " ")}</option>)}
                  </select>
                  <label>Progreso
                    <input aria-label={`Progreso ${project.nombre}`} type="number" min="0" max="100" value={project.progreso} onChange={(event) => {
                      const progreso = Number(event.target.value);
                      setProjects((items) => items.map((item) => item.id === project.id ? { ...item, progreso } : item));
                    }} onBlur={() => {
                      if (!session) return;
                      const latest = projects.find((item) => item.id === project.id);
                      if (latest) void runAction(() => updateAdminProject(session.token, project.id, { estado: latest.estado, progreso: latest.progreso }), "Progreso del proyecto actualizado.", "proyectos");
                    }} />
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === "agenda" && (
            <>
              <div className="portal-panel">
                <div className="panel-head"><div><h2>Reservas de agenda</h2><p>Reservas activas del mes seleccionado.</p></div></div>
                {reservations.length === 0 && <p>No hay reservas activas este mes.</p>}
                {reservations.map((reservation) => (
                  <div className="payment-row" key={reservation.id}>
                    <span><span aria-hidden="true">◷</span></span>
                    <p><b>{reservation.nombre}</b>{reservation.email ?? reservation.telefono ?? "Sin contacto"}</p>
                    <strong>{new Date(`${reservation.slot.date}T00:00:00`).toLocaleDateString("es-PE")} · {reservation.slot.time.slice(0, 5)}</strong>
                    <button className="button button-secondary" type="button" onClick={() => {
                      if (session && window.confirm("¿Cancelar esta reserva y liberar el horario?")) {
                        void runAction(() => cancelAdminReservation(session.token, reservation.id), "Reserva cancelada y horario liberado.", "agenda");
                      }
                    }}>Cancelar</button>
                  </div>
                ))}
              </div>
              <div className="portal-panel">
                <div className="panel-head"><div><h2>Horarios disponibles</h2><p>Configura capacidad y disponibilidad de la agenda.</p></div></div>
                <form className="quote-fields" onSubmit={(event) => void submitSlot(event)}>
                  <label>Fecha<input type="date" required min={localDate()} value={slotDraft.date} onChange={(event) => setSlotDraft({ ...slotDraft, date: event.target.value })} /></label>
                  <label>Hora<select value={slotDraft.time} onChange={(event) => setSlotDraft({ ...slotDraft, time: event.target.value })}>{["09:00", "10:30", "15:00", "16:30"].map((time) => <option key={time}>{time}</option>)}</select></label>
                  <label>Capacidad<input type="number" min="1" max="100" required value={slotDraft.capacity} onChange={(event) => setSlotDraft({ ...slotDraft, capacity: event.target.value })} /></label>
                  <label>Horario activo<input type="checkbox" checked={slotDraft.active} onChange={(event) => setSlotDraft({ ...slotDraft, active: event.target.checked })} /></label>
                  <button className="button" type="submit">Guardar horario</button>
                </form>
                {slots.map((slot) => (
                  <div className="payment-row" key={slot.id}>
                    <span><span aria-hidden="true">◷</span></span>
                    <p><b>{new Date(`${slot.date}T00:00:00`).toLocaleDateString("es-PE")} · {slot.time.slice(0, 5)}</b>{slot.active ? "Activo" : "Inactivo"}</p>
                    <strong>{slot.available} / {slot.capacity} disponibles</strong>
                    <button type="button" onClick={() => setSlotDraft({
                      date: slot.date,
                      time: slot.time.slice(0, 5),
                      capacity: String(slot.capacity),
                      active: slot.active,
                    })}>Editar horario</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "pagos" && (
            <div className="portal-panel">
              <div className="panel-head"><div><h2>Pagos y comprobantes</h2><p>Verifica comprobantes de transferencias y pagos manuales por Yape/Plin.</p></div></div>
              {payments.length === 0 && <p>No hay pagos registrados.</p>}
              {payments.map((payment) => (
                <div className="payment-row" key={payment.id}>
                  <span><span aria-hidden="true">S/</span></span>
                  <p><b>{payment.project.nombre} · {payment.project.client.nombre}</b>{payment.milestone?.titulo ?? "Proyecto completo"} · {payment.method === "card" ? "Tarjeta" : payment.method === "yape_plin" ? "Yape/Plin" : "Transferencia"} · {payment.status.replace(/_/g, " ")}</p>
                  <strong>S/ {formatCurrency(payment.amount)}</strong>
                  {payment.receipt && <button type="button" disabled={downloadingId === payment.receipt.id} onClick={() => void downloadReceipt(payment)}>
                    {downloadingId === payment.receipt.id ? "Descargando..." : "Ver comprobante"}
                  </button>}
                  {payment.status === "comprobante_enviado" && (
                    <>
                      <button className="button" type="button" onClick={() => session && void runAction(() => updateAdminPayment(session.token, payment.id, "pagado"), "Pago verificado.", "pagos")}>Verificar</button>
                      <button className="button button-secondary" type="button" onClick={() => session && void runAction(() => updateAdminPayment(session.token, payment.id, "rechazado"), "Pago rechazado.", "pagos")}>Rechazar</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "logistica" && <AdminLogistics token={session.token} />}

          {tab === "configuracion" && (
            <form className="portal-panel auth-form admin-settings-form" onSubmit={(event) => void submitSiteSettings(event)}>
              <div className="panel-head"><div><h2>SEO y URL pública</h2><p>Edita los metadatos de la página de inicio y su URL amigable.</p></div></div>
              <label>Título SEO<input required maxLength={70} value={siteSettings.seo.title} onChange={(event) => setSiteSettings({ ...siteSettings, seo: { ...siteSettings.seo, title: event.target.value } })} /></label>
              <label>Meta descripción<textarea required maxLength={160} value={siteSettings.seo.description} onChange={(event) => setSiteSettings({ ...siteSettings, seo: { ...siteSettings.seo, description: event.target.value } })} /></label>
              <label>Slug de inicio<input maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="dejar vacío para usar /" value={siteSettings.seo.slug ?? ""} onChange={(event) => setSiteSettings({ ...siteSettings, seo: { ...siteSettings.seo, slug: event.target.value } })} /><small>Solo minúsculas, números y guiones. El servidor frontal debe reescribir esa ruta a la SPA.</small></label>
              <label>Imagen Open Graph (URL pública)<input type="url" value={siteSettings.seo.og_image} onChange={(event) => setSiteSettings({ ...siteSettings, seo: { ...siteSettings.seo, og_image: event.target.value } })} /></label>

              <div className="panel-head"><div><h2>Marca y tema</h2><p>El tema inicial conserva los colores actuales de DigitalPyme.</p></div></div>
              <label>Logo (URL de imagen)<input type="url" value={siteSettings.brand.logo_url} onChange={(event) => setSiteSettings({ ...siteSettings, brand: { logo_url: event.target.value } })} /></label>
              <div className="panel-head"><div><h2>Datos de contacto</h2><p>El número se muestra públicamente y se usa en los enlaces de WhatsApp.</p></div></div>
              <label>WhatsApp público<input type="tel" inputMode="tel" pattern="\+?[1-9][0-9]{7,14}" placeholder="+51XXXXXXXXX" value={siteSettings.contact.whatsapp_phone ?? ""} onChange={(event) => setSiteSettings({
                ...siteSettings, contact: { ...siteSettings.contact, whatsapp_phone: event.target.value || null },
              })} /><small>Incluye el código de país, por ejemplo +51 seguido del número. Déjalo vacío para ocultar el acceso a WhatsApp.</small></label>
              <div className="admin-color-fields">
                {([
                  ["dark", "Verde oscuro"],
                  ["lime", "Verde lima"],
                  ["cream", "Crema"],
                ] as const).map(([key, label]) => (
                  <label key={key}>{label}<input type="color" value={siteSettings.theme[key]} onChange={(event) => setSiteSettings({ ...siteSettings, theme: { ...siteSettings.theme, [key]: event.target.value } })} /></label>
                ))}
              </div>
              <label>Tipografía de texto
                <select value={siteSettings.theme.font_sans} onChange={(event) => setSiteSettings({ ...siteSettings, theme: { ...siteSettings.theme, font_sans: event.target.value } })}>
                    {["Manrope", "DM Sans", "Inter", "Lato", "Montserrat"].map((font) => <option key={font}>{font}</option>)}
                </select>
              </label>
              <label>Tipografía de títulos
                <select value={siteSettings.theme.font_display} onChange={(event) => setSiteSettings({ ...siteSettings, theme: { ...siteSettings.theme, font_display: event.target.value } })}>
                    {["Playfair Display", "DM Serif Display", "Georgia", "Inter", "Lato", "Manrope", "Montserrat"].map((font) => <option key={font}>{font}</option>)}
                </select>
              </label>

              <div className="panel-head"><div><h2>Modalidad y cobertura</h2><p>La modalidad define cómo se atienden los servicios digitales. Las zonas de envío aplican a tiendas en línea.</p></div></div>
              <label>Modalidad de servicios digitales
                <select value={siteSettings.coverage.digital_mode} onChange={(event) => setSiteSettings({
                  ...siteSettings,
                  coverage: { ...siteSettings.coverage, digital_mode: event.target.value as SiteSettings["coverage"]["digital_mode"] },
                })}>
                  <option value="virtual_presencial_lima">Virtual en Perú y presencial en Lima</option>
                  <option value="virtual">Virtual en todo el Perú</option>
                </select>
              </label>
              <h3>Zonas de envío para tiendas en línea</h3>
              <p>Configura el costo base del envío estándar por ubicación y el plazo referencial. Express y same-day suman la diferencia de su tarifa frente a la estándar. Estas opciones se consultan en <code>/api/cobertura</code>.</p>
              {siteSettings.coverage.shipping_zones.map((zone, index) => (
                <div className="admin-zone-row" key={`${index}-${zone.location}`}>
                  <label>Ubicación<input required maxLength={120} value={zone.location} onChange={(event) => setSiteSettings({
                    ...siteSettings,
                    coverage: {
                      ...siteSettings.coverage,
                      shipping_zones: siteSettings.coverage.shipping_zones.map((item, itemIndex) => itemIndex === index ? { ...item, location: event.target.value } : item),
                    },
                  })} /></label>
                  <label>Base estándar (S/)<input type="number" min="0" max="999999" step="0.01" required value={zone.fee} onChange={(event) => setSiteSettings({
                    ...siteSettings,
                    coverage: {
                      ...siteSettings.coverage,
                      shipping_zones: siteSettings.coverage.shipping_zones.map((item, itemIndex) => itemIndex === index ? { ...item, fee: event.target.value } : item),
                    },
                  })} /></label>
                  <label>Plazo (días)<input type="number" min="0" max="365" value={zone.delivery_days ?? ""} onChange={(event) => setSiteSettings({
                    ...siteSettings,
                    coverage: {
                      ...siteSettings.coverage,
                      shipping_zones: siteSettings.coverage.shipping_zones.map((item, itemIndex) => itemIndex === index ? { ...item, delivery_days: event.target.value === "" ? null : Number(event.target.value) } : item),
                    },
                  })} /></label>
                  <button className="button button-secondary" type="button" onClick={() => setSiteSettings({
                    ...siteSettings,
                    coverage: { ...siteSettings.coverage, shipping_zones: siteSettings.coverage.shipping_zones.filter((_, itemIndex) => itemIndex !== index) },
                  })}>Quitar zona</button>
                </div>
              ))}
              <button className="button button-secondary" type="button" onClick={addShippingZone}>Agregar zona de envío</button>

              <h3>Opciones de envío</h3>
              <p>Tarifas y tiempos de envío de la tienda en línea. Same-day solo se ofrece para Lima.</p>
              {siteSettings.coverage.shipping_methods.map((method, index) => (
                <div className="admin-zone-row" key={method.key}>
                  <label>{method.nombre} · Costo (S/)<input type="number" min="0" step="0.01" value={method.cost} onChange={(event) => setSiteSettings({
                    ...siteSettings,
                    coverage: { ...siteSettings.coverage, shipping_methods: siteSettings.coverage.shipping_methods.map((item, itemIndex) => itemIndex === index ? { ...item, cost: event.target.value } : item) },
                  })} /></label>
                  <label>Tiempo estimado (días)<input type="number" min="0" max="365" value={method.delivery_days} onChange={(event) => setSiteSettings({
                    ...siteSettings,
                    coverage: { ...siteSettings.coverage, shipping_methods: siteSettings.coverage.shipping_methods.map((item, itemIndex) => itemIndex === index ? { ...item, delivery_days: Number(event.target.value) } : item) },
                  })} /></label>
                  <label>Disponible<select value={String(method.enabled)} onChange={(event) => setSiteSettings({
                    ...siteSettings,
                    coverage: { ...siteSettings.coverage, shipping_methods: siteSettings.coverage.shipping_methods.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: event.target.value === "true" } : item) },
                  })}><option value="true">Sí</option><option value="false">No</option></select></label>
                </div>
              ))}
              <label>Envío gratis desde (S/)<input type="number" min="0" step="0.01" value={siteSettings.coverage.free_shipping_threshold} onChange={(event) => setSiteSettings({
                ...siteSettings,
                coverage: { ...siteSettings.coverage, free_shipping_threshold: event.target.value },
              })} /></label>

              <div className="panel-head"><div><h2>Garantía y términos</h2><p>Textos informativos editables; confirma las condiciones aplicables en cada propuesta.</p></div></div>
              <label>Borrador de política de privacidad<textarea maxLength={10000} value={siteSettings.legal.privacy ?? ""} onChange={(event) => setSiteSettings({
                ...siteSettings, legal: { ...siteSettings.legal, privacy: event.target.value || null },
              })} /><small>Completa y revisa el texto antes de publicarlo. El enlace solo aparece cuando hay contenido.</small></label>
              <label>Publicar política de privacidad<input type="checkbox" checked={siteSettings.legal.privacy_published} onChange={(event) => setSiteSettings({
                ...siteSettings, legal: { ...siteSettings.legal, privacy_published: event.target.checked },
              })} /><small>Al activarlo, el borrador se mostrará en el pie de página. Verifica identidad legal, proveedores y plazos antes de publicarlo.</small></label>
              <label>Garantía y devoluciones<textarea maxLength={5000} value={siteSettings.legal.warranty} onChange={(event) => setSiteSettings({
                ...siteSettings, legal: { ...siteSettings.legal, warranty: event.target.value },
              })} /></label>
              <label>Política de devoluciones para pedidos<textarea maxLength={5000} value={siteSettings.legal.returns} onChange={(event) => setSiteSettings({
                ...siteSettings, legal: { ...siteSettings.legal, returns: event.target.value },
              })} /></label>
              <label>Términos de contratación<textarea maxLength={5000} value={siteSettings.legal.terms} onChange={(event) => setSiteSettings({
                ...siteSettings, legal: { ...siteSettings.legal, terms: event.target.value },
              })} /></label>

              <button className="button" type="submit">Guardar configuración</button>
            </form>
          )}

          {tab === "catalogos" && (
            <div className="portal-panel">
              <div className="panel-head">
                <div><h2>Contenido de la web</h2><p>Administra servicios, proyectos del portafolio y testimonios publicados.</p></div>
                <button className="button" type="button" onClick={newCatalogItem}>Nuevo elemento</button>
                <select aria-label="Tipo de contenido" value={catalogType} onChange={(event) => {
                  setCatalogType(event.target.value as AdminCatalogType);
                  setEditingCatalogId(null);
                  setCatalogDraft({ activo: true, orden: "1" });
                }}>
                  <option value="servicios">Servicios</option><option value="portafolio">Portafolio</option><option value="testimonios">Testimonios</option>
                </select>
              </div>
              <form className="auth-form" onSubmit={(event) => void submitCatalogItem(event)}>
                <h3>{editingCatalogId === null ? "Añadir elemento" : "Editar elemento"}</h3>
                {catalogFields[catalogType].map((field) => (
                  <label key={field.name}>
                    {field.label}
                    {field.type === "checkbox" ? (
                      <input type="checkbox" checked={Boolean(catalogDraft[field.name])} onChange={(event) => setCatalogDraft({ ...catalogDraft, [field.name]: event.target.checked })} />
                    ) : field.type === "textarea" ? (
                      <textarea required={!["descripcion", "descripcion_larga", "incluye"].includes(field.name)} value={String(catalogDraft[field.name] ?? "")} onChange={(event) => setCatalogDraft({ ...catalogDraft, [field.name]: event.target.value })} />
                    ) : field.type === "select" ? (
                      <select value={String(catalogDraft[field.name] ?? "")} onChange={(event) => setCatalogDraft({
                        ...catalogDraft,
                        [field.name]: event.target.value,
                        ...(field.name === "category_id" ? { subcategory_id: "" } : {}),
                      })}>
                        <option value="">Sin asignar</option>
                        {field.name === "etiqueta" && ["Nuevo", "Más vendido", "-20%", "Destacado"].map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                        {field.name === "category_id" && categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
                        {field.name === "subcategory_id" && categories.flatMap((category) => category.subcategories ?? [])
                          .filter((subcategory) => !catalogDraft.category_id || subcategory.category_id === Number(catalogDraft.category_id))
                          .map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.nombre}</option>)}
                        {field.name === "related_service_id" && adminServices.map((service) => <option key={service.id ?? service.nombre} value={service.id}>{service.nombre}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        required={!["precio_desde", "orden", "imagen_alt", "slug"].includes(field.name)}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.name === "precio_desde" ? "0.01" : undefined}
                        value={String(catalogDraft[field.name] ?? "")}
                        onChange={(event) => setCatalogDraft({ ...catalogDraft, [field.name]: event.target.value })}
                      />
                    )}
                  </label>
                ))}
                <div className="quote-nav">
                  {editingCatalogId !== null && <button className="button button-secondary" type="button" onClick={() => { setEditingCatalogId(null); setCatalogDraft({}); }}>Cancelar edición</button>}
                  <button className="button" type="submit">Guardar</button>
                </div>
              </form>
              {catalogItems.map((item) => (
                <div className="payment-row" key={item.id}>
                  <span><span aria-hidden="true">•</span></span>
                  <p><b>{String(("nombre" in item ? item.nombre : null) ?? ("autor" in item ? item.autor : null) ?? ("contenido" in item ? item.contenido : ""))}</b>{"categoria" in item ? item.categoria : item.activo ? "Publicado" : "Oculto"}</p>
                  <strong>{"precio_desde" in item && item.precio_desde != null ? `S/ ${formatCurrency(item.precio_desde)}` : `#${item.orden}`}</strong>
                  <button className="button button-secondary" type="button" onClick={() => editCatalogItem(item)}>Editar</button>
                  <button type="button" onClick={() => {
                    if (session && window.confirm("¿Eliminar este elemento?")) {
                      void runAction(() => deleteAdminCatalogItem(session.token, catalogType, item.id), "Elemento eliminado.", "catalogos");
                    }
                  }}>Eliminar</button>
                </div>
              ))}
              <div className="portal-panel">
                <div className="panel-head"><div><h2>Categorías y subcategorías</h2><p>Organiza los servicios en niveles; puedes asignarlos al editar cada servicio.</p></div></div>
                <form className="quote-fields" onSubmit={(event) => void saveCategory(event)}>
                  <label><span>Nueva categoría</span><input required maxLength={120} value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} /></label>
                  <button className="button" type="submit">Añadir categoría</button>
                </form>
                <form className="quote-fields" onSubmit={(event) => void saveSubcategory(event)}>
                  <label><span>Categoría</span><select required value={subcategoryDraft.category_id} onChange={(event) => setSubcategoryDraft({ ...subcategoryDraft, category_id: event.target.value })}>
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
                  </select></label>
                  <label><span>Nueva subcategoría</span><input required maxLength={120} value={subcategoryDraft.nombre} onChange={(event) => setSubcategoryDraft({ ...subcategoryDraft, nombre: event.target.value })} /></label>
                  <button className="button" type="submit">Añadir subcategoría</button>
                </form>
                {categories.map((category) => (
                  <div className="payment-row" key={category.id}>
                    <span>•</span><p><b>{category.nombre}</b>{(category.subcategories ?? []).map((subcategory) => subcategory.nombre).join(" · ") || "Sin subcategorías"}</p>
                    <button type="button" onClick={() => {
                      if (session && window.confirm("¿Eliminar esta categoría y sus subcategorías? Los servicios conservarán el resto de sus datos.")) {
                        void runAction(() => deleteAdminCategory(session.token, category.id), "Categoría eliminada.", "catalogos");
                      }
                    }}>Eliminar</button>
                    {(category.subcategories ?? []).map((subcategory) => (
                      <button key={subcategory.id} type="button" onClick={() => {
                        if (session && window.confirm(`¿Eliminar la subcategoría "${subcategory.nombre}"?`)) {
                          void runAction(() => deleteAdminSubcategory(session.token, subcategory.id), "Subcategoría eliminada.", "catalogos");
                        }
                      }}>Quitar {subcategory.nombre}</button>
                    ))}
                  </div>
                ))}
              </div>
              <div className="portal-panel">
                <div className="panel-head"><div><h2>Reseñas pendientes y publicadas</h2><p>Solo las aprobadas aparecen en la página pública del servicio.</p></div></div>
                {reviews.length === 0 && <p>Aún no hay reseñas recibidas.</p>}
                {reviews.map((review) => (
                  <div className="payment-row" key={review.id}>
                    <span aria-label={`${review.calificacion} de 5 estrellas`}>{"★".repeat(review.calificacion)}{"☆".repeat(5 - review.calificacion)}</span>
                    <p><b>{review.titulo || review.service?.nombre || review.nombre}</b>{review.nombre} · {review.service?.nombre}: {review.comentario}</p>
                    <strong>{review.aprobada ? "Publicada" : "Pendiente"}</strong>
                    <button type="button" onClick={() => {
                      if (session) void runAction(() => moderateAdminReview(session.token, review.id, !review.aprobada), review.aprobada ? "Reseña ocultada." : "Reseña aprobada.", "catalogos");
                    }}>{review.aprobada ? "Ocultar" : "Aprobar"}</button>
                    <button type="button" onClick={() => {
                      if (session && window.confirm("¿Eliminar esta reseña?")) void runAction(() => deleteAdminReview(session.token, review.id), "Reseña eliminada.", "catalogos");
                    }}>Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <nav className="portal-mobile-nav">
          {tabs.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.icon === "grid" ? "▦" : item.icon === "message" ? "✉" : item.icon === "spark" ? "✦" : item.icon === "calendar" ? "▣" : "S/"}{item.label}</button>
          ))}
        </nav>
      </main>
    </div>
  );
}

function IconCheck() {
  return <span aria-hidden="true">✓</span>;
}

export default AdminPortal;
