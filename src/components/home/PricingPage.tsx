import { useEffect } from "react"
import { updateMeta } from "../../utils/siteSettings"
import {
  additionalDigitalServices,
  pricingCategories,
} from "../../constants/siteData"

export default function PricingPage({
  onQuote,
}: {
  onQuote: (service?: string, message?: string) => void
}) {
  useEffect(() => {
    const title = "Precios y planes | DigitalPyme"
    const description =
      "Conoce los planes de páginas web, landing pages, tiendas virtuales y servicios digitales de DigitalPyme."
    document.title = title
    updateMeta('meta[name="description"]', "name", "description", description)
    updateMeta('meta[property="og:title"]', "property", "og:title", title)
    updateMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    )
    updateMeta(
      'meta[property="og:url"]',
      "property",
      "og:url",
      `${window.location.origin}/precios`,
    )
    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    if (canonical) canonical.href = `${window.location.origin}/precios`
  }, [])

  return (
    <main className="pricing-page">
      <section className="pricing-hero">
        <div className="container">
          <span className="kicker kicker-light">
            Precios claros, soluciones a tu medida
          </span>
          <h1>Planes y precios para hacer crecer tu negocio.</h1>
          <p>
            Compara opciones para tu página web, landing page o tienda virtual.
            El alcance final se confirma en una propuesta antes de iniciar.
          </p>
        </div>
      </section>

      <div className="container pricing-content">
        {pricingCategories.map((category, categoryIndex) => (
          <section className="pricing-category" key={category.title}>
            <div className="pricing-category-heading">
              <span className="kicker">
                0{categoryIndex + 1} · Precios en soles
              </span>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
            </div>
            <div className="pricing-plans">
              {category.plans.map((plan) => (
                <article className="pricing-card" key={plan.name}>
                  <h3>{plan.name}</h3>
                  <div className="pricing-card-price">
                    <strong>S/ {plan.price.toLocaleString("es-PE")}</strong>
                    <del>
                      Precio regular: S/{" "}
                      {plan.regularPrice.toLocaleString("es-PE")}
                    </del>
                    <span>{plan.audience}</span>
                  </div>
                  <ul className="pricing-plan-features">
                    <li>
                      <b>{plan.pages}</b>
                    </li>
                    <li>
                      <b>{plan.sections}</b>
                    </li>
                    {plan.extras.map((extra) => (
                      <li key={extra}>{extra}</li>
                    ))}
                    <li className="pricing-delivery">
                      Tiempo estimado: {plan.delivery}
                    </li>
                  </ul>
                  <div className="pricing-renewal">
                    Renovación anual: S/ {plan.renewal}
                  </div>
                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      onQuote(
                        category.service,
                        `Quiero cotizar el plan ${plan.name} de ${category.title} (S/ ${plan.price}).`,
                      )
                    }
                  >
                    Generar cotización
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="pricing-addons">
          <div className="pricing-category-heading">
            <span className="kicker">Servicios complementarios</span>
            <h2>Completa tu solución digital.</h2>
            <p>
              Agrega los servicios que tu negocio necesita. El precio y alcance
              se validan en la cotización.
            </p>
          </div>
          <div className="pricing-addon-grid">
            {additionalDigitalServices.map((service) => (
              <article className="pricing-addon" key={service.title}>
                <span>{service.label}</span>
                <h3>{service.title}</h3>
                <strong>{service.price}</strong>
                <p>{service.description}</p>
                <ul>
                  {service.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    onQuote(
                      service.service,
                      `Quiero información y cotización para: ${service.title}.`,
                    )
                  }
                >
                  Consultar servicio
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className="pricing-notes">
          <h2>Antes de contratar</h2>
          <ul>
            <li>Precios expresados en soles y no incluyen IGV.</li>
            <li>
              El hosting, dominio .COM, correos profesionales y SSL se incluyen
              según el plan; las renovaciones anuales tienen el precio indicado.
            </li>
            <li>
              Los tiempos de entrega son estimados y empiezan cuando se recibe
              el contenido y la información necesarios.
            </li>
            <li>
              Las comisiones de pasarela, condiciones de hosting y alcance de
              soporte dependen del proveedor y se confirman antes de contratar.
            </li>
          </ul>
          <p>
            ¿No sabes qué plan elegir? Cuéntanos qué necesitas y te ayudamos a
            definir el alcance.
          </p>
          <button className="button" type="button" onClick={() => onQuote()}>
            Solicitar orientación
          </button>
        </aside>
      </div>
    </main>
  )
}
