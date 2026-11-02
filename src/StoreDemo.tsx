import { useEffect, useMemo, useState, type FormEvent } from "react";
import StorePaymentReceipt from "./StorePaymentReceipt";
import {
  clientLogin,
  createStoreOrder,
  getClientStoreOrders,
  getPublicSiteSettings,
  getStorePaymentOptions,
  getStoreProducts,
  getStoreShippingOptions,
  startStoreCardPayment,
  type PublicStoreProduct,
  type StoreOrder,
  type SiteSettings,
  type StorePaymentOptions,
  type StoreShippingMethod,
} from "./lib/api";

type ClientSession = { token: string; usuario: { name: string; email: string } };

function restoreSession(): ClientSession | null {
  try {
    const token = localStorage.getItem("digitalpyme.client.token");
    const usuario = localStorage.getItem("digitalpyme.client.user");
    return token && usuario ? { token, usuario: JSON.parse(usuario) as ClientSession["usuario"] } : null;
  } catch {
    return null;
  }
}

function formatMoney(value: number): string {
  return value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StoreDemo({ onClosePortal }: { onClosePortal: () => void }) {
  const [products, setProducts] = useState<PublicStoreProduct[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [methods, setMethods] = useState<StoreShippingMethod[]>([]);
  const [shippingZones, setShippingZones] = useState<SiteSettings["coverage"]["shipping_zones"]>([]);
  const [paymentOptions, setPaymentOptions] = useState<StorePaymentOptions>({
    card_enabled: false,
    bank_transfer: { enabled: false, bank: null, holder: null, account: null, cci: null },
    yape_plin: { enabled: false, phone: null, holder: null, qr_url: null },
  });
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "yape_plin" | "card">("card");
  const [freeThreshold, setFreeThreshold] = useState(200);
  const [returnsPolicy, setReturnsPolicy] = useState("");
  const [cart, setCart] = useState<Record<number, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("digitalpyme.store-demo.cart") ?? "{}") as Record<number, number>;
    } catch {
      return {};
    }
  });
  const [session, setSession] = useState<ClientSession | null>(restoreSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [shippingKey, setShippingKey] = useState<StoreShippingMethod["key"]>("estandar");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [returnedOrder, setReturnedOrder] = useState<StoreOrder | null>(null);
  const [loadingReturnedOrder, setLoadingReturnedOrder] = useState(false);

  useEffect(() => {
    document.title = "Tienda en línea | DigitalPyme";
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([getStoreProducts(), getStoreShippingOptions(), getPublicSiteSettings(), getStorePaymentOptions()])
      .then(([loadedProducts, shipping, settings, payments]) => {
        if (!active) return;
        setProducts(loadedProducts);
        setMethods(shipping.methods);
        setShippingZones(settings.coverage.shipping_zones);
        setPaymentOptions(payments);
        setFreeThreshold(Number(shipping.free_shipping_threshold));
        setReturnsPolicy(settings.legal.returns);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la tienda."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("digitalpyme.store-demo.cart", JSON.stringify(cart));
  }, [cart]);

  const returnedOrderId = Number(new URLSearchParams(window.location.search).get("pedido"));
  const refreshReturnedOrder = async () => {
    if (!session || returnedOrderId < 1) return;
    setLoadingReturnedOrder(true);
    setError("");
    try {
      const orders = await getClientStoreOrders(session.token);
      setReturnedOrder(orders.find((order) => order.id === returnedOrderId) ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo consultar el estado del pago.");
    } finally {
      setLoadingReturnedOrder(false);
    }
  };

  useEffect(() => {
    if (!session || !Number.isInteger(returnedOrderId) || returnedOrderId < 1) return;
    let active = true;
    setLoadingReturnedOrder(true);
    void getClientStoreOrders(session.token)
      .then((orders) => {
        if (active) setReturnedOrder(orders.find((order) => order.id === returnedOrderId) ?? null);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo consultar el estado del pago.");
      })
      .finally(() => { if (active) setLoadingReturnedOrder(false); });
    return () => { active = false; };
  }, [session, returnedOrderId]);

  const selectedProducts = useMemo(
    () => products.flatMap((product) => cart[product.id] ? [{ product, quantity: cart[product.id] }] : []),
    [products, cart],
  );
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return products.filter((product) => {
      const matchesCategory = !category || product.categoria === category;
      const matchesSearch = !query
        || `${product.nombre} ${product.sku} ${product.descripcion ?? ""} ${product.categoria ?? ""}`
          .toLocaleLowerCase("es").includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.categoria?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "es")),
    [products],
  );
  const subtotal = selectedProducts.reduce((sum, line) => sum + Number(line.product.precio) * line.quantity, 0);
  const cartCount = selectedProducts.reduce((count, line) => count + line.quantity, 0);
  const availableMethods = methods.filter((method) => method.enabled && (method.key !== "same_day" || /lima/i.test(location)));
  const selectedMethod = availableMethods.find((method) => method.key === shippingKey) ?? availableMethods[0];
  const shippingZone = shippingZones.find((zone) => zone.location.trim().toLocaleLowerCase("es") === location.trim().toLocaleLowerCase("es"));
  const standardShippingCost = Number(methods.find((method) => method.key === "estandar")?.cost ?? selectedMethod?.cost ?? 0);
  const getShippingCost = (method: StoreShippingMethod) => {
    if (subtotal >= freeThreshold) return 0;
    const zoneBaseCost = Number(shippingZone?.fee ?? standardShippingCost);
    return Math.max(0, zoneBaseCost + Number(method.cost) - standardShippingCost);
  };
  const availablePaymentMethods = (["card", "yape_plin", "bank_transfer"] as const)
    .filter((method) => method === "card" ? paymentOptions.card_enabled : paymentOptions[method].enabled);
  const selectedPaymentMethod = availablePaymentMethods.includes(paymentMethod)
    ? paymentMethod
    : availablePaymentMethods[0];
  const shippingCost = selectedProducts.length > 0 && selectedMethod ? getShippingCost(selectedMethod) : 0;

  const changeQuantity = (product: PublicStoreProduct, delta: number) => {
    setCart((current) => {
      const quantity = Math.max(0, Math.min(product.stock, (current[product.id] ?? 0) + delta));
      const next = { ...current };
      if (quantity === 0) delete next[product.id];
      else next[product.id] = quantity;
      return next;
    });
  };

  const signIn = async () => {
    setBusy(true);
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
      setBusy(false);
    }
  };

  const checkout = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !selectedMethod || !selectedPaymentMethod || selectedProducts.length === 0) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const order = await createStoreOrder(session.token, {
        items: selectedProducts.map(({ product, quantity }) => ({ product_id: product.id, cantidad: quantity })),
        metodo_envio: selectedMethod.key,
        payment_method: selectedPaymentMethod,
        ubicacion_entrega: location,
        direccion_entrega: address,
      });
      setCart({});
      setNotice(`Pedido #${order.id} creado. ${selectedPaymentMethod === "card" ? "Te llevaremos a Mercado Pago para completar el pago seguro." : "Realiza el pago y envía el comprobante desde Portal cliente → Pedidos; lo verificaremos antes de preparar el envío."}`);
      setProducts(await getStoreProducts());
      if (selectedPaymentMethod === "card") {
        try {
          const checkout = await startStoreCardPayment(session.token, order.id);
          window.location.assign(checkout.checkout_url);
        } catch (paymentError) {
          setError(paymentError instanceof Error ? paymentError.message : "No se pudo iniciar el pago.");
          setNotice(`El pedido #${order.id} quedó creado. Puedes volver a intentarlo desde Portal cliente → Pedidos.`);
        }
      }
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "No se pudo crear el pedido.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="store-demo">
      <header className="store-demo-header">
        <a className="brand" href="/"><span className="brand-mark"><span /></span><strong>Digital</strong>Pyme</a>
        <div><a className="store-cart-link" href="#pedido">Carrito ({cartCount})</a><button className="button button-secondary" type="button" onClick={onClosePortal}>Volver al sitio</button></div>
      </header>
      <div className="store-demo-content">
        <div className="store-demo-title"><span className="kicker">Tienda DigitalPyme</span><h1>Productos y entregas</h1><p>Explora el catálogo, arma tu pedido y paga con tarjeta, Yape/Plin o transferencia.</p></div>
        {error && <p className="form-status error">{error}</p>}
        {notice && <p className="form-status success">{notice}</p>}
        {returnedOrderId > 0 && (
          <section className="store-return-payment" aria-live="polite">
            <h2>Estado del pago del pedido #{returnedOrderId}</h2>
            {loadingReturnedOrder && <p>Consultando el pago...</p>}
            {!loadingReturnedOrder && !returnedOrder && <p>No pudimos encontrar este pedido en tu cuenta. Revisa Portal cliente → Pedidos.</p>}
            {returnedOrder?.payment_status === "pagado" && <StorePaymentReceipt order={returnedOrder} />}
            {returnedOrder && returnedOrder.payment_status !== "pagado" && (
              <div>
                <p>El pago aún no aparece confirmado ({returnedOrder.payment_status.replace(/_/g, " ")}). Solo mostraremos el recibo cuando el pago esté confirmado.</p>
                <button className="button button-secondary" type="button" disabled={loadingReturnedOrder} onClick={() => void refreshReturnedOrder()}>Actualizar estado del pago</button>
              </div>
            )}
          </section>
        )}
        <div className="store-demo-grid">
          <section className="store-catalog" aria-label="Catálogo de productos">
            <label className="store-search">
              <span>Buscar productos</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, SKU o descripción" />
            </label>
            {categories.length > 0 && <label className="store-search">
              <span>Categoría</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>}
            {loading && <p>Cargando productos...</p>}
            {!loading && products.length === 0 && <div className="portal-panel"><h2>La tienda todavía está vacía</h2><p>Pronto publicaremos productos. Si eres administrador, puedes activar productos con precio e inventario confirmados desde Panel administrador → Logística.</p></div>}
            {!loading && products.length > 0 && filteredProducts.length === 0 && <p role="status">No encontramos productos que coincidan con “{search}”.</p>}
            <div className="store-products">
              {filteredProducts.map((product) => (
                <article className="store-product-card" key={product.id}>
                  {product.imagen_url
                    ? <img className="store-product-image" src={product.imagen_url} alt={product.nombre} loading="lazy" decoding="async" />
                    : <span className="store-product-symbol" aria-hidden="true">DP</span>}
                  <small>{product.sku} · {product.stock} disponibles</small>
                  <h2>{product.nombre}</h2>
                  <p>{product.descripcion || "Producto disponible en la tienda DigitalPyme."}</p>
                  <strong>S/ {formatMoney(Number(product.precio))}</strong>
                  <div className="store-quantity">
                    <button type="button" aria-label={`Quitar ${product.nombre}`} onClick={() => changeQuantity(product, -1)}>−</button>
                    <span>{cart[product.id] ?? 0}</span>
                    <button type="button" aria-label={`Añadir ${product.nombre}`} disabled={(cart[product.id] ?? 0) >= product.stock} onClick={() => changeQuantity(product, 1)}>+</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <aside className="store-cart portal-panel" id="pedido">
            <h2>Tu pedido</h2>
            {selectedProducts.map(({ product, quantity }) => (
              <div className="store-cart-row" key={product.id}><span>{product.nombre} × {quantity}</span><strong>S/ {formatMoney(Number(product.precio) * quantity)}</strong></div>
            ))}
            {selectedProducts.length === 0 && <p>Añade un producto para empezar.</p>}
            {freeThreshold > 0 && <p className="store-shipping-progress">{subtotal >= freeThreshold ? "¡Tu pedido tiene envío gratis!" : `Te faltan S/ ${formatMoney(Math.max(0, freeThreshold - subtotal))} para el envío gratis.`}</p>}
            <form className="auth-form" onSubmit={(event) => {
              if (session) void checkout(event);
              else {
                event.preventDefault();
                void signIn();
              }
            }}>
              <label>Ciudad o distrito<input required maxLength={120} placeholder="Lima" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
              <label>Dirección de entrega<input required maxLength={255} value={address} onChange={(event) => setAddress(event.target.value)} /></label>
              <label>Opción de envío<select required value={selectedMethod?.key ?? ""} onChange={(event) => setShippingKey(event.target.value as StoreShippingMethod["key"])}>
                {availableMethods.map((method) => <option key={method.key} value={method.key}>{method.nombre} · {method.delivery_days === 0 ? "mismo día" : `${method.delivery_days} días`} · S/ {formatMoney(getShippingCost(method))}</option>)}
              </select></label>
              <label>Método de pago<select required value={selectedPaymentMethod ?? ""} onChange={(event) => setPaymentMethod(event.target.value as "bank_transfer" | "yape_plin" | "card")} disabled={availablePaymentMethods.length === 0}>
                {availablePaymentMethods.map((method) => <option key={method} value={method}>{method === "yape_plin" ? "Yape o Plin" : method === "card" ? "Tarjeta · Mercado Pago" : "Transferencia bancaria"}</option>)}
              </select></label>
              {availablePaymentMethods.length === 0 ? (
                <p className="form-status error">La tienda aún no tiene métodos de pago configurados. Comunícate con nosotros para coordinar tu pedido.</p>
              ) : selectedPaymentMethod === "yape_plin" ? (
                <div className="store-payment-instructions">
                  <strong>Yape o Plin</strong>
                  <p>Envía el pago al número <b>{paymentOptions.yape_plin.phone}</b>{paymentOptions.yape_plin.holder ? `, a nombre de ${paymentOptions.yape_plin.holder}` : ""}.</p>
                  {paymentOptions.yape_plin.qr_url && <img src={paymentOptions.yape_plin.qr_url} alt="Código QR de pago por Yape o Plin" />}
                </div>
              ) : selectedPaymentMethod === "bank_transfer" ? (
                <div className="store-payment-instructions">
                  <strong>Transferencia bancaria</strong>
                  {paymentOptions.bank_transfer.bank && <p>Banco: <b>{paymentOptions.bank_transfer.bank}</b></p>}
                  {paymentOptions.bank_transfer.holder && <p>Titular: <b>{paymentOptions.bank_transfer.holder}</b></p>}
                  {paymentOptions.bank_transfer.account && <p>Cuenta: <b>{paymentOptions.bank_transfer.account}</b></p>}
                  {paymentOptions.bank_transfer.cci && <p>CCI: <b>{paymentOptions.bank_transfer.cci}</b></p>}
                </div>
              ) : <p className="form-status">El pago se procesará de forma segura en Mercado Pago; no almacenamos datos de tu tarjeta.</p>}
              <div className="store-cart-row"><span>Subtotal</span><strong>S/ {formatMoney(subtotal)}</strong></div>
              <div className="store-cart-row"><span>Envío</span><strong>{shippingCost === 0 && subtotal > 0 ? "Gratis" : `S/ ${formatMoney(shippingCost)}`}</strong></div>
              <div className="store-cart-row store-total"><span>Total</span><strong>S/ {formatMoney(subtotal + shippingCost)}</strong></div>
              <details className="store-returns-policy"><summary>Política de devoluciones</summary><p>{returnsPolicy}</p></details>
              {!session ? (
                <>
                  <p>Inicia sesión como cliente para completar la compra y consultar el seguimiento.</p>
                  <label>Correo<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                  <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
                  <button className="button full-width-btn" type="button" disabled={busy} onClick={(event) => {
                    const form = event.currentTarget.closest("form");
                    if (form?.reportValidity()) void signIn();
                  }}>{busy ? "Ingresando..." : "Iniciar sesión para comprar"}</button>
                </>
              ) : (
                <><p>Compra como {session.usuario.name}.</p><button className="button full-width-btn" type="submit" disabled={busy || selectedProducts.length === 0 || !selectedMethod || !selectedPaymentMethod}>{busy ? "Procesando..." : selectedPaymentMethod === "card" ? "Continuar a pago seguro" : "Crear pedido pendiente de pago"}</button></>
              )}
            </form>
          </aside>
        </div>
        <p className="store-demo-footnote">Los pagos con tarjeta se confirman mediante Mercado Pago. Yape/Plin y transferencias se verifican manualmente; el recibo aparece solo después de confirmar el pago. No emitimos comprobantes electrónicos de SUNAT hasta configurar un proveedor de facturación.</p>
      </div>
    </main>
  );
}
