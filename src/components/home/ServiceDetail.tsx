import { useEffect, useState } from "react"
import {
  getCoverage,
  getServiceBySlug,
  type ApiPortfolioProject,
  type ApiService,
  type CoverageResult,
} from "../../lib/api"
import {
  defaultServiceProposalGuidance,
  formatCurrency,
  formatServiceMeta,
  serviceProposalGuidance,
  serviceSlug,
} from "../../constants/siteData"
import { updateMeta } from "../../utils/siteSettings"

export function StoreCoverage() {
  const [location, setLocation] = useState("")
  const [coverage, setCoverage] = useState<CoverageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const checkCoverage = async () => {
    setLoading(true)
    setError("")
    try {
      setCoverage(await getCoverage(location, "Tiendas en línea"))
    } catch (coverageError) {
      setError(
        coverageError instanceof Error
          ? coverageError.message
          : "No se pudo consultar la cobertura.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="store-coverage">
      <label>
        <span>Ubicación de referencia para la tienda en línea</span>
        <input
          maxLength={120}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Distrito o ciudad"
        />
      </label>
      <button
        className="button button-secondary"
        type="button"
        disabled={loading}
        onClick={() => void checkCoverage()}
      >
        {loading ? "Consultando..." : "Consultar cobertura"}
      </button>
      <small>
        La cobertura y tarifa corresponden a las opciones de envío que se
        configurarían en tu tienda; no son un cobro de este servicio digital.
      </small>
      {coverage?.envio &&
        (coverage.envio.ubicacion_requerida ? (
          <p>
            {coverage.envio.zonas?.length
              ? `Zonas configuradas: ${coverage.envio.zonas.map((zone) => zone.location).join(", ")}`
              : "Aún no hay zonas de envío configuradas."}
          </p>
        ) : coverage.envio.cubierto ? (
          <p>
            {coverage.envio.ubicacion}: S/{" "}
            {formatCurrency(coverage.envio.costo ?? 0)}
            {coverage.envio.plazo_dias
              ? ` · ${coverage.envio.plazo_dias} días`
              : ""}
          </p>
        ) : (
          <p>{coverage.envio.mensaje}</p>
        ))}
      {error && <p className="form-status error">{error}</p>}
    </div>
  )
}

export default function ServiceDetail({
  slug,
  service,
  projects,
  onQuote,
  onNavigate,
}: {
  slug: string
  service: ApiService | undefined
  projects: ApiPortfolioProject[]
  onQuote: (name: string) => void
  onNavigate: (path: string) => void
}) {
  const [detail, setDetail] = useState<ApiService & {
    proyectos_relacionados?: ApiPortfolioProject[]
  } | null>(service ?? null)

  useEffect(() => {
    let active = true
    setDetail(service ?? null)
    void getServiceBySlug(slug).then((result) => {
      if (!active || !result) return
      setDetail(result)
    })
    return () => {
      active = false
    }
  }, [slug, service])

  useEffect(() => {
    if (!detail) return
    const title = `${detail.nombre} | DigitalPyme`
    const description =
      detail.descripcion_larga ||
      detail.descripcion ||
      `Conoce el servicio de ${detail.nombre} de DigitalPyme.`
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
      `${window.location.origin}/servicios/${slug}`,
    )
    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    if (canonical)
      canonical.href = `${window.location.origin}/servicios/${slug}`
  }, [detail, slug])

  if (!detail) {
    return (
      <main className="service-detail container">
        <p>Servicio no encontrado.</p>
        <a
          className="button"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            onNavigate("/")
          }}
        >
          Volver al inicio
        </a>
      </main>
    )
  }

  const relatedProjects = detail.proyectos_relacionados?.length
    ? detail.proyectos_relacionados
    : projects.filter((project) => project.related_service_id === detail.id)
  const proposalGuidance =
    serviceProposalGuidance[serviceSlug(detail)] ??
    defaultServiceProposalGuidance

  return (
    <main className="service-detail container">
      <nav className="breadcrumbs" aria-label="Migas de pan">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onNavigate("/")
          }}
        >
          Inicio
        </a>
        <span>›</span>
        <a
          href="/#servicios"
          onClick={(event) => {
            event.preventDefault()
            onNavigate("/#servicios")
          }}
        >
          Servicios
        </a>
        <span>›</span>
        <span aria-current="page">{detail.nombre}</span>
      </nav>
      <span className="kicker">
        {detail.category?.nombre || "Servicio digital"}
        {detail.subcategory ? ` · ${detail.subcategory.nombre}` : ""}
      </span>
      {detail.etiqueta && (
        <span className="catalog-badge">{detail.etiqueta}</span>
      )}
      <h1>{detail.nombre}</h1>
      <p className="service-detail-lead">
        {detail.descripcion_larga || detail.descripcion}
      </p>
      <div className="service-detail-meta">
        <span>{formatServiceMeta(detail)}</span>
      </div>
      <button
        className="button"
        type="button"
        onClick={() => onQuote(detail.nombre)}
      >
        Añadir a mi proyecto
      </button>

      {detail.incluye?.length ? (
        <section>
          <h2>Qué incluye</h2>
          <ul className="service-includes">
            {detail.incluye.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="service-detail-guidance">
        <h2>Más información del servicio</h2>
        <p>{proposalGuidance.description}</p>
        <div className="service-guidance-grid">
          <article>
            <h3>Para preparar tu propuesta</h3>
            <ul>
              {proposalGuidance.details.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Cómo avanzamos</h3>
            <ol>
              <li>Conversamos sobre tu negocio y lo que necesitas.</li>
              <li>
                Definimos el alcance, los entregables y el precio en una
                propuesta.
              </li>
              <li>
                Con tu aprobación, coordinamos el inicio y las revisiones del
                proyecto.
              </li>
            </ol>
          </article>
        </div>
      </section>
      {/tienda|e-commerce|ecommerce/i.test(detail.nombre) && (
        <section className="store-detail-coverage">
          <h2>Envío y cobertura</h2>
          <StoreCoverage />
        </section>
      )}
      {relatedProjects.length > 0 && (
        <section>
          <h2>Proyectos relacionados</h2>
          <div className="related-projects">
            {relatedProjects.map((project) => (
              <a
                href="/#proyectos"
                key={project.id ?? project.nombre}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate("/#proyectos")
                }}
              >
                <img
                  src={project.imagen}
                  alt={
                    project.imagen_alt ||
                    `Proyecto digital para ${project.nombre}`
                  }
                  loading="lazy"
                  decoding="async"
                />
                <span>
                  <b>{project.nombre}</b>
                  {project.resultado}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
