import { useEffect, useState, type FormEvent } from "react";
import {
  downloadStoreOrderReceipt,
  deactivateAdminStoreProduct,
  deleteAdminStoreCoupon,
  deleteAdminStoreProductImage,
  getAdminStore,
  recordAdminStockMovement,
  saveAdminStoreProduct,
  saveAdminStoreCoupon,
  updateAdminStoreOrder,
  updateAdminStorePaymentStatus,
  updateAdminStoreReturn,
  uploadAdminStoreProductImage,
  type AdminStoreData,
  type StoreOrder,
  type StoreCoupon,
  type StoreProduct,
  type StoreReturnRequest,
} from "./lib/api";

const orderStates: StoreOrder["estado"][] = ["recibido", "en_picking", "empacado", "enviado", "entregado"];
const returnStates: StoreReturnRequest["estado"][] = ["solicitada", "aprobada", "recibida", "inspeccionada", "resuelta"];

function money(value: number | string): string {
  return Number(value).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminLogistics({ token }: { token: string }) {
  const [data, setData] = useState<AdminStoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [imageDraft, setImageDraft] = useState<File | null>(null);
  const [productDraft, setProductDraft] = useState({
    sku: "", nombre: "", descripcion: "", categoria: "", precio: "", stock: "0", punto_reorden: "0", ubicacion_almacen: "",
  });
  const [movementDrafts, setMovementDrafts] = useState<Record<number, { tipo: "entrada" | "salida"; cantidad: string; motivo: string }>>({});
  const [orderDrafts, setOrderDrafts] = useState<Record<number, { tracking: string; operation: "in-house" | "3PL"; operator: string }>>({});
  const [returnDrafts, setReturnDrafts] = useState<Record<number, { resolution: "reventa" | "reparacion" | "desecho" | "reembolso"; notes: string }>>({});
  const [couponEditing, setCouponEditing] = useState<number | null>(null);
  const [couponDraft, setCouponDraft] = useState({
    code: "",
    discount_type: "percentage" as StoreCoupon["discount_type"],
    discount_value: "10",
    active: true,
  });

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getAdminStore(token));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el módulo de logística.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [token]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo completar la operación.");
    } finally {
      setBusy(false);
    }
  };

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      ...productDraft,
      precio: Number(productDraft.precio),
      punto_reorden: Number(productDraft.punto_reorden),
    };
    if (editing === null) payload.stock = Number(productDraft.stock);
    await run(async () => {
      const savedProduct = await saveAdminStoreProduct(token, editing, payload);
      setEditing(savedProduct.id);
      if (imageDraft) await uploadAdminStoreProductImage(token, savedProduct.id, imageDraft);
      setEditing(null);
      setImageDraft(null);
      setProductDraft({ sku: "", nombre: "", descripcion: "", categoria: "", precio: "", stock: "0", punto_reorden: "0", ubicacion_almacen: "" });
    }, editing === null ? "Producto creado y stock inicial registrado." : "Producto actualizado.");
  };

  const startEdit = (product: StoreProduct) => {
    setEditing(product.id);
    setImageDraft(null);
    setProductDraft({
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion ?? "",
      categoria: product.categoria ?? "",
      precio: String(product.precio),
      stock: String(product.stock),
      punto_reorden: String(product.punto_reorden),
      ubicacion_almacen: product.ubicacion_almacen ?? "",
    });
  };

  const startCouponEdit = (coupon: StoreCoupon) => {
    setCouponEditing(coupon.id);
    setCouponDraft({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      active: coupon.active,
    });
  };

  const submitCoupon = async (event: FormEvent) => {
    event.preventDefault();
    await run(async () => {
      await saveAdminStoreCoupon(token, couponEditing, {
        ...couponDraft,
        code: couponDraft.code.trim().toUpperCase(),
        discount_value: Number(couponDraft.discount_value),
      });
      setCouponEditing(null);
      setCouponDraft({ code: "", discount_type: "percentage", discount_value: "10", active: true });
    }, couponEditing === null ? "Cupón creado." : "Cupón actualizado.");
  };

  const advanceOrder = async (order: StoreOrder) => {
    const draft = orderDrafts[order.id] ?? {
      tracking: order.codigo_rastreo ?? "",
      operation: order.tipo_operacion,
      operator: order.operador_logistico ?? "",
    };
    const stateIndex = orderStates.indexOf(order.estado);
    const nextState = orderStates[stateIndex + 1];
    if (!nextState) return;
    await run(() => updateAdminStoreOrder(token, order.id, {
      estado: nextState,
      tipo_operacion: draft.operation,
      operador_logistico: draft.operation === "3PL" ? draft.operator : null,
      codigo_rastreo: draft.tracking || null,
    }), `Pedido #${order.id}: estado actualizado.`);
  };

  const reviewPayment = async (order: StoreOrder, payment_status: "pagado" | "rechazado") => {
    await run(
      () => updateAdminStorePaymentStatus(token, order.id, payment_status),
      payment_status === "pagado"
        ? `Pago del pedido #${order.id} confirmado.`
        : `Pago del pedido #${order.id} rechazado; el cliente puede enviar otro comprobante.`,
    );
  };

  const downloadReceipt = async (order: StoreOrder) => {
    setError("");
    try {
      const result = await downloadStoreOrderReceipt(token, order.id, true);
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
    }
  };

  const advanceReturn = async (returnItem: StoreReturnRequest) => {
    const draft = returnDrafts[returnItem.id] ?? { resolution: "reventa" as const, notes: "" };
    const stateIndex = returnStates.indexOf(returnItem.estado);
    const nextState = returnStates[stateIndex + 1];
    if (!nextState) return;
    await run(() => updateAdminStoreReturn(token, returnItem.id, {
      estado: nextState,
      ...(nextState === "resuelta" ? { resolucion: draft.resolution } : {}),
      ...(draft.notes ? { notas_inspeccion: draft.notes } : {}),
    }), nextState === "resuelta" && draft.resolution === "reventa"
      ? "Devolución resuelta y unidades aptas devueltas al stock."
      : "Estado de devolución actualizado.");
  };

  if (loading && !data) return <p>Cargando inventario y pedidos...</p>;
  if (!data) return <p className="form-status error">{error || "No se pudo cargar logística."}</p>;

  return (
    <div className="logistics-admin">
      {error && <p className="form-status error">{error}</p>}
      {notice && <p className="form-status success">{notice}</p>}
      <div className="summary-grid">
        <article className="summary-card"><span className="card-label">Bajo punto de reorden</span><strong>{data.metrics.low_stock}</strong><p>Productos para reabastecer</p></article>
        <article className="summary-card"><span className="card-label">Agotados</span><strong>{data.metrics.out_of_stock}</strong><p>Stock en cero</p></article>
        <article className="summary-card"><span className="card-label">Unidades con salida</span><strong>{data.metrics.units_sold}</strong><p>En el mes seleccionado</p></article>
        <article className="summary-card"><span className="card-label">Rotación de inventario</span><strong>{data.metrics.inventory_rotation.toFixed(2)}x</strong><p>Unidades de salida / stock promedio</p></article>
      </div>

      <section className="portal-panel">
        <div className="panel-head"><div><h2>Distribución por velocidad de salida</h2><p>Productos con más unidades vendidas este mes. Prioriza ubicaciones cercanas a picking para los de mayor rotación.</p></div></div>
        {data.metrics.fast_movers.map((product) => (
          <div className="payment-row" key={product.product_id}>
            <span>{product.sku ?? product.product_id}</span>
            <p><b>{product.nombre}</b>{product.ubicacion_almacen || "Sin ubicación asignada"}</p>
            <strong>{product.units_sold} unidades</strong>
          </div>
        ))}
        {data.metrics.fast_movers.length === 0 && <p>Aún no hay ventas pagadas este mes para ordenar el almacén por velocidad.</p>}
      </section>

      <section className="portal-panel">
        <div className="panel-head"><div><h2>Productos e inventario</h2><p>El stock se actualiza mediante movimientos trazables. Define ubicaciones con un formato uniforme, por ejemplo zona / pasillo / estante / nivel; los avisos muestran cuándo reordenar.</p></div><a className="button button-secondary" href="/#servicios" target="_blank" rel="noreferrer">Ver catálogo de servicios</a></div>
        <form className="auth-form" onSubmit={(event) => void submitProduct(event)}>
          <h3>{editing === null ? "Añadir producto real" : `Editar ${productDraft.nombre}`}</h3>
          <div className="quote-fields">
            <label>SKU<input required maxLength={80} value={productDraft.sku} onChange={(event) => setProductDraft({ ...productDraft, sku: event.target.value })} /></label>
            <label>Nombre<input required maxLength={180} value={productDraft.nombre} onChange={(event) => setProductDraft({ ...productDraft, nombre: event.target.value })} /></label>
            <label>Categoría (opcional)<input maxLength={120} value={productDraft.categoria} onChange={(event) => setProductDraft({ ...productDraft, categoria: event.target.value })} /></label>
            <label>Precio antes de IGV (S/)<input type="number" min="0" step="0.01" required value={productDraft.precio} onChange={(event) => setProductDraft({ ...productDraft, precio: event.target.value })} /></label>
            {editing === null && <label>Stock inicial<input type="number" min="0" required value={productDraft.stock} onChange={(event) => setProductDraft({ ...productDraft, stock: event.target.value })} /></label>}
            <label>Punto de reorden<input type="number" min="0" required value={productDraft.punto_reorden} onChange={(event) => setProductDraft({ ...productDraft, punto_reorden: event.target.value })} /></label>
            <label>Ubicación (zona / pasillo / estante / nivel)<input maxLength={120} placeholder="A / 03 / 02 / 01" value={productDraft.ubicacion_almacen} onChange={(event) => setProductDraft({ ...productDraft, ubicacion_almacen: event.target.value })} /></label>
          </div>
          <label>Descripción<textarea maxLength={3000} value={productDraft.descripcion} onChange={(event) => setProductDraft({ ...productDraft, descripcion: event.target.value })} /></label>
          {editing !== null && data.products.find((product) => product.id === editing)?.imagen_url && !imageDraft && (
            <img className="admin-store-product-image" src={data.products.find((product) => product.id === editing)?.imagen_url ?? undefined} alt={`Foto actual de ${productDraft.nombre}`} />
          )}
          <label>Foto del producto (JPG, PNG o WebP; máximo 5 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageDraft(event.target.files?.[0] ?? null)} />
          </label>
          {imageDraft && <p>Foto seleccionada: {imageDraft.name}</p>}
          <div className="quote-nav">
            {editing !== null && <button className="button button-secondary" type="button" onClick={() => { setEditing(null); setImageDraft(null); setProductDraft({ sku: "", nombre: "", descripcion: "", categoria: "", precio: "", stock: "0", punto_reorden: "0", ubicacion_almacen: "" }); }}>Cancelar</button>}
            <button className="button" type="submit" disabled={busy}>{busy ? "Guardando..." : "Guardar producto"}</button>
          </div>
        </form>

        {data.products.map((product) => {
          const movement = movementDrafts[product.id] ?? { tipo: "entrada" as const, cantidad: "1", motivo: "" };
          return (
            <article className="portal-panel" key={product.id}>
              <div className="payment-row">
                <span>{product.estado_stock === "agotado" ? "●" : product.alerta_reorden ? "!" : "✓"}</span>
                <p><b>{product.nombre} · {product.sku}</b>{product.categoria && <span>Categoría: {product.categoria}</span>}{product.stock} unidades · Reorden en {product.punto_reorden} · {product.ubicacion_almacen || "Ubicación sin asignar"}</p>
                <strong>S/ {money(product.precio)}</strong>
                {product.imagen_url && <img className="admin-store-product-image" src={product.imagen_url} alt={`Foto de ${product.nombre}`} />}
                <i className={product.estado_stock === "agotado" ? "pendiente" : product.alerta_reorden ? "próximo" : "pagado"}>
                  {product.estado_stock === "agotado" ? "Agotado" : product.alerta_reorden ? "Reordenar" : "Disponible"}
                </i>
                <button className="button button-secondary" type="button" onClick={() => startEdit(product)}>Editar</button>
                {!product.activo && <button className="button" type="button" disabled={busy} onClick={() => void run(() => saveAdminStoreProduct(token, product.id, { activo: true }), "Producto activado y visible en la tienda cuando tenga stock.")}>Activar</button>}
                {product.imagen_url && <button className="button button-secondary" type="button" disabled={busy} onClick={() => void run(() => deleteAdminStoreProductImage(token, product.id), "Foto del producto eliminada.")}>Quitar foto</button>}
                {product.activo && <button type="button" onClick={() => window.confirm("¿Desactivar este producto? Su historial se conservará.") && void run(() => deactivateAdminStoreProduct(token, product.id), "Producto desactivado.")}>Desactivar</button>}
              </div>
              {product.activo && (
                <form className="quote-fields" onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => recordAdminStockMovement(token, product.id, {
                    ...movement, cantidad: Number(movement.cantidad),
                  }), "Movimiento de stock registrado.");
                }}>
                  <label>Movimiento<select value={movement.tipo} onChange={(event) => setMovementDrafts({ ...movementDrafts, [product.id]: { ...movement, tipo: event.target.value as "entrada" | "salida" } })}><option value="entrada">Entrada / recepción</option><option value="salida">Salida / ajuste</option></select></label>
                  <label>Cantidad<input type="number" min="1" required value={movement.cantidad} onChange={(event) => setMovementDrafts({ ...movementDrafts, [product.id]: { ...movement, cantidad: event.target.value } })} /></label>
                  <label>Motivo<input required maxLength={255} value={movement.motivo} onChange={(event) => setMovementDrafts({ ...movementDrafts, [product.id]: { ...movement, motivo: event.target.value } })} /></label>
                  <button className="button" type="submit" disabled={busy}>Registrar movimiento</button>
                </form>
              )}
            </article>
          );
        })}
        {data.products.length === 0 && <p>No hay productos registrados.</p>}
      </section>

      <section className="portal-panel">
        <div className="panel-head"><div><h2>Cupones de descuento</h2><p>Los descuentos se aplican al subtotal de productos antes de calcular el IGV.</p></div></div>
        <form className="auth-form" onSubmit={(event) => void submitCoupon(event)}>
          <h3>{couponEditing === null ? "Crear cupón" : `Editar ${couponDraft.code}`}</h3>
          <div className="quote-fields">
            <label>Código<input required maxLength={32} pattern="[A-Za-z0-9_-]+" value={couponDraft.code} onChange={(event) => setCouponDraft({ ...couponDraft, code: event.target.value.toUpperCase() })} /></label>
            <label>Tipo de descuento<select value={couponDraft.discount_type} onChange={(event) => setCouponDraft({ ...couponDraft, discount_type: event.target.value as StoreCoupon["discount_type"] })}><option value="percentage">Porcentaje</option><option value="fixed">Monto fijo (S/)</option></select></label>
            <label>{couponDraft.discount_type === "percentage" ? "Porcentaje (%)" : "Monto (S/)"}<input type="number" min="0.01" max={couponDraft.discount_type === "percentage" ? "100" : "99999999"} step="0.01" required value={couponDraft.discount_value} onChange={(event) => setCouponDraft({ ...couponDraft, discount_value: event.target.value })} /></label>
            <label className="admin-store-coupon-active"><input type="checkbox" checked={couponDraft.active} onChange={(event) => setCouponDraft({ ...couponDraft, active: event.target.checked })} /> Cupón activo</label>
          </div>
          <div className="quote-nav">
            {couponEditing !== null && <button className="button button-secondary" type="button" onClick={() => { setCouponEditing(null); setCouponDraft({ code: "", discount_type: "percentage", discount_value: "10", active: true }); }}>Cancelar</button>}
            <button className="button" type="submit" disabled={busy}>{busy ? "Guardando..." : "Guardar cupón"}</button>
          </div>
        </form>
        {data.coupons.map((coupon) => <article className="payment-row" key={coupon.id}>
          <span>{coupon.active ? "✓" : "—"}</span>
          <p><b>{coupon.code}</b>{coupon.discount_type === "percentage" ? `${money(coupon.discount_value)}% de descuento` : `S/ ${money(coupon.discount_value)} de descuento`}{coupon.starts_at && ` · Desde ${new Date(coupon.starts_at).toLocaleDateString("es-PE")}`}{coupon.expires_at && ` · Hasta ${new Date(coupon.expires_at).toLocaleDateString("es-PE")}`}</p>
          <i className={coupon.active ? "pagado" : "pendiente"}>{coupon.active ? "Activo" : "Inactivo"}</i>
          <button className="button button-secondary" type="button" onClick={() => startCouponEdit(coupon)}>Editar</button>
          <button type="button" disabled={busy} onClick={() => window.confirm(`¿Eliminar el cupón ${coupon.code}?`) && void run(() => deleteAdminStoreCoupon(token, coupon.id), "Cupón eliminado.")}>Eliminar</button>
        </article>)}
        {data.coupons.length === 0 && <p>No hay cupones creados.</p>}
      </section>

      <section className="portal-panel">
        <div className="panel-head"><div><h2>Pedidos y fulfillment</h2><p>Recibido → En picking → Empacado → Enviado → Entregado.</p></div></div>
        {data.orders.length === 0 && <p>No hay pedidos todavía. Los pedidos de la tienda aparecerán aquí.</p>}
        {data.orders.map((order) => {
          const draft = orderDrafts[order.id] ?? {
            tracking: order.codigo_rastreo ?? "",
            operation: order.tipo_operacion,
            operator: order.operador_logistico ?? "",
          };
          const nextState = order.payment_status === "pagado" && order.estado !== "cancelado"
            ? orderStates[orderStates.indexOf(order.estado) + 1]
            : undefined;
          const pickList = [...order.items].sort((first, second) => {
            const firstLocation = first.product?.ubicacion_almacen?.trim();
            const secondLocation = second.product?.ubicacion_almacen?.trim();
            if (!firstLocation) return secondLocation ? 1 : 0;
            if (!secondLocation) return -1;
            return firstLocation.localeCompare(secondLocation, "es", { numeric: true, sensitivity: "base" });
          });
          return (
            <article className="payment-row" key={order.id}>
              <span>#{order.id}</span>
              <p><b>{order.client?.nombre ?? "Cliente"} · {order.estado.replace(/_/g, " ")}</b>
                {order.email_cliente} · {order.telefono_cliente} · {order.tipo_documento?.toUpperCase()} {order.numero_documento} · {order.tipo_comprobante}{order.empresa_facturacion ? ` · ${order.empresa_facturacion}` : ""}
                Envío {order.metodo_envio} · {order.tipo_operacion}{order.operador_logistico ? ` (${order.operador_logistico})` : ""} · Rastreo: {order.codigo_rastreo ?? "Pendiente"} · {order.ubicacion_entrega}, {order.direccion_entrega}
              </p>
              <strong>S/ {money(order.total)}</strong>
              <i className={order.payment_status === "pagado" ? "pagado" : order.payment_status === "rechazado" ? "pendiente" : "próximo"}>
                Pago: {order.payment_status.replace(/_/g, " ")}
              </i>
              {order.payment_method && <span>{order.payment_method === "yape_plin" ? "Yape/Plin" : order.payment_method === "card" ? "Tarjeta · Mercado Pago" : "Transferencia bancaria"}</span>}
              {order.receipt_original_name && <button className="button button-secondary" type="button" onClick={() => void downloadReceipt(order)}>Ver comprobante</button>}
              {order.payment_status === "comprobante_enviado" && <>
                <button className="button" type="button" disabled={busy} onClick={() => void reviewPayment(order, "pagado")}>Confirmar pago</button>
                <button className="button button-secondary" type="button" disabled={busy} onClick={() => void reviewPayment(order, "rechazado")}>Rechazar comprobante</button>
              </>}
              {(order.estado === "recibido" || order.estado === "en_picking" || order.estado === "empacado") && (
                <div className="portal-panel">
                  <h3>{order.estado === "empacado" ? "Lista de empaque" : "Lista de picking (ordenada por ubicación)"}</h3>
                  {pickList.map((item) => {
                    const location = item.product?.ubicacion_almacen;
                    return <p key={item.id}><b>{item.cantidad} × {item.nombre}</b> · {item.sku} · {location || "Ubicación sin asignar"}</p>;
                  })}
                </div>
              )}
              <label>Operación<select value={draft.operation} onChange={(event) => setOrderDrafts({ ...orderDrafts, [order.id]: { ...draft, operation: event.target.value as "in-house" | "3PL" } })}><option value="in-house">in-house</option><option value="3PL">3PL</option></select></label>
              {draft.operation === "3PL" && <label>Operador<input required maxLength={120} value={draft.operator} onChange={(event) => setOrderDrafts({ ...orderDrafts, [order.id]: { ...draft, operator: event.target.value } })} /></label>}
              {(order.estado === "empacado" || order.estado === "enviado") && <label>Código de rastreo<input required={order.estado === "empacado"} maxLength={120} value={draft.tracking} onChange={(event) => setOrderDrafts({ ...orderDrafts, [order.id]: { ...draft, tracking: event.target.value } })} /></label>}
              {nextState && <button className="button" type="button" disabled={busy || order.payment_status !== "pagado"} onClick={() => void advanceOrder(order)}>Marcar {nextState.replace(/_/g, " ")}</button>}
            </article>
          );
        })}
      </section>

      <section className="portal-panel">
        <div className="panel-head"><div><h2>Devoluciones</h2><p>Solicitada → Aprobada → Recibida → Inspeccionada → Resuelta. Registra la inspección y define reventa, reparación, desecho o reembolso.</p></div></div>
        <p>Resoluciones registradas: {data.metrics.return_resolutions.reventa} reventa · {data.metrics.return_resolutions.reparacion} reparación · {data.metrics.return_resolutions.desecho} desecho · {data.metrics.return_resolutions.reembolso} reembolso.</p>
        {data.returns.length === 0 && <p>No hay solicitudes de devolución.</p>}
        {data.returns.map((returnItem) => {
          const draft = returnDrafts[returnItem.id] ?? { resolution: "reventa" as const, notes: "" };
          const nextState = returnStates[returnStates.indexOf(returnItem.estado) + 1];
          return (
            <article className="payment-row" key={returnItem.id}>
              <span>#{returnItem.order_id}</span>
              <p><b>{returnItem.estado} · {returnItem.order?.client?.nombre ?? "Cliente"}</b>{returnItem.motivo}
                {returnItem.order?.items?.map((item) => <span key={item.id}>{item.nombre} × {item.cantidad}</span>)}
              </p>
              {returnItem.estado === "inspeccionada" && <>
                <label>Resolución<select value={draft.resolution} onChange={(event) => setReturnDrafts({ ...returnDrafts, [returnItem.id]: { ...draft, resolution: event.target.value as typeof draft.resolution } })}>
                  <option value="reventa">Reventa (devolver al stock)</option><option value="reparacion">Reparación</option><option value="desecho">Desecho</option><option value="reembolso">Reembolso</option>
                </select></label>
                <label>Notas de inspección<textarea required minLength={5} maxLength={3000} value={draft.notes} onChange={(event) => setReturnDrafts({ ...returnDrafts, [returnItem.id]: { ...draft, notes: event.target.value } })} /></label>
              </>}
              {returnItem.resolucion && <strong>{returnItem.resolucion}</strong>}
              {nextState && <button className="button" type="button" disabled={busy} onClick={() => void advanceReturn(returnItem)}>Marcar {nextState}</button>}
            </article>
          );
        })}
      </section>

      <section className="portal-panel">
        <div className="panel-head"><div><h2>Historial de movimientos</h2><p>Entradas y salidas registradas con fecha, cantidad y motivo.</p></div></div>
        {data.movements.map((movement) => (
          <div className="payment-row" key={movement.id}>
            <span>{movement.tipo === "entrada" ? "+" : "−"}</span>
            <p><b>{movement.product?.nombre ?? "Producto"}</b>{movement.motivo} · {new Date(movement.created_at).toLocaleString("es-PE")}</p>
            <strong>{movement.cantidad} unidades</strong>
          </div>
        ))}
        {data.movements.length === 0 && <p>Aún no hay movimientos de stock.</p>}
      </section>
    </div>
  );
}
