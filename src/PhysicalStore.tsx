import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  clientLogin,
  createStoreOrder,
  getClientStoreProfile,
  getStorePaymentOptions,
  getStoreProducts,
  getStoreShippingOptions,
  getClientStoreOrders,
  registerClient,
  startStoreCardPayment,
  uploadStoreOrderReceipt,
  validateStoreCoupon,
  type ClientSession,
  type ClientStoreProfile,
  type PublicStoreProduct,
  type StoreCoupon,
  type StoreOrder,
  type StorePaymentOptions,
  type StoreShippingMethod,
} from "./lib/api";

const CART_KEY = "digitalpyme.physical-store-cart.v1";
type Screen = "catalog" | "cart" | "auth" | "checkout" | "confirmation";

function money(value: number | string): string {
  return Number(value).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function readCart(): Record<number, number> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).filter((entry): entry is [string, number] =>
        /^\d+$/.test(entry[0]) && Number.isInteger(entry[1]) && entry[1] > 0,
      ).map(([id, quantity]) => [Number(id), quantity]),
    );
  } catch {
    return {};
  }
}

function readSession(): ClientSession | null {
  try {
    const token = sessionStorage.getItem("digitalpyme.client.token");
    const user = sessionStorage.getItem("digitalpyme.client.user");
    if (!token || !user) return null;
    return { token, usuario: JSON.parse(user) as ClientSession["usuario"] };
  } catch {
    return null;
  }
}

const emptyProfile: ClientStoreProfile = {
  nombre: "",
  empresa: null,
  telefono: null,
  tipo_documento: null,
  numero_documento: null,
  tipo_comprobante: null,
  direccion_entrega: null,
  ubicacion_entrega: null,
};

