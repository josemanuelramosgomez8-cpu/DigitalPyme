import { useEffect, useState, type FormEvent } from "react";
import StorePaymentReceipt from "./StorePaymentReceipt";
import {
  downloadStoreOrderReceipt,
  getClientStoreOrders,
  getStorePaymentOptions,
  requestStoreReturn,
  startStoreCardPayment,
  uploadStoreOrderReceipt,
  type StoreOrder,
  type StorePaymentOptions,
} from "./lib/api";

const fulfillmentStages: StoreOrder["estado"][] = ["recibido", "en_picking", "empacado", "enviado", "entregado"];

export default function ClientStoreOrders({ token }: { token: string }) {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<StorePaymentOptions>({
    card_enabled: false,
    bank_transfer: { enabled: false, bank: null, holder: null, account: null, cci: null },
    yape_plin: { enabled: false, phone: null, holder: null, qr_url: null },
  });
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [receiptFiles, setReceiptFiles] = useState<Record<number, File | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const [loadedOrders, options] = await Promise.all([
        getClientStoreOrders(token),
        getStorePaymentOptions(),
      ]);
      setOrders(loadedOrders);
      setPaymentOptions(options);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [token]);

  const submitReturn = async (event: FormEvent, orderId: number) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await requestStoreReturn(token, orderId, reasons[orderId] ?? "");
      setNotice(`La solicitud de devolución del pedido #${orderId} fue enviada.`);
      setReasons((current) => ({ ...current, [orderId]: "" }));
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo solicitar la devolución.");
    }
  };

  const submitReceipt = async (event: FormEvent, orderId: number) => {
    event.preventDefault();
    const file = receiptFiles[orderId];
    if (!file) return;
    setError("");
    setNotice("");
    try {
      await uploadStoreOrderReceipt(token, orderId, file);
      setReceiptFiles((current) => ({ ...current, [orderId]: undefined }));
      setNotice(`Comprobante del pedido #${orderId} enviado. El pago queda pendiente de verificación.`);
      await refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el comprobante.");
    }
  };

  const retryCardPayment = async (order: StoreOrder) => {
    setError("");
    try {
      const result = await startStoreCardPayment(token, order.id);
      window.location.assign(result.checkout_url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "No se pudo iniciar el pago con tarjeta.");
    }
  };

  const downloadReceipt = async (order: StoreOrder) => {
    setError("");
    try {
      const result = await downloadStoreOrderReceipt(token, order.id);
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

  if (loading) return <p>Cargando tus pedidos...</p>;

  return (
    <div className="portal-panel client-store-orders">
      <div className="panel-head"><div><h2>Seguimiento de pedidos</h2><p>Consulta el fulfillment, el código de última milla y solicita devoluciones.</p></div><button className="button button-secondary" type="button" onClick={() => void refresh()}>Actualizar</button></div>
      {error && <p className="form-status error">{error}</p>}
      {notice && <p className="form-status success">{notice}</p>}
      {orders.length === 0 && <p>Aún no tienes pedidos de la tienda.</p>}
      {orders.map((order) => {
        const returnRequest = order.return_request ?? order.returnRequest ?? null;
        const currentIndex = order.payment_status === "pagado" ? fulfillmentStages.indexOf(order.estado) : -1;
        return (
          <article className="client-store-order" key={order.id}>
            <div className="panel-head">
              <div><h3>Pedido #{order.id}</h3><p>{order.ubicacion_entrega} · {order.direccion_entrega}</p></div>
              <strong>S/ {Number(order.total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="store-order-progress">
              {fulfillmentStages.map((stage, index) => <span className={index <= currentIndex ? "done" : ""} key={stage}>{stage.replace(/_/g, " ")}</span>)}
            </div>
            <div className="store-order-tracking">
              <span>Envío: <b>{order.metodo_envio}</b></span>
              <span>Operación: <b>{order.tipo_operacion}{order.operador_logistico ? ` · ${order.operador_logistico}` : ""}</b></span>
              <span>Rastreo: <b>{order.codigo_rastreo ?? "Se mostrará al despachar"}</b></span>
            </div>
            <div className="store-payment-status">
              <span>Pago: <b>{order.payment_status.replace(/_/g, " ")}</b></span>
              {order.payment_method && <span>Método: <b>{order.payment_method === "yape_plin" ? "Yape/Plin" : order.payment_method === "card" ? "Tarjeta · Mercado Pago" : "transferencia bancaria"}</b></span>}
              {order.receipt_original_name && <button className="button button-secondary" type="button" onClick={() => void downloadReceipt(order)}>Descargar comprobante</button>}
              {order.payment_method === "card" && paymentOptions.card_enabled && ["pendiente", "rechazado"].includes(order.payment_status) && (
                <button className="button" type="button" onClick={() => void retryCardPayment(order)}>Pagar con tarjeta</button>
              )}
            </div>
            {order.payment_status === "pendiente" && order.payment_method !== "card" && <p className="form-status">Completa el pago para iniciar la preparación del pedido.</p>}
            {order.payment_status === "comprobante_enviado" && <p className="form-status">Recibimos tu comprobante. El pedido avanzará cuando confirmemos el pago.</p>}
            {order.payment_status === "rechazado" && <p className="form-status error">{order.payment_method === "card" ? "Mercado Pago no confirmó el pago. Puedes volver a intentarlo con tarjeta." : "No pudimos confirmar el pago. Revisa el importe y los datos de destino y envía un nuevo comprobante."}</p>}
            {order.payment_status === "expirado" && <p className="form-status error">El plazo de 24 horas venció. El pedido se canceló y el stock volvió a estar disponible; crea un nuevo pedido si aún lo deseas.</p>}
            {order.payment_method === "card" && order.payment_status === "pendiente" && <p className="form-status">Completa el pago seguro con Mercado Pago. Confirmaremos el pedido al recibir la notificación de pago.</p>}
            {order.payment_status === "pagado" && <StorePaymentReceipt order={order} />}
            {order.payment_status !== "pagado" && order.payment_method === "yape_plin" && paymentOptions.yape_plin.enabled && (
              <div className="store-payment-instructions">
                <strong>Yape o Plin</strong>
                <p>Número <b>{paymentOptions.yape_plin.phone}</b>{paymentOptions.yape_plin.holder ? ` · Titular: ${paymentOptions.yape_plin.holder}` : ""}</p>
                {paymentOptions.yape_plin.qr_url && <img src={paymentOptions.yape_plin.qr_url} alt="Código QR de pago por Yape o Plin" />}
              </div>
            )}
            {order.payment_status !== "pagado" && order.payment_method === "bank_transfer" && paymentOptions.bank_transfer.enabled && (
              <div className="store-payment-instructions">
                <strong>Transferencia bancaria</strong>
                {paymentOptions.bank_transfer.bank && <p>Banco: <b>{paymentOptions.bank_transfer.bank}</b></p>}
                {paymentOptions.bank_transfer.holder && <p>Titular: <b>{paymentOptions.bank_transfer.holder}</b></p>}
                {paymentOptions.bank_transfer.account && <p>Cuenta: <b>{paymentOptions.bank_transfer.account}</b></p>}
                {paymentOptions.bank_transfer.cci && <p>CCI: <b>{paymentOptions.bank_transfer.cci}</b></p>}
              </div>
            )}
            {(order.payment_status === "pendiente" || order.payment_status === "rechazado") && order.payment_method !== "card" && (
              <form className="auth-form" onSubmit={(event) => void submitReceipt(event, order.id)}>
                <label>Enviar comprobante (PDF, JPG o PNG, máximo 10 MB)
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required onChange={(event) => setReceiptFiles({ ...receiptFiles, [order.id]: event.target.files?.[0] })} />
                </label>
                <button className="button" type="submit" disabled={!receiptFiles[order.id]}>Enviar para revisión</button>
              </form>
            )}
            {order.items.map((item) => <div className="store-cart-row" key={item.id}><span>{item.nombre} × {item.cantidad}</span><strong>S/ {Number(item.subtotal).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong></div>)}
            {returnRequest ? (
              <p className="form-status">Devolución {returnRequest.estado}{returnRequest.resolucion ? ` · Resolución: ${returnRequest.resolucion}` : ""}. Motivo: {returnRequest.motivo}</p>
            ) : order.estado === "entregado" ? (
              <form className="auth-form" onSubmit={(event) => void submitReturn(event, order.id)}>
                <label>Solicitar devolución<textarea required minLength={10} maxLength={2000} placeholder="Cuéntanos el motivo de tu solicitud" value={reasons[order.id] ?? ""} onChange={(event) => setReasons({ ...reasons, [order.id]: event.target.value })} /></label>
                <button className="button" type="submit">Solicitar devolución</button>
              </form>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
