import type { StoreOrder } from "./lib/api";

function formatMoney(value: number | string): string {
  return Number(value).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StorePaymentReceipt({ order }: { order: StoreOrder }) {
  if (order.payment_status !== "pagado" || !order.paid_at) return null;

  const receiptNumber = `DP-${new Date(order.paid_at).getFullYear()}-${String(order.id).padStart(8, "0")}`;
  const paymentMethod = order.payment_method === "card"
    ? "Tarjeta · Mercado Pago"
    : order.payment_method === "yape_plin"
      ? "Yape / Plin"
      : "Transferencia bancaria";
  const printReceipt = () => {
    const receipt = document.getElementById(`store-receipt-${order.id}`);
    receipt?.classList.add("receipt-printing");
    window.addEventListener("afterprint", () => receipt?.classList.remove("receipt-printing"), { once: true });
    window.print();
  };

  return (
    <article className="store-payment-receipt" id={`store-receipt-${order.id}`} aria-labelledby={`receipt-title-${order.id}`}>
      <header className="receipt-success">
        <span className="receipt-check" aria-hidden="true">✓</span>
        <h2 id={`receipt-title-${order.id}`}>¡Gracias por tu pago!</h2>
        <p>Recibo de pago</p>
        <strong>{receiptNumber}</strong>
        <span>Pago confirmado el {new Date(order.paid_at).toLocaleString("es-PE")}</span>
      </header>

      <div className="receipt-details">
        <h3>Información del pago</h3>
        <dl>
          <div><dt>Cliente</dt><dd>{order.client?.nombre || "Cliente DigitalPyme"}</dd></div>
          <div><dt>Número de pedido</dt><dd>#{order.id}</dd></div>
          {order.provider_payment_id && <div><dt>Número de operación</dt><dd>{order.provider_payment_id}</dd></div>}
        </dl>
        <div className="receipt-lines">
          {order.items.map((item) => (
            <div key={item.id}><span>{item.nombre} × {item.cantidad}</span><strong>S/ {formatMoney(item.subtotal)}</strong></div>
          ))}
          <div><span>Envío</span><strong>S/ {formatMoney(order.costo_envio)}</strong></div>
          <div className="receipt-total"><span>Total pagado</span><strong>S/ {formatMoney(order.total)}</strong></div>
        </div>
        <div className="receipt-method"><span>Forma de pago</span><strong>{paymentMethod}</strong></div>
        <p className="receipt-tax-note">Recibo informativo de pago; no es una boleta ni factura electrónica de SUNAT.</p>
      </div>

      <button className="button button-secondary receipt-print-button" type="button" onClick={printReceipt}>
        Imprimir / Guardar recibo
      </button>
    </article>
  );
}