export default function PhysicalStore() {
  const [products, setProducts] = useState<PublicStoreProduct[]>([]);
  const [shippingMethods, setShippingMethods] = useState<StoreShippingMethod[]>([]);
  const [shippingZones, setShippingZones] = useState<{ location: string; fee: number | string; delivery_days: number }[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [paymentOptions, setPaymentOptions] = useState<StorePaymentOptions | null>(null);
  const [cart, setCart] = useState<Record<number, number>>(readCart);
  const [screen, setScreen] = useState<Screen>(() => window.location.pathname === "/carrito" ? "cart" : "catalog");
  const [session, setSession] = useState<ClientSession | null>(readSession);
  const [profile, setProfile] = useState<ClientStoreProfile>(emptyProfile);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<StoreShippingMethod["key"]>("estandar");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "yape_plin" | "card">("bank_transfer");
  const [receiptType, setReceiptType] = useState<"boleta" | "factura">("boleta");
  const [documentType, setDocumentType] = useState<"dni" | "ruc">("dni");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Pick<StoreCoupon, "code" | "discount_type" | "discount_value"> & { discount_amount: number | string } | null>(null);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptInputKey, setReceiptInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const cartItems = useMemo(
    () => products.filter((product) => (cart[product.id] ?? 0) > 0),
    [products, cart],
  );
  const orderItems = useMemo(
    () => cartItems.map((product) => ({ product_id: product.id, cantidad: cart[product.id] })),
    [cartItems, cart],
  );
  const subtotalCents = useMemo(
    () => cartItems.reduce((sum, product) => sum + Math.round(Number(product.precio) * 100) * cart[product.id], 0),
    [cartItems, cart],
  );
  const discountCents = Math.min(subtotalCents, Math.round(Number(appliedCoupon?.discount_amount ?? 0) * 100));
  const discountedSubtotalCents = subtotalCents - discountCents;
  const standardMethod = shippingMethods.find((method) => method.key === "estandar");
  const chosenMethod = shippingMethods.find((method) => method.key === deliveryMethod);
  const zone = shippingZones.find((item) => item.location.trim().toLocaleLowerCase("es") === profile.ubicacion_entrega?.trim().toLocaleLowerCase("es"));
  const shippingBaseCents = Math.round(Number(zone?.fee ?? standardMethod?.cost ?? chosenMethod?.cost ?? 0) * 100);
  const methodSurchargeCents = Math.round((Number(chosenMethod?.cost ?? 0) - Number(standardMethod?.cost ?? chosenMethod?.cost ?? 0)) * 100);
  const shippingCents = discountedSubtotalCents >= Math.round(freeShippingThreshold * 100)
    ? 0
    : Math.max(0, shippingBaseCents + methodSurchargeCents);
  const igvRate = paymentOptions?.igv_rate ?? 18;
  const igvCents = Math.round((discountedSubtotalCents + shippingCents) * igvRate / 100);
  const totalCents = discountedSubtotalCents + shippingCents + igvCents;
  const sameDayUnavailable = deliveryMethod === "same_day" && !profile.ubicacion_entrega?.toLocaleLowerCase("es").includes("lima");

  useEffect(() => {
    let active = true;
    Promise.all([getStoreProducts(), getStoreShippingOptions(), getStorePaymentOptions()])
      .then(([loadedProducts, shipping, payments]) => {
        if (!active) return;
        setProducts(loadedProducts);
        setShippingMethods(shipping.methods.filter((method) => method.enabled));
        setShippingZones(shipping.zones);
        setFreeShippingThreshold(Number(shipping.free_shipping_threshold));
        setPaymentOptions(payments);
        if (shipping.methods.some((method) => method.key === "estandar" && method.enabled)) {
          setDeliveryMethod("estandar");
        } else {
          const firstEnabled = shipping.methods.find((method) => method.enabled);
          if (firstEnabled) setDeliveryMethod(firstEnabled.key);
        }
        if (!payments.bank_transfer.enabled && payments.yape_plin.enabled) setPaymentMethod("yape_plin");
        else if (!payments.bank_transfer.enabled && payments.card_enabled) setPaymentMethod("card");
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la tienda.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    getClientStoreProfile(session.token)
      .then((loadedProfile) => {
        if (!active) return;
        setProfile((current) => ({ ...current, ...loadedProfile }));
        setName(loadedProfile.nombre || session.usuario.name);
        setEmail(session.usuario.email);
        if (loadedProfile.tipo_comprobante) setReceiptType(loadedProfile.tipo_comprobante);
        if (loadedProfile.tipo_documento) setDocumentType(loadedProfile.tipo_documento);
      })
      .catch((profileError: unknown) => {
        if (active) setError(profileError instanceof Error ? profileError.message : "No se pudieron cargar tus datos.");
      });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    const orderId = Number(new URLSearchParams(window.location.search).get("pedido"));
    if (!orderId || !session) return;
    getClientStoreOrders(session.token)
      .then((orders) => {
        const returnedOrder = orders.find((item) => item.id === orderId);
        if (returnedOrder) {
          setOrder(returnedOrder);
          setScreen("confirmation");
          setNotice("Volviste del proceso de pago. El estado se actualizará cuando recibamos la confirmación de la pasarela.");
        }
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "No se pudo recuperar el pedido."));
  }, [session]);

  useEffect(() => {
    document.title = `${screen === "confirmation" ? "Pedido confirmado" : "Tienda"} | DigitalPyme`;
  }, [screen]);

  useEffect(() => {
    const syncRoute = () => setScreen(window.location.pathname === "/carrito" ? "cart" : "catalog");
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const navigate = (nextScreen: Screen) => {
    const path = nextScreen === "catalog" ? "/tienda" : "/carrito";
    if (["catalog", "cart"].includes(nextScreen) && window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setScreen(nextScreen);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
    setAppliedCoupon(null);
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = authMode === "login"
        ? await clientLogin(email, password)
        : await registerClient({
          nombre: name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
      sessionStorage.removeItem("digitalpyme.admin.token");
      sessionStorage.removeItem("digitalpyme.admin.user");
      sessionStorage.setItem("digitalpyme.client.token", result.token);
      sessionStorage.setItem("digitalpyme.client.user", JSON.stringify(result.usuario));
      setSession(result);
      setScreen("checkout");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  };

  const applyCoupon = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || orderItems.length === 0) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await validateStoreCoupon(session.token, { code: couponCode.trim(), items: orderItems });
      setAppliedCoupon(result);
      setCouponCode(result.code);
      setNotice(`Cupón ${result.code} aplicado: − S/ ${money(result.discount_amount)}.`);
    } catch (couponError) {
      setAppliedCoupon(null);
      setError(couponError instanceof Error ? couponError.message : "No se pudo validar el cupón.");
    } finally {
      setBusy(false);
    }
  };

  const placeOrder = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || orderItems.length === 0 || !chosenMethod || !paymentOptions) return;
    if (sameDayUnavailable) {
      setError("El envío Same-day solo está disponible para Lima.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const createdOrder = await createStoreOrder(session.token, {
        items: orderItems,
        metodo_envio: deliveryMethod,
        payment_method: paymentMethod,
        ubicacion_entrega: profile.ubicacion_entrega ?? "",
        direccion_entrega: profile.direccion_entrega ?? "",
        telefono: profile.telefono ?? "",
        tipo_comprobante: receiptType,
        tipo_documento: documentType,
        numero_documento: profile.numero_documento ?? "",
        ...(receiptType === "factura" ? { empresa_facturacion: profile.empresa ?? "" } : {}),
        ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
      });
      setOrder(createdOrder);
      setCart({});
      setAppliedCoupon(null);
      localStorage.removeItem(CART_KEY);
      setNotice(createdOrder.email_enviado
        ? "Enviamos la confirmación y el resumen del pedido a tu correo."
        : "Pedido recibido. El correo de confirmación no pudo enviarse; revisa la configuración de correo del servidor.");
      setScreen("confirmation");
      window.history.replaceState({}, "", `/tienda?pedido=${createdOrder.id}`);
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "No se pudo crear el pedido.");
    } finally {
      setBusy(false);
    }
  };

  const payByCard = async () => {
    if (!session || !order) return;
    setBusy(true);
    setError("");
    try {
      const result = await startStoreCardPayment(session.token, order.id);
      window.location.assign(result.checkout_url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "No se pudo abrir el pago seguro.");
      setBusy(false);
    }
  };

  const submitReceipt = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !order || !receiptFile) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await uploadStoreOrderReceipt(session.token, order.id, receiptFile);
      setOrder({ ...order, payment_status: result.payment_status });
      setReceiptFile(null);
      setReceiptInputKey((key) => key + 1);
      setNotice("Comprobante enviado. El pago queda pendiente de verificación.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el comprobante.");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("digitalpyme.client.token");
    sessionStorage.removeItem("digitalpyme.client.user");
    setSession(null);
    setProfile(emptyProfile);
  };

  const availablePaymentMethods = paymentOptions
    ? [
      ...(paymentOptions.card_enabled ? [{ key: "card" as const, label: "Tarjeta", detail: paymentOptions.card_environment === "sandbox" ? "Pago de prueba · Sandbox" : "Pago seguro con Mercado Pago" }] : []),
      ...(paymentOptions.yape_plin.enabled ? [{ key: "yape_plin" as const, label: "Yape o Plin", detail: "Transfiere y adjunta tu comprobante" }] : []),
      ...(paymentOptions.bank_transfer.enabled ? [{ key: "bank_transfer" as const, label: "Transferencia", detail: paymentOptions.bank_transfer.bank ?? "Transferencia bancaria" }] : []),
    ]
    : [];

  return (
    <div className="physical-store">
      <header className="physical-store-header">
        <a className="physical-store-brand" href="/" onClick={(event) => { event.preventDefault(); window.location.assign("/"); }}>
          <strong>DigitalPyme</strong><span>Tienda</span>
        </a>
        <nav aria-label="Navegación de la tienda">
          <button type="button" onClick={() => navigate("catalog")}>Catálogo</button>
          {session && <span>Hola, {session.usuario.name}</span>}
          {session && <button type="button" onClick={logout}>Cerrar sesión</button>}
          <button type="button" className="physical-store-cart-link" onClick={() => navigate("cart")}>Carrito ({Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)})</button>
        </nav>
      </header>

      <main className="physical-store-main">
        <div className="physical-store-heading">
          <span className="kicker">Compra en línea</span>
          <h1>{screen === "confirmation" ? "¡Gracias por tu compra!" : screen === "checkout" ? "Datos y pago" : screen === "auth" ? "Accede para continuar" : screen === "cart" ? "Tu carrito" : "Productos para tu negocio"}</h1>
          {screen !== "confirmation" && <p>{screen === "catalog" && products.length === 0 ? "Estamos preparando nuestro catálogo. Muy pronto podrás explorar productos y hacer tu pedido desde aquí." : "Revisa tus productos, elige cómo recibirlos y confirma tu pedido de forma segura."}</p>}
          {screen !== "confirmation" && <div className="physical-store-steps" aria-label="Pasos de compra">
            <span className={screen === "catalog" ? "active" : ""}>1. Catálogo</span>
            <span className={screen === "cart" ? "active" : ""}>2. Carrito</span>
            <span className={screen === "checkout" || screen === "auth" ? "active" : ""}>3. Datos y pago</span>
          </div>}
        </div>

        {error && <p className="form-status error" role="alert">{error}</p>}
        {notice && <p className="form-status success" role="status">{notice}</p>}
        {loading && <p role="status">Cargando catálogo y opciones de compra...</p>}
        {!loading && products.length === 0 && screen === "catalog" && (
          <div className="physical-store-empty-content">
            <section className="physical-store-empty-hero">
              <div className="physical-store-empty-copy">
                <span className="physical-store-empty-label"><i /> Catálogo en preparación</span>
                <h2>Un espacio para las buenas ideas de tu negocio.</h2>
                <p>Estamos preparando una selección de productos para acompañar tu día a día. Cuando esté lista, podrás descubrirla y comprar desde aquí.</p>
                <div className="physical-store-empty-note">
                  <span className="physical-store-empty-note-mark" aria-hidden="true">i</span>
                  <span><strong>Estamos trabajando en ello</strong><small>Vuelve pronto para conocer las novedades.</small></span>
                </div>
              </div>
              <div className="physical-store-empty-art" aria-hidden="true">
                <div className="physical-store-empty-orbit physical-store-empty-orbit-one" />
                <div className="physical-store-empty-orbit physical-store-empty-orbit-two" />
                <div className="physical-store-empty-spark physical-store-empty-spark-one" />
                <div className="physical-store-empty-spark physical-store-empty-spark-two" />
                <div className="physical-store-empty-package">
                  <div className="physical-store-empty-package-flap" />
                  <div className="physical-store-empty-package-front"><span>DP</span><i /></div>
                </div>
                <div className="physical-store-empty-tag"><span>PRÓXIMAMENTE</span><strong>Algo bueno<br />está por llegar</strong></div>
                <div className="physical-store-empty-sticker">Digital<br />Pyme</div>
              </div>
            </section>
            <section className="physical-store-empty-details" aria-label="Cómo será la tienda">
              <article>
                <span>01</span>
                <div><h3>Un catálogo claro</h3><p>Conoce cada producto, su precio y disponibilidad antes de agregarlo al carrito.</p></div>
              </article>
              <article>
                <span>02</span>
                <div><h3>Compra sencilla</h3><p>Revisa tu pedido y completa tus datos en unos pocos pasos.</p></div>
              </article>
              <article>
                <span>03</span>
                <div><h3>Todo en un solo lugar</h3><p>Consulta las opciones de entrega y pago disponibles al momento de comprar.</p></div>
              </article>
            </section>
          </div>
        )}

        {!loading && screen === "catalog" && products.length > 0 && (
          <div className="physical-store-layout">
            <section className="physical-store-products" aria-label="Catálogo de productos">
              {products.map((product) => (
                <article className="physical-store-product" key={product.id}>
                  {product.imagen_url
                    ? <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
                    : <div className="physical-store-product-placeholder" aria-hidden="true">DP</div>}
                  {product.categoria && <small>{product.categoria}</small>}
                  <h2>{product.nombre}</h2>
                  {product.descripcion && <p>{product.descripcion}</p>}
                  <strong>S/ {money(product.precio)}</strong>
                  <small>Precio antes de IGV · {product.stock} disponibles</small>
                  <button className="button" type="button" disabled={product.stock < 1} onClick={() => updateQuantity(product.id, Math.min((cart[product.id] ?? 0) + 1, product.stock))}>
                    {cart[product.id] ? `Agregar otra unidad (${cart[product.id]})` : "Agregar al carrito"}
                  </button>
                </article>
              ))}
            </section>
            <aside className="physical-store-summary">
              <h2>Tu carrito</h2>
              {cartItems.length === 0 ? <p>Aún no agregas productos.</p> : cartItems.map((product) => (
                <div className="physical-store-summary-row" key={product.id}><span>{product.nombre} × {cart[product.id]}</span><strong>S/ {money(Number(product.precio) * cart[product.id])}</strong></div>
              ))}
              <button className="button" type="button" disabled={cartItems.length === 0} onClick={() => navigate("cart")}>Revisar carrito</button>
            </aside>
          </div>
        )}

        {!loading && screen === "cart" && (
          <div className="physical-store-layout physical-store-checkout-layout">
            <section className="physical-store-lines">
              {cartItems.length === 0 ? <div className="physical-store-empty"><h2>Tu carrito está vacío</h2><button className="button" type="button" onClick={() => navigate("catalog")}>Ver productos</button></div> : cartItems.map((product) => (
                <article className="physical-store-line" key={product.id}>
                  <div><h2>{product.nombre}</h2><span>S/ {money(product.precio)} por unidad</span></div>
                  <label>Cantidad
                    <input type="number" min="0" max={product.stock} value={cart[product.id]} onChange={(event) => updateQuantity(product.id, Math.min(Number(event.target.value), product.stock))} />
                  </label>
                  <strong>S/ {money(Number(product.precio) * cart[product.id])}</strong>
                  <button type="button" className="cart-remove" onClick={() => updateQuantity(product.id, 0)}>Quitar</button>
                </article>
              ))}
              <button className="button button-secondary" type="button" onClick={() => navigate("catalog")}>Seguir comprando</button>
            </section>
            <aside className="physical-store-summary">
              <h2>Resumen</h2>
              <div className="physical-store-total-row"><span>Subtotal</span><strong>S/ {money(subtotalCents / 100)}</strong></div>
              <div className="physical-store-total-row"><span>Envío estimado</span><strong>{shippingCents ? `S/ ${money(shippingCents / 100)}` : "Gratis"}</strong></div>
              <div className="physical-store-total-row"><span>IGV ({igvRate}%)</span><strong>S/ {money(igvCents / 100)}</strong></div>
              <div className="physical-store-total-row grand-total"><span>Total estimado</span><strong>S/ {money(totalCents / 100)}</strong></div>
              <p>El costo de envío puede variar según la ubicación y el método elegido.</p>
              <button className="button" type="button" disabled={cartItems.length === 0} onClick={() => navigate(session ? "checkout" : "auth")}>Continuar compra</button>
            </aside>
          </div>
        )}

        {!loading && screen === "auth" && (
          <section className="physical-store-auth">
            <div className="physical-store-auth-switch">
              <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Iniciar sesión</button>
              <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Crear cuenta</button>
            </div>
            <form className="auth-form" onSubmit={(event) => void signIn(event)}>
              {authMode === "register" && <label>Nombre completo<input required maxLength={255} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>}
              <label>Correo electrónico<input required type="email" autoComplete="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Contraseña<input required type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength={authMode === "register" ? 12 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {authMode === "register" && <label>Repetir contraseña<input required type="password" autoComplete="new-password" minLength={12} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} /></label>}
              <button className="button" type="submit" disabled={busy}>{busy ? "Verificando..." : authMode === "register" ? "Crear cuenta y continuar" : "Ingresar y continuar"}</button>
              <button className="button button-secondary" type="button" onClick={() => navigate("cart")}>Volver al carrito</button>
            </form>
          </section>
        )}

        {!loading && screen === "checkout" && (
          <form className="physical-store-layout physical-store-checkout-layout" onSubmit={(event) => void placeOrder(event)}>
            <section className="physical-store-checkout-form">
              {!session ? (
                <div className="physical-store-empty"><p>Inicia sesión o crea una cuenta para confirmar tu pedido.</p><button className="button" type="button" onClick={() => navigate("auth")}>Acceder</button></div>
              ) : (
                <>
                  <section className="physical-store-form-section">
                    <h2>1. Datos para el comprobante</h2>
                    <p>Los precios del catálogo son antes de IGV. El sistema calcula el impuesto y lo muestra por separado.</p>
                    <div className="physical-store-form-grid">
                      <label>Nombre<input readOnly value={session.usuario.name} /></label>
                      <label>Correo<input readOnly value={session.usuario.email} /></label>
                      <label>Teléfono<input required autoComplete="tel" maxLength={20} value={profile.telefono ?? ""} onChange={(event) => setProfile({ ...profile, telefono: event.target.value })} /></label>
                      <label>Tipo de comprobante<select value={receiptType} onChange={(event) => {
                        const nextType = event.target.value as "boleta" | "factura";
                        setReceiptType(nextType);
                        if (nextType === "factura") setDocumentType("ruc");
                        else if (documentType === "ruc") setDocumentType("dni");
                      }}><option value="boleta">Boleta</option><option value="factura">Factura</option></select></label>
                      <label>Documento<select value={documentType} disabled={receiptType === "factura"} onChange={(event) => setDocumentType(event.target.value as "dni" | "ruc")}><option value="dni">DNI</option><option value="ruc">RUC</option></select></label>
                      <label>{documentType.toUpperCase()}<input required inputMode="numeric" pattern={documentType === "dni" ? "[0-9]{8}" : "[0-9]{11}"} maxLength={documentType === "dni" ? 8 : 11} value={profile.numero_documento ?? ""} onChange={(event) => setProfile({ ...profile, numero_documento: event.target.value })} /></label>
                      {receiptType === "factura" && <label>Razón social<input required maxLength={255} value={profile.empresa ?? ""} onChange={(event) => setProfile({ ...profile, empresa: event.target.value })} /></label>}
                    </div>
                  </section>
                  <section className="physical-store-form-section">
                    <h2>2. Dirección de entrega</h2>
                    <div className="physical-store-form-grid">
                      <label>Distrito / ciudad<input required maxLength={120} autoComplete="address-level2" value={profile.ubicacion_entrega ?? ""} onChange={(event) => setProfile({ ...profile, ubicacion_entrega: event.target.value })} /></label>
                      <label>Dirección completa<input required maxLength={255} autoComplete="street-address" value={profile.direccion_entrega ?? ""} onChange={(event) => setProfile({ ...profile, direccion_entrega: event.target.value })} /></label>
                    </div>
                    <fieldset className="cart-shipping-options">
                      <legend>Elige el método de envío</legend>
                      {shippingMethods.map((method) => <label key={method.key}>
                        <input type="radio" name="delivery" checked={deliveryMethod === method.key} onChange={() => setDeliveryMethod(method.key)} />
                        <span><b>{method.nombre}</b><small>{method.delivery_days === 0 ? "Entrega el mismo día" : `${method.delivery_days} días hábiles`}</small></span>
                        <strong>{method.cost === 0 ? "Gratis" : `Desde S/ ${money(method.cost)}`}</strong>
                      </label>)}
                    </fieldset>
                  </section>
                  <section className="physical-store-form-section">
                    <h2>3. Método de pago</h2>
                    {availablePaymentMethods.length === 0 ? <p className="form-status error">No hay métodos de pago configurados. Comunícate con la tienda.</p> : (
                      <div className="physical-store-payment-options">
                        {availablePaymentMethods.map((method) => <label key={method.key} className={paymentMethod === method.key ? "selected" : ""}>
                          <input type="radio" name="payment" value={method.key} checked={paymentMethod === method.key} onChange={() => setPaymentMethod(method.key)} />
                          <span><b>{method.label}</b><small>{method.detail}</small></span>
                        </label>)}
                      </div>
                    )}
                  </section>
                </>
              )}
            </section>
            <aside className="physical-store-summary">
              <h2>Tu pedido</h2>
              {cartItems.map((product) => <div className="physical-store-summary-row" key={product.id}><span>{product.nombre} × {cart[product.id]}</span><strong>S/ {money(Number(product.precio) * cart[product.id])}</strong></div>)}
              {session && <form className="physical-store-coupon" onSubmit={(event) => void applyCoupon(event)}>
                <label htmlFor="store-coupon">Cupón de descuento</label>
                <div><input id="store-coupon" maxLength={32} value={couponCode} onChange={(event) => { setCouponCode(event.target.value); setAppliedCoupon(null); }} placeholder="Ingresa tu código" /><button className="button button-secondary" type="submit" disabled={busy || !couponCode.trim()}>Aplicar</button></div>
              </form>}
              <div className="physical-store-total-row"><span>Subtotal</span><strong>S/ {money(subtotalCents / 100)}</strong></div>
              {discountCents > 0 && <div className="physical-store-total-row"><span>Descuento {appliedCoupon?.code}</span><strong>− S/ {money(discountCents / 100)}</strong></div>}
              <div className="physical-store-total-row"><span>Envío</span><strong>{shippingCents ? `S/ ${money(shippingCents / 100)}` : "Gratis"}</strong></div>
              <div className="physical-store-total-row"><span>IGV ({igvRate}%)</span><strong>S/ {money(igvCents / 100)}</strong></div>
              <div className="physical-store-total-row grand-total"><span>Total</span><strong>S/ {money(totalCents / 100)}</strong></div>
              <p className="physical-store-tax-note">IGV calculado sobre productos menos descuentos y envío.</p>
              <button className="button" type="submit" disabled={busy || !session || cartItems.length === 0 || availablePaymentMethods.length === 0 || sameDayUnavailable}>
                {busy ? "Procesando pedido..." : "Confirmar compra"}
              </button>
              <button className="button button-secondary" type="button" onClick={() => navigate("cart")}>Volver al carrito</button>
            </aside>
          </form>
        )}

        {screen === "confirmation" && order && (
          <section className="physical-store-confirmation">
            <div className="physical-store-confirmation-icon" aria-hidden="true">✓</div>
            <h2>Pedido #{order.id}</h2>
            <p>Tu pedido fue registrado. Estado del pago: <strong>{order.payment_status.replace(/_/g, " ")}</strong>.</p>
            <div className="physical-store-summary physical-store-confirmation-summary">
              {order.items.map((item) => <div className="physical-store-summary-row" key={item.id}><span>{item.nombre} × {item.cantidad}</span><strong>S/ {money(item.subtotal)}</strong></div>)}
              <div className="physical-store-total-row"><span>Subtotal</span><strong>S/ {money(order.subtotal)}</strong></div>
              {Number(order.discount_amount) > 0 && <div className="physical-store-total-row"><span>Descuento {order.coupon_code}</span><strong>− S/ {money(order.discount_amount)}</strong></div>}
              <div className="physical-store-total-row"><span>Envío</span><strong>S/ {money(order.costo_envio)}</strong></div>
              <div className="physical-store-total-row"><span>IGV ({order.igv_rate}%)</span><strong>S/ {money(order.igv_amount)}</strong></div>
              <div className="physical-store-total-row grand-total"><span>Total</span><strong>S/ {money(order.total)}</strong></div>
            </div>
            {order.payment_method === "card" && paymentOptions?.card_enabled && order.payment_status !== "pagado" && (
              <button className="button" type="button" disabled={busy} onClick={() => void payByCard()}>
                {busy ? "Abriendo pago..." : `Pagar con tarjeta${paymentOptions.card_environment === "sandbox" ? " · Sandbox" : ""}`}
              </button>
            )}
            {order.payment_method === "bank_transfer" && paymentOptions?.bank_transfer.enabled && order.payment_status !== "pagado" && <div className="store-payment-instructions">
              <strong>Transferencia bancaria</strong>
              <p>{paymentOptions.bank_transfer.bank} · Titular: {paymentOptions.bank_transfer.holder}</p>
              <p>Cuenta: <b>{paymentOptions.bank_transfer.account}</b>{paymentOptions.bank_transfer.cci ? ` · CCI: ${paymentOptions.bank_transfer.cci}` : ""}</p>
              <p>Transfiere el total exacto del pedido y adjunta tu comprobante aquí abajo.</p>
            </div>}
            {order.payment_method === "yape_plin" && paymentOptions?.yape_plin.enabled && order.payment_status !== "pagado" && <div className="store-payment-instructions">
              <strong>Yape o Plin</strong>
              <p>Número <b>{paymentOptions.yape_plin.phone}</b>{paymentOptions.yape_plin.holder ? ` · Titular: ${paymentOptions.yape_plin.holder}` : ""}</p>
              <img src={paymentOptions.yape_plin.qr_url || "/images/yape-qr.png"} alt="Código QR de pago por Yape" />
              <p>Escanea el QR o usa el número indicado y transfiere el total exacto del pedido.</p>
            </div>}
            {(order.payment_status === "pendiente" || order.payment_status === "rechazado") && order.payment_method !== "card" && (
              <form className="auth-form" onSubmit={(event) => void submitReceipt(event)}>
                <label>Adjunta tu comprobante (PDF, JPG o PNG, máximo 10 MB)
                  <input
                    key={receiptInputKey}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    required
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        setReceiptFile(null);
                        event.currentTarget.value = "";
                        setError("El comprobante no puede superar los 10 MB.");
                        return;
                      }
                      setError("");
                      setReceiptFile(file);
                    }}
                  />
                </label>
                <button className="button" type="submit" disabled={busy || !receiptFile}>
                  {busy ? "Enviando comprobante..." : "Ya pagué · Enviar comprobante"}
                </button>
                <p>Verificaremos el pago antes de confirmar el pedido.</p>
              </form>
            )}
            <p>Te enviamos el resumen informativo al correo de tu cuenta. Este documento no reemplaza una boleta o factura electrónica emitida por SUNAT.</p>
            <button className="button button-secondary" type="button" onClick={() => navigate("catalog")}>Volver a la tienda</button>
          </section>
        )}
      </main>
    </div>
  );
}
