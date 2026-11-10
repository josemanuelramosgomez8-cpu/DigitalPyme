import { useEffect, useState, type FormEvent } from "react";
import {
  getAdminClient,
  getAdminClients,
  sendAdminClientPasswordReset,
  updateAdminClient,
  updateAdminClientPassword,
  updateAdminClientStatus,
  type AdminManagedClient,
} from "./lib/api";

type Props = { token: string; refreshKey: number };
type ClientDraft = { nombre: string; empresa: string; email: string; telefono: string };

function draftFromClient(client: AdminManagedClient): ClientDraft {
  return {
    nombre: client.nombre,
    empresa: client.empresa ?? "",
    email: client.user.email,
    telefono: client.lead?.telefono ?? "",
  };
}

function makeTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const maxValidByte = Math.floor(256 / alphabet.length) * alphabet.length;
  let password = "";

  while (password.length < 20) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < maxValidByte) password += alphabet[byte % alphabet.length];
      if (password.length === 20) break;
    }
  }

  return password;
}

export default function AdminClients({ token, refreshKey }: Props) {
  const [clients, setClients] = useState<AdminManagedClient[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminManagedClient | null>(null);
  const [editing, setEditing] = useState<AdminManagedClient | null>(null);
  const [editDraft, setEditDraft] = useState<ClientDraft | null>(null);
  const [passwordClient, setPasswordClient] = useState<AdminManagedClient | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [forceChange, setForceChange] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadClients = async (term: string, active: () => boolean) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminClients(token, term);
      if (active()) setClients(result);
    } catch (loadError) {
      if (active()) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los clientes.");
    } finally {
      if (active()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => void loadClients(search, () => active), search ? 250 : 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [token, search, refreshKey]);

  const refresh = async () => {
    let active = true;
    await loadClients(search, () => active);
    active = false;
  };

  const showDetails = async (client: AdminManagedClient) => {
    setSelected(client);
    setError("");
    try {
      setSelected(await getAdminClient(token, client.id));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "No se pudo cargar el historial del cliente.");
    }
  };

  const saveClient = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || !editDraft) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateAdminClient(token, editing.id, {
        nombre: editDraft.nombre.trim(),
        empresa: editDraft.empresa.trim() || null,
        email: editDraft.email.trim(),
        telefono: editDraft.telefono.trim() || null,
      });
      setEditing(null);
      setEditDraft(null);
      setNotice("Datos del cliente actualizados.");
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar los datos.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!passwordClient || temporaryPassword.length < 12) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateAdminClientPassword(token, passwordClient.id, {
        password: temporaryPassword,
        password_confirmation: temporaryPassword,
        force_change: forceChange,
      });
      setPasswordClient(null);
      setNotice("Contraseña actualizada. Las sesiones existentes fueron cerradas.");
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo actualizar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const resetPasswordByEmail = async (client: AdminManagedClient) => {
    setError("");
    setNotice("");
    try {
      const result = await sendAdminClientPasswordReset(token, client.id);
      setNotice(result.email_enviado
        ? `Enlace de restablecimiento enviado a ${client.user.email}.`
        : "No se pudo enviar el correo. Verifica la configuración de correo del servidor.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No se pudo enviar el enlace de restablecimiento.");
    }
  };

  const toggleStatus = async (client: AdminManagedClient) => {
    const nextStatus = !client.user.is_active;
    const action = nextStatus ? "activar" : "desactivar";
    if (!window.confirm(`¿${action === "activar" ? "Activar" : "Desactivar"} el acceso de ${client.nombre}?`)) return;
    setError("");
    setNotice("");
    try {
      const result = await updateAdminClientStatus(token, client.id, nextStatus);
      setNotice(result.mensaje);
      await refresh();
      if (selected?.id === client.id) await showDetails(client);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "No se pudo cambiar el estado de la cuenta.");
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setNotice("Contraseña temporal copiada.");
    } catch {
      setError("No se pudo copiar automáticamente. Selecciona y copia la contraseña.");
    }
  };
  const requests = selected?.requests ?? (selected?.lead ? [{
    ...selected.lead,
    servicio: "",
    mensaje: null,
    estado: "nuevo",
    cotizaciones: selected.lead.cotizaciones ?? [],
  }] : []);

  return (
    <section className="admin-clients">
      <div className="portal-panel">
        <div className="panel-head">
          <div><h2>Clientes registrados</h2><p>Administra sus datos, acceso y seguimiento comercial.</p></div>
          <input
            type="search"
            aria-label="Buscar clientes por nombre, correo o teléfono"
            placeholder="Buscar nombre, correo o teléfono"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {error && <p className="form-status error">{error}</p>}
        {notice && <p className="form-status success">{notice}</p>}
        {loading ? <p>Cargando clientes...</p> : clients.length === 0 ? <p>No hay clientes que coincidan con la búsqueda.</p> : (
          <div className="admin-clients-table-wrap">
            <table className="admin-clients-table">
              <thead><tr><th>Cliente</th><th>Correo</th><th>Teléfono / WhatsApp</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td><strong>{client.nombre}</strong>{client.empresa && <small>{client.empresa}</small>}</td>
                    <td>{client.user.email}</td>
                    <td>{client.lead?.telefono || "Sin teléfono"}</td>
                    <td>{new Date(client.user.created_at).toLocaleDateString("es-PE")}</td>
                    <td><span className={`admin-client-state ${client.user.is_active ? "is-active" : "is-inactive"}`}>{client.user.is_active ? "Activa" : "Bloqueada"}</span></td>
                    <td>
                      <div className="admin-client-actions">
                        <button type="button" onClick={() => void showDetails(client)}>Ver detalle</button>
                        <button type="button" onClick={() => { setEditing(client); setEditDraft(draftFromClient(client)); }}>Editar</button>
                        <button type="button" onClick={() => { setPasswordClient(client); setTemporaryPassword(""); setForceChange(true); }}>Contraseña</button>
                        <button type="button" disabled={!client.user.is_active} onClick={() => void resetPasswordByEmail(client)}>Enviar reset</button>
                        <button type="button" onClick={() => void toggleStatus(client)}>{client.user.is_active ? "Bloquear" : "Activar"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="portal-panel admin-client-history">
          <div className="panel-head">
            <div><h2>Historial de {selected.nombre}</h2><p>{selected.user.email} · {selected.user.is_active ? "Cuenta activa" : "Cuenta bloqueada"}{selected.user.must_change_password ? " · Cambio de contraseña pendiente" : ""}</p></div>
            <button type="button" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
          <section>
            <h3>Solicitudes y cotizaciones</h3>
            {requests.length === 0 ? <p>No hay solicitudes asociadas.</p> : requests.map((request) => (
              <article className="admin-client-history-project" key={request.id}>
                <div><b>{request.servicio || "Solicitud"}</b><span>{request.estado}</span></div>
                <p>{request.nombre} · {request.email ?? "Sin correo"} · {request.telefono ?? "Sin teléfono"} · {new Date(request.created_at).toLocaleDateString("es-PE")}</p>
                {request.mensaje && <p>{request.mensaje}</p>}
                {request.cotizaciones.length === 0 ? <p>Sin cotizaciones asociadas.</p> : request.cotizaciones.map((quote) => (
                  <div className="admin-client-history-row" key={quote.id}><b>{quote.servicio}</b><span>{quote.estado}</span><strong>S/ {Number(quote.monto).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong></div>
                ))}
              </article>
            ))}
          </section>
          <section>
            <h3>Proyectos asociados</h3>
            {(selected.projects ?? []).length === 0 ? <p>No hay proyectos asociados.</p> : (selected.projects ?? []).map((project) => (
              <article className="admin-client-history-project" key={project.id}>
                <div><b>{project.nombre}</b><span>{project.estado.replace(/_/g, " ")}</span></div>
                {project.cotizacion && <p>Cotización: {project.cotizacion.servicio} · S/ {Number(project.cotizacion.monto).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>}
                <h4>Pagos verificados</h4>
                {(project.payments ?? []).length === 0 ? <p>Sin pagos verificados.</p> : project.payments?.map((payment) => (
                  <div className="admin-client-history-row" key={payment.id}>
                    <b>{payment.milestone?.titulo ?? "Proyecto"}</b>
                    <span>{payment.method.replace(/_/g, " ")} · {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString("es-PE") : "Verificado"}</span>
                    <strong>S/ {Number(payment.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong>
                  </div>
                ))}
              </article>
            ))}
          </section>
        </div>
      )}

      {editing && editDraft && (
        <div className="admin-client-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) { setEditing(null); setEditDraft(null); }
        }}>
          <form className="portal-panel auth-form admin-client-modal" role="dialog" aria-modal="true" aria-labelledby="edit-client-title" onSubmit={(event) => void saveClient(event)}>
            <div className="panel-head"><div><h2 id="edit-client-title">Editar datos del cliente</h2><p>Los cambios también se reflejarán en su solicitud asociada.</p></div><button type="button" onClick={() => { setEditing(null); setEditDraft(null); }}>Cerrar</button></div>
            <label>Nombre completo<input required maxLength={255} value={editDraft.nombre} onChange={(event) => setEditDraft({ ...editDraft, nombre: event.target.value })} /></label>
            <label>Correo electrónico<input type="email" required maxLength={255} value={editDraft.email} onChange={(event) => setEditDraft({ ...editDraft, email: event.target.value })} /></label>
            <label>Teléfono / WhatsApp<input maxLength={40} value={editDraft.telefono} onChange={(event) => setEditDraft({ ...editDraft, telefono: event.target.value })} /></label>
            <label>Empresa<input maxLength={255} value={editDraft.empresa} onChange={(event) => setEditDraft({ ...editDraft, empresa: event.target.value })} /></label>
            <button className="button" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
          </form>
        </div>
      )}

      {passwordClient && (
        <div className="admin-client-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPasswordClient(null);
        }}>
          <form className="portal-panel auth-form admin-client-modal" role="dialog" aria-modal="true" aria-labelledby="client-password-title" onSubmit={(event) => void savePassword(event)}>
            <div className="panel-head"><div><h2 id="client-password-title">Restablecer contraseña</h2><p>Cliente: {passwordClient.nombre} · {passwordClient.user.email}</p></div><button type="button" onClick={() => setPasswordClient(null)}>Cerrar</button></div>
            <label>Contraseña nueva o temporal<input type="text" autoComplete="new-password" minLength={12} required value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} /></label>
            <div className="admin-client-password-actions">
              <button type="button" onClick={() => setTemporaryPassword(makeTemporaryPassword())}>Generar contraseña segura</button>
              <button type="button" disabled={!temporaryPassword} onClick={() => void copyPassword()}>Copiar</button>
            </div>
            <label className="admin-client-checkbox"><input type="checkbox" checked={forceChange} onChange={(event) => setForceChange(event.target.checked)} /> Forzar cambio en el próximo inicio de sesión</label>
            <p className="admin-client-warning">La contraseña se mostrará solo en esta ventana. Compártela con el cliente por un canal seguro; no se envía por correo.</p>
            <button className="button" type="submit" disabled={saving || temporaryPassword.length < 12}>{saving ? "Guardando..." : "Actualizar contraseña"}</button>
          </form>
        </div>
      )}
    </section>
  );
}
