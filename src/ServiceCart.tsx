import { useEffect, useMemo, useState } from "react";
import type { ApiService } from "./lib/api";

const SERVICE_CART_KEY = "digitalpyme.service-cart.v1";

function serviceSlug(service: ApiService): string {
  return service.slug || service.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const serviceImages: Record<string, string> = {
  "servicio-de-prueba": "/images/services/servicio-digital.jpg",
  "paginas-web": "/images/services/paginas-web.jpg",
  "tiendas-en-linea": "/images/services/tiendas-en-linea.jpg",
  branding: "/images/services/branding.jpg",
  "marketing-digital": "/images/services/marketing-digital.jpg",
  mantenimiento: "/images/services/mantenimiento.jpg",
};

export function serviceImage(service: ApiService): string {
  return serviceImages[serviceSlug(service)] ?? "/images/services/servicio-digital.jpg";
}

function readServiceCart(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(SERVICE_CART_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

export function addServicesToCart(services: ApiService[]): void {
  const slugs = new Set(readServiceCart());
  for (const service of services) slugs.add(serviceSlug(service));
  localStorage.setItem(SERVICE_CART_KEY, JSON.stringify([...slugs]));
}

function formatPrice(value: ApiService["precio_desde"]): string {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "A cotizar";
  return `Desde S/ ${Number(value).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ServiceCart({
  services,
  onQuote,
  onClosePortal,
}: {
  services: ApiService[];
  onQuote: (serviceNames: string[]) => void;
  onClosePortal: () => void;
}) {
  const [cartPage, setCartPage] = useState(() => window.location.pathname === "/carrito-servicios");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(readServiceCart);
  const activeServices = useMemo(() => services.filter((service) => service.activo), [services]);
  const selectedServices = useMemo(
    () => activeServices.filter((service) => selectedSlugs.includes(serviceSlug(service))),
    [activeServices, selectedSlugs],
  );
  const categories = useMemo(
    () => [...new Set(activeServices.map((service) => service.category?.nombre ?? service.categoria).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "es")),
    [activeServices],
  );
  const query = search.trim().toLocaleLowerCase("es");
  const filteredServices = activeServices.filter((service) => {
    const serviceCategory = service.category?.nombre ?? service.categoria ?? "";
    return (!category || serviceCategory === category)
      && (!query || `${service.nombre} ${service.descripcion ?? ""} ${serviceCategory}`.toLocaleLowerCase("es").includes(query));
  });

  useEffect(() => {
    const syncCartRoute = () => setCartPage(window.location.pathname === "/carrito-servicios");
    window.addEventListener("popstate", syncCartRoute);
    return () => window.removeEventListener("popstate", syncCartRoute);
  }, []);

  useEffect(() => {
    document.title = `${cartPage ? "Carrito de servicios" : "Servicios"} | DigitalPyme`;
  }, [cartPage]);

  const navigateCart = (showCart: boolean) => {
    const path = showCart ? "/carrito-servicios" : "/catalogo-servicios";
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setCartPage(showCart);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleService = (service: ApiService) => {
    const slug = serviceSlug(service);
    setSelectedSlugs((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      localStorage.setItem(SERVICE_CART_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeService = (service: ApiService) => {
    const slug = serviceSlug(service);
    setSelectedSlugs((current) => {
      const next = current.filter((item) => item !== slug);
      localStorage.setItem(SERVICE_CART_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="store-demo service-cart-page">
      <header className="store-demo-header">
        <a className="brand-link" href="/" onClick={(event) => { event.preventDefault(); onClosePortal(); }}>
          <strong>DigitalPyme</strong>
        </a>
        <div>
          <a href="/catalogo-servicios" onClick={(event) => { event.preventDefault(); navigateCart(false); }}>Servicios</a>
          {cartPage
            ? <button className="store-cart-link" type="button" onClick={() => navigateCart(false)}>Seguir viendo servicios</button>
            : <button className="store-cart-link" type="button" onClick={() => navigateCart(true)}>Carrito de servicios ({selectedServices.length})</button>}
          <button className="button button-secondary" type="button" onClick={onClosePortal}>Volver al inicio</button>
        </div>
      </header>

      <main className="store-demo-content">
        <div className="store-demo-title">
          <span className="kicker">{cartPage ? "Tu selección" : "Soluciones digitales"}</span>
          <h1>{cartPage ? "Carrito de servicios" : "Servicios para tu negocio"}</h1>
          <p>
            {cartPage
              ? "Revisa los servicios que te interesan y solicita una propuesta a medida."
              : "Explora los servicios de DigitalPyme y agrega a tu carrito los que quieres incluir en tu proyecto."}
          </p>
        </div>

        {cartPage ? (
          <div className="store-demo-grid cart-page-grid">
            <section className="cart-items-panel" aria-label="Servicios seleccionados">
              <div className="cart-table-head service-cart-table-head"><span>Servicio</span><span>Inversión</span><span>Acción</span></div>
              {selectedServices.length === 0 ? (
                <div className="cart-empty">
                  <h2>Tu carrito está vacío</h2>
                  <p>Agrega los servicios que te interesan para preparar tu solicitud de cotización.</p>
                  <button className="button" type="button" onClick={() => navigateCart(false)}>Ver servicios</button>
                </div>
              ) : selectedServices.map((service) => (
                <article className="cart-line service-cart-line" key={serviceSlug(service)}>
                  <div className="cart-product">
                    <span className="store-product-symbol" aria-hidden="true">DP</span>
                    <div><strong>{service.nombre}</strong><small>{service.category?.nombre ?? service.categoria ?? "Servicio digital"}</small></div>
                  </div>
                  <strong className="service-cart-price">{formatPrice(service.precio_desde)}</strong>
                  <button type="button" className="cart-remove" onClick={() => removeService(service)}>Quitar</button>
                </article>
              ))}
            </section>

            <aside className="store-cart portal-panel cart-summary-panel">
              <h2>Tu solicitud</h2>
              <div className="cart-order-totals">
                <div><span>Servicios seleccionados</span><strong>{selectedServices.length}</strong></div>
                <div><span>Inversión final</span><strong>A cotizar</strong></div>
              </div>
              <p className="service-cart-note">El precio final depende del alcance acordado. Enviar la solicitud no genera ningún cobro; primero recibirás una cotización formal para revisar y aceptar.</p>
              <button
                className="button service-cart-quote-button"
                type="button"
                disabled={selectedServices.length === 0}
                onClick={() => onQuote(selectedServices.map((service) => service.nombre))}
              >
                Solicitar cotización
              </button>
            </aside>
          </div>
        ) : (
          <div className="store-demo-grid">
            <section className="store-catalog service-cart-catalog" aria-label="Catálogo de servicios">
              <label className="store-search">
                <span>Buscar servicios</span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o descripción" />
              </label>
              {categories.length > 0 && <label className="store-search">
                <span>Categoría</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">Todas las categorías</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>}
              {activeServices.length === 0 && <div className="portal-panel"><h2>No hay servicios publicados</h2><p>Comunícate con DigitalPyme para conocer las soluciones disponibles.</p></div>}
              {activeServices.length > 0 && filteredServices.length === 0 && <p role="status">No encontramos servicios que coincidan con “{search}”.</p>}
              <div className="store-products">
                {filteredServices.map((service) => {
                  const isSelected = selectedSlugs.includes(serviceSlug(service));
                  return (
                    <article className="store-product-card service-offer-card" key={serviceSlug(service)}>
                      <img
                        className="service-offer-image"
                        src={serviceImage(service)}
                        alt={`Ilustración de ${service.nombre}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="service-offer-content">
                        <small>{service.category?.nombre ?? service.categoria ?? "Servicio digital"}{service.duracion ? ` · ${service.duracion}` : ""}</small>
                        <h2>{service.nombre}</h2>
                        <p>{service.descripcion || "Solución digital personalizada para tu negocio."}</p>
                        <strong>{formatPrice(service.precio_desde)}</strong>
                        <button className={isSelected ? "button button-secondary" : "button"} type="button" onClick={() => toggleService(service)}>
                          {isSelected ? "Quitar del carrito" : "Agregar al carrito"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
            <aside className="store-cart portal-panel service-cart-summary">
              <h2>Carrito de servicios</h2>
              {selectedServices.map((service) => (
                <div className="store-cart-row" key={serviceSlug(service)}>
                  <span>{service.nombre}</span><strong>{formatPrice(service.precio_desde)}</strong>
                </div>
              ))}
              {selectedServices.length === 0 && <p>Agrega servicios para preparar tu solicitud.</p>}
              <p className="service-cart-note">La inversión final se confirma en una cotización formal, según el alcance de tu proyecto.</p>
              <button className="button service-cart-quote-button" type="button" disabled={selectedServices.length === 0} onClick={() => navigateCart(true)}>
                Revisar carrito ({selectedServices.length})
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
