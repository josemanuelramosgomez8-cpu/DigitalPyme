import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import Header from "./components/layout/Header"
import SiteFooter from "./components/layout/SiteFooter"
import MainLayout from "./layouts/MainLayout"
import CatalogoServicios from "./CatalogoServicios"
import ServicesSection from "./components/home/ServicesSection"
import { useCart } from "./context/CartContext"
import HeroCarousel from "./components/HeroCarousel"
import ContactForm from "./components/home/ContactForm"
import AgendaScheduler from "./components/home/AgendaScheduler"
import ReviewWall from "./components/home/ReviewWall"
import PricingPage from "./components/home/PricingPage"
import ServiceDetail from "./components/home/ServiceDetail"
import Icon from "./components/common/Icon"
import LegalPolicyPage from "./components/LegalPolicyPage"
import {
  demoReviewExamples,
  fallbackServices,
  faqs,
  formatServiceMeta,
  reviewPageSize,
  serviceSlug,
} from "./constants/siteData"
import { addServicesToCart } from "./utils/serviceCartStorage"
import { applySiteSettings, mergeSiteSettings } from "./utils/siteSettings"
import {
  getPortfolioProjects,
  getServiceCategories,
  getServiceReviews,
  getServices,
  getTestimonials,
  getPublicSiteSettings,
  refreshServiceReviews,
  type ApiPortfolioProject,
  type ApiService,
  type ApiTestimonial,
  type ClientSession,
  type LegalKind,
  type ServiceCategory,
  type ServiceReview,
  type SiteSettings,
  defaultSiteSettings,
} from "./lib/api"

const AdminPortal = lazy(() => import("./AdminPortal"))
const PhysicalStore = lazy(() => import("./PhysicalStore"))
const ServiceCart = lazy(() => import("./ServiceCart"))
const PasswordResetPage = lazy(() => import("./PasswordResetPage"))
const ClientPortal = lazy(() => import("./components/modals/ClientPortal"))
const QuoteBuilder = lazy(() => import("./components/modals/QuoteBuilder"))
const ReviewSubmissionDialog = lazy(
  () => import("./components/modals/ReviewSubmissionDialog"),
)
const PortfolioProjectDialog = lazy(
  () => import("./components/modals/PortfolioProjectDialog"),
)
const LegalDialog = lazy(() => import("./components/modals/LegalDialog"))

const legalRoutes: Record<string, LegalKind> = {
  "/legal/privacidad": "privacy",
  "/legal/terminos-y-condiciones": "terms",
  "/legal/pagos-y-facturacion": "payments",
  "/legal/reembolsos-y-cancelaciones": "returns",
  "/legal/revisiones-y-entregas": "revisions",
  "/legal/propiedad-intelectual": "intellectual_property",
  "/legal/promociones": "promotions",
  "/libro-de-reclamaciones": "complaints",
}

function getLegalPath(pathname: string): LegalKind | null {
  return legalRoutes[pathname] ?? null
}

function PageLoading() {
  return (
    <div className="portal-loading" role="status" aria-live="polite">
      <p>Cargando...</p>
    </div>
  )
}

export default function App() {
  const { addToCart, isInCart } = useCart()
  const [faq, setFaq] = useState<number | null>(0)
  const [filter, setFilter] = useState("Todos")
  const [serviceFilter, setServiceFilter] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [projectSearch, setProjectSearch] = useState("")
  const [services, setServices] = useState(fallbackServices)
  const [projects, setProjects] = useState<ApiPortfolioProject[]>([])
  const [selectedPortfolioProject, setSelectedPortfolioProject] =
    useState<ApiPortfolioProject | null>(null)
  const closePortfolioProject = useCallback(
    () => setSelectedPortfolioProject(null),
    [],
  )
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([])
  const [reviews, setReviews] = useState<ServiceReview[]>([])
  const [pendingReviewPreviews, setPendingReviewPreviews] =
    useState<ServiceReview[]>([])
  const [visibleReviewCount, setVisibleReviewCount] = useState(3)
  const [hasMoreReviews, setHasMoreReviews] = useState(false)
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)
  const [reviewLoadError, setReviewLoadError] = useState("")
  const [refreshingReviews, setRefreshingReviews] = useState(false)
  const refreshingReviewsRef = useRef(false)
  const [reviewRefreshStatus, setReviewRefreshStatus] = useState("")
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const closeReviewDialog = useCallback(() => setReviewDialogOpen(false), [])
  const handleReviewSubmitted = useCallback((review: ServiceReview) => {
    setPendingReviewPreviews((current) => [
      review,
      ...current.filter((item) => item.id !== review.id),
    ])
    setReviewRefreshStatus(
      "Tu reseña ya aparece aquí como pendiente de revisión. Después de aprobarla, quedará publicada para todos.",
    )
  }, [])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(
    () => new URLSearchParams(window.location.search).get("admin") === "1",
  )
  const [quoteInitialServices, setQuoteInitialServices] = useState<string[]>([])
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings)
  const [servicePath, setServicePath] = useState<string | null>(
    () =>
      window.location.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ??
      null,
  )
  const [legalPath, setLegalPath] = useState<LegalKind | null>(() =>
    getLegalPath(window.location.pathname),
  )
  const [storePath, setStorePath] = useState(() =>
    ["/tienda", "/carrito"].includes(window.location.pathname),
  )
  const [serviceCartPath, setServiceCartPath] = useState(() =>
    ["/catalogo-servicios", "/carrito-servicios"].includes(
      window.location.pathname,
    ),
  )
  const [pricingPath, setPricingPath] = useState(
    () => window.location.pathname === "/precios",
  )
  const [legalOpen, setLegalOpen] = useState<LegalKind | null>(null)
  const [quoteInitialMessage, setQuoteInitialMessage] = useState("")

  const openQuote = (service?: string, message = "") => {
    setQuoteInitialServices(service ? [service] : [])
    setQuoteInitialMessage(message)
    setQuoteOpen(true)
  }

  useEffect(() => {
    let active = true
    void Promise.all([
      getServices(fallbackServices),
      getPortfolioProjects([]),
      getTestimonials([]),
      getServiceReviews(0, reviewPageSize + 1),
      getServiceCategories(),
    ]).then(
      ([
        loadedServices,
        loadedProjects,
        loadedTestimonials,
        loadedReviews,
        loadedCategories,
      ]) => {
        if (!active) return
        setServices(loadedServices)
        setProjects(loadedProjects)
        setTestimonials(loadedTestimonials)
        setReviews(loadedReviews.slice(0, reviewPageSize))
        setHasMoreReviews(loadedReviews.length > reviewPageSize)
        setCategories(
          loadedCategories.length
            ? loadedCategories
            : loadedServices.flatMap((item) =>
                item.category ? [item.category] : [],
              ),
        )
      },
    )

    return () => {
      active = false
    }
  }, [])

  const loadMoreReviews = async () => {
    setReviewLoadError("")
    if (reviews.length === 0) {
      setVisibleReviewCount((count) =>
        Math.min(count + 3, demoReviewExamples.length),
      )
      return
    }
    if (visibleReviewCount < reviews.length) {
      setVisibleReviewCount((count) => count + 3)
      return
    }
    if (!hasMoreReviews || loadingMoreReviews) return

    setLoadingMoreReviews(true)
    try {
      const nextReviews = await getServiceReviews(
        reviews.length,
        reviewPageSize + 1,
      )
      setReviews((current) => [
        ...current,
        ...nextReviews.slice(0, reviewPageSize),
      ])
      setVisibleReviewCount((count) => count + 3)
      setHasMoreReviews(nextReviews.length > reviewPageSize)
    } catch (loadError) {
      setReviewLoadError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar más reseñas.",
      )
    } finally {
      setLoadingMoreReviews(false)
    }
  }

  const refreshApprovedReviews = async () => {
    if (refreshingReviewsRef.current) return
    refreshingReviewsRef.current = true
    setRefreshingReviews(true)
    setReviewLoadError("")
    try {
      const loadedReviews = await refreshServiceReviews(reviewPageSize + 1)
      const approvedReviews = loadedReviews.slice(0, reviewPageSize)
      setReviews(approvedReviews)
      setVisibleReviewCount(3)
      setHasMoreReviews(loadedReviews.length > reviewPageSize)
      const approvedPendingReviews = pendingReviewPreviews.filter((pending) =>
        approvedReviews.some((approved) => approved.id === pending.id),
      )
      if (approvedPendingReviews.length > 0) {
        const approvedIds = new Set(
          approvedPendingReviews.map((review) => review.id),
        )
        setPendingReviewPreviews((current) =>
          current.filter((review) => !approvedIds.has(review.id)),
        )
        setReviewRefreshStatus(
          "¡Tu reseña fue aprobada y ya aparece publicada!",
        )
      } else {
        setReviewRefreshStatus(
          pendingReviewPreviews.length > 0
            ? "Reseñas actualizadas. La tuya todavía está pendiente de aprobación."
            : "Reseñas actualizadas.",
        )
      }
    } catch (loadError) {
      setReviewLoadError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron actualizar las reseñas.",
      )
    } finally {
      refreshingReviewsRef.current = false
      setRefreshingReviews(false)
    }
  }

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshApprovedReviews()
    }

    window.addEventListener("focus", refreshWhenVisible)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => {
      window.removeEventListener("focus", refreshWhenVisible)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [pendingReviewPreviews])

  useEffect(() => {
    if (!servicePath && !storePath && !serviceCartPath && !pricingPath && !legalPath)
      applySiteSettings(siteSettings)
  }, [servicePath, storePath, serviceCartPath, pricingPath, legalPath, siteSettings])

  const navigateToPath = (path: string) => {
    const destination = path
    window.history.pushState({}, "", destination)
    const destinationUrl = new URL(destination, window.location.origin)
    setServicePath(
      destinationUrl.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ?? null,
    )
    setLegalPath(getLegalPath(destinationUrl.pathname))
    setStorePath(["/tienda", "/carrito"].includes(destinationUrl.pathname))
    setServiceCartPath(
      ["/catalogo-servicios", "/carrito-servicios"].includes(
        destinationUrl.pathname,
      ),
    )
    setPricingPath(destinationUrl.pathname === "/precios")
    const anchor = destination.split("#")[1]
    if (anchor)
      window.setTimeout(
        () =>
          document
            .getElementById(anchor)
            ?.scrollIntoView({ behavior: "smooth" }),
        0,
      )
    else window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const onPopState = () => {
      setServicePath(
        window.location.pathname.match(/^\/servicios\/([a-z0-9-]+)$/)?.[1] ??
          null,
      )
      setLegalPath(getLegalPath(window.location.pathname))
      setStorePath(["/tienda", "/carrito"].includes(window.location.pathname))
      setServiceCartPath(
        ["/catalogo-servicios", "/carrito-servicios"].includes(
          window.location.pathname,
        ),
      )
      setPricingPath(window.location.pathname === "/precios")
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  useEffect(() => {
    let active = true
    const applySettings = (settings: SiteSettings) => {
      const mergedSettings = mergeSiteSettings(settings)
      setSiteSettings(mergedSettings)
      if (!servicePath && !storePath && !serviceCartPath && !pricingPath && !legalPath)
        applySiteSettings(mergedSettings)
    }
    const handleSettingsUpdate = (event: Event) => {
      const settings = (event as CustomEvent<SiteSettings>).detail
      if (settings) applySettings(settings)
    }

    if (!servicePath && !storePath && !serviceCartPath && !pricingPath && !legalPath)
      applySiteSettings(siteSettings)
    void getPublicSiteSettings().then((settings) => {
      if (active) applySettings(settings)
    })
    window.addEventListener("digitalpyme:site-settings", handleSettingsUpdate)
    return () => {
      active = false
      window.removeEventListener(
        "digitalpyme:site-settings",
        handleSettingsUpdate,
      )
    }
  }, [])

  if (window.location.pathname === "/restablecer-contrasena") {
    return (
      <Suspense fallback={<PageLoading />}>
        <PasswordResetPage />
      </Suspense>
    )
  }

  if (adminOpen) {
    return (
      <Suspense fallback={<PageLoading />}>
        <AdminPortal
          onClose={() => {
            const url = new URL(window.location.href)
            url.searchParams.delete("admin")
            if (url.pathname === "/admin") url.pathname = "/"
            window.history.replaceState({}, "", url)
            applySiteSettings(siteSettings)
            setAdminOpen(false)
          }}
        />
      </Suspense>
    )
  }

  if (portalOpen) {
    return (
      <Suspense fallback={<PageLoading />}>
        <ClientPortal
          onClose={() => setPortalOpen(false)}
          onAdminLogin={(session: ClientSession) => {
            sessionStorage.removeItem("digitalpyme.client.token")
            sessionStorage.removeItem("digitalpyme.client.user")
            sessionStorage.setItem("digitalpyme.admin.token", session.token)
            sessionStorage.setItem(
              "digitalpyme.admin.user",
              JSON.stringify(session.usuario),
            )
            setPortalOpen(false)
            setAdminOpen(true)
          }}
        />
      </Suspense>
    )
  }

  if (storePath) {
    return (
      <Suspense fallback={<PageLoading />}>
        <PhysicalStore />
      </Suspense>
    )
  }

  if (legalPath) {
    return (
      <MainLayout
        onQuote={openQuote}
        onPortal={() => setPortalOpen(true)}
        onNavigate={navigateToPath}
        siteSettings={siteSettings}
      >
        <LegalPolicyPage kind={legalPath} settings={siteSettings} />
      </MainLayout>
    )
  }

  if (serviceCartPath) {
    return (
      <MainLayout
        onQuote={openQuote}
        onPortal={() => setPortalOpen(true)}
        onNavigate={navigateToPath}
        siteSettings={siteSettings}
        onOpenLegal={setLegalOpen}
      >
        <Suspense fallback={<PageLoading />}>
          {window.location.pathname === "/carrito-servicios" ? (
            <ServiceCart
              services={services}
              onQuote={(serviceNames) => {
                setQuoteInitialServices(serviceNames)
                setQuoteInitialMessage("Servicios seleccionados desde el carrito")
                setQuoteOpen(true)
                navigateToPath("/")
              }}
              onClosePortal={() => navigateToPath("/")}
            />
          ) : (
            <CatalogoServicios
              services={services}
              onQuote={(serviceNames) => {
                setQuoteInitialServices(serviceNames)
                setQuoteInitialMessage("Servicios seleccionados desde el catálogo")
                setQuoteOpen(true)
                navigateToPath("/")
              }}
              onNavigate={navigateToPath}
            />
          )}
        </Suspense>
        {quoteOpen && (
          <Suspense fallback={<PageLoading />}>
            <QuoteBuilder
              services={services}
              initialServices={quoteInitialServices}
              initialMessage={quoteInitialMessage}
              privacyPublished={siteSettings.legal.privacy_published}
              onClose={() => setQuoteOpen(false)}
              onOpenLegal={setLegalOpen}
            />
          </Suspense>
        )}
        {legalOpen && (
          <Suspense fallback={<PageLoading />}>
            <LegalDialog
              kind={legalOpen}
              settings={siteSettings}
              onClose={() => setLegalOpen(null)}
            />
          </Suspense>
        )}
      </MainLayout>
    )
  }

  if (servicePath) {
    const detailService = services.find(
      (service) => serviceSlug(service) === servicePath,
    )
    return (
      <MainLayout
        onQuote={openQuote}
        onPortal={() => setPortalOpen(true)}
        onNavigate={navigateToPath}
        siteSettings={siteSettings}
        onOpenLegal={setLegalOpen}
      >
        <ServiceDetail
          slug={servicePath}
          service={detailService}
          projects={projects}
          onQuote={openQuote}
          onNavigate={navigateToPath}
        />
        {quoteOpen && (
          <Suspense fallback={<PageLoading />}>
            <QuoteBuilder
              services={services}
              initialServices={quoteInitialServices}
              initialMessage={quoteInitialMessage}
              privacyPublished={siteSettings.legal.privacy_published}
              onClose={() => setQuoteOpen(false)}
              onOpenLegal={setLegalOpen}
            />
          </Suspense>
        )}
        {legalOpen && (
          <Suspense fallback={<PageLoading />}>
            <LegalDialog
              kind={legalOpen}
              settings={siteSettings}
              onClose={() => setLegalOpen(null)}
            />
          </Suspense>
        )}
      </MainLayout>
    )
  }

  if (pricingPath) {
    return (
      <MainLayout
        onQuote={openQuote}
        onPortal={() => setPortalOpen(true)}
        onNavigate={navigateToPath}
        siteSettings={siteSettings}
        onOpenLegal={setLegalOpen}
      >
        <PricingPage onQuote={openQuote} />
        {quoteOpen && (
          <Suspense fallback={<PageLoading />}>
            <QuoteBuilder
              services={services}
              initialServices={quoteInitialServices}
              initialMessage={quoteInitialMessage}
              privacyPublished={siteSettings.legal.privacy_published}
              onClose={() => setQuoteOpen(false)}
              onOpenLegal={setLegalOpen}
            />
          </Suspense>
        )}
        {legalOpen && (
          <Suspense fallback={<PageLoading />}>
            <LegalDialog
              kind={legalOpen}
              settings={siteSettings}
              onClose={() => setLegalOpen(null)}
            />
          </Suspense>
        )}
      </MainLayout>
    )
  }

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      !serviceFilter ||
      String(service.category_id ?? service.category?.id ?? "") ===
        serviceFilter
    const query = serviceSearch.trim().toLocaleLowerCase("es")
    const matchesSearch =
      !query ||
      `${service.nombre} ${service.descripcion ?? ""} ${service.category?.nombre ?? ""}`
        .toLocaleLowerCase("es")
        .includes(query)
    return matchesCategory && matchesSearch
  })

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = filter === "Todos" || project.categoria === filter
    const query = projectSearch.trim().toLocaleLowerCase("es")
    return (
      matchesCategory &&
      (!query ||
        `${project.nombre} ${project.categoria} ${project.resultado}`
          .toLocaleLowerCase("es")
          .includes(query))
    )
  })

  return (
    <MainLayout
      onQuote={openQuote}
      onPortal={() => setPortalOpen(true)}
      onNavigate={navigateToPath}
      siteSettings={siteSettings}
      onOpenLegal={setLegalOpen}
    >
      <main>
        <HeroCarousel onQuote={openQuote} hasProjects={projects.length > 0} />

        <ServicesSection
          onQuote={openQuote}
          onNavigate={navigateToPath}
          initialServices={services}
        />

        <section className="section process" id="proceso">
          <div className="container">
            <span className="kicker kicker-light">Un proceso claro</span>
            <h2>
              De la idea a resultados,
              <br />
              <em>paso a paso.</em>
            </h2>

            <div className="process-grid">
              {[
                [
                  "01",
                  "Diagnóstico",
                  "Entendemos tu negocio, clientes y objetivos.",
                ],
                [
                  "02",
                  "Propuesta",
                  "Recibes alcance, inversión y fechas sin letra pequeña.",
                ],
                [
                  "03",
                  "Desarrollo",
                  "Creamos contigo y ves cada avance en tu portal.",
                ],
                ["04", "Entrega", "Publicamos, capacitamos y seguimos cerca."],
              ].map((step, index) => (
                <div className="process-step" key={step[0]}>
                  <span>{step[0]}</span>
                  <div className="process-icon">
                    <Icon
                      name={
                        index === 0
                          ? "message"
                          : index === 1
                            ? "file"
                            : index === 2
                              ? "spark"
                              : "check"
                      }
                    />
                  </div>
                  <h3>{step[1]}</h3>
                  <p>{step[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section projects" id="proyectos">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Nuestro trabajo</span>
                <h2>Nuestro portafolio de proyectos.</h2>
              </div>
              <p>
                Conoce el sitio propio de DigitalPyme y explora conceptos
                visuales de muestra, identificados como tales.
              </p>
              {projects.length > 0 && (
                <div className="project-catalog-tools">
                  <label>
                    <span className="sr-only">Buscar proyectos</span>
                    <input
                      type="search"
                      placeholder="Buscar proyectos..."
                      value={projectSearch}
                      onChange={(event) => setProjectSearch(event.target.value)}
                    />
                  </label>
                  <div className="filters">
                    {[
                      "Todos",
                      ...new Set(projects.map((project) => project.categoria)),
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={filter === item ? "active" : ""}
                        onClick={() => setFilter(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="project-grid">
              {filteredProjects.map((project, index) => (
                <article
                  className={`project-card ${
                    index === 0 ? "project-featured" : ""
                  }`}
                  key={project.id ?? project.nombre}
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
                  <span className="catalog-badge project-badge">
                    {project.etiqueta || project.categoria}
                  </span>
                  <div className="project-overlay">
                    <span>{project.categoria}</span>
                    <h3>{project.nombre}</h3>
                    <p>{project.resultado}</p>
                    <button
                      type="button"
                      aria-label={`Ver detalle del proyecto ${project.nombre}`}
                      onClick={() => setSelectedPortfolioProject(project)}
                    >
                      <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              ))}
              {filteredProjects.length === 0 && (
                <p className="catalog-empty">
                  {projects.length === 0
                    ? "Aún no hay proyectos publicados. Escríbenos y conversemos sobre lo que necesitas."
                    : "No encontramos proyectos con esos criterios."}
                </p>
              )}
            </div>
          </div>
        </section>

        {testimonials.length > 0 && (
          <section className="section testimonial">
            <div className="container quote-wrap">
              <div className="quote-mark">“</div>
              <blockquote>{testimonials[0].contenido}</blockquote>
              <div className="quote-author">
                <span>{testimonials[0].iniciales}</span>
                <p>
                  <b>{testimonials[0].autor}</b>
                  <br />
                  {testimonials[0].cargo}
                </p>
              </div>
              <div className="quote-result">
                <strong>{testimonials[0].resultado}</strong>
                <span>
                  {testimonials[0].resultado_descripcion}
                  <br />
                  {testimonials[0].resultado_periodo}
                </span>
              </div>
            </div>
          </section>
        )}

        <ReviewWall
          reviews={reviews}
          pendingReviewPreviews={pendingReviewPreviews}
          visibleReviewCount={visibleReviewCount}
          hasMoreReviews={hasMoreReviews}
          loadingMoreReviews={loadingMoreReviews}
          refreshingReviews={refreshingReviews}
          reviewRefreshStatus={reviewRefreshStatus}
          reviewLoadError={reviewLoadError}
          onRefresh={() => void refreshApprovedReviews()}
          onLoadMore={() => void loadMoreReviews()}
          onOpenDialog={() => setReviewDialogOpen(true)}
        />

        <section className="section agenda-section" id="agenda">
          <div className="container agenda-grid">
            <div>
              <span className="kicker">Conversemos</span>
              <h2>30 minutos pueden cambiar el rumbo de tu negocio.</h2>
              <p>
                Elige el momento que mejor te acomode. Revisaremos tu idea y te
                daremos una recomendación clara, sin compromiso.
              </p>
              <div className="trust-line">
                <span>
                  <Icon name="clock" size={16} /> Cuéntanos tu proyecto
                </span>
                <span>
                  <Icon name="check" size={16} /> Sin compromiso
                </span>
              </div>
            </div>

            <AgendaScheduler />
          </div>
        </section>

        <section className="section faq" id="preguntas-frecuentes">
          <div className="container">
            <div className="faq-heading">
              <div>
                <span className="kicker">Conoce más...</span>
                <h2>Preguntas frecuentes</h2>
              </div>
              <p>
                ¿Tienes otra consulta?{" "}
                <a href="#contacto">Escríbenos y conversemos.</a>
              </p>
            </div>
            <div className="faq-list">
              {faqs.map((item, index) => {
                const answerId = `faq-answer-${index}`
                const isOpen = faq === index
                return (
                  <div
                    className={`faq-item ${isOpen ? "open" : ""}`}
                    key={item[0]}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setFaq(isOpen ? null : index)}
                    >
                      <span>{item[0]}</span>
                      <b aria-hidden="true">{isOpen ? "−" : "+"}</b>
                    </button>
                    <p id={answerId} hidden={!isOpen}>
                      {item[1]}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="container contact-grid">
            <div>
              <span className="kicker kicker-light">Empecemos</span>
              <h2>Tu próximo cliente ya está en internet.</h2>
              <p>
                Cuéntanos qué tienes en mente. Revisaremos el alcance y te
                contactaremos para conversar sobre los siguientes pasos.
              </p>

              <div className="contact-points">
                {siteSettings.contact.whatsapp_phone && (
                  <span>
                    <b>WhatsApp</b>
                    <a
                      href={`https://wa.me/${siteSettings.contact.whatsapp_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {siteSettings.contact.whatsapp_phone}
                    </a>
                  </span>
                )}
                <span>
                  <b>Correo</b>hola@digitalpyme.pe
                </span>
                <span>
                  <b>
                    {siteSettings.coverage.digital_mode === "virtual"
                      ? "Modalidad"
                      : "Estamos en"}
                  </b>
                  {siteSettings.coverage.digital_mode === "virtual"
                    ? "Atención virtual en todo el Perú"
                    : "Lima, Perú · Trabajamos en todo el país"}
                </span>
              </div>
            </div>

            <ContactForm services={services} />
          </div>
        </section>
      </main>

      {siteSettings.contact.whatsapp_phone && (
        <a
          className="whatsapp-float"
          href={`https://wa.me/${siteSettings.contact.whatsapp_phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Escribir por WhatsApp"
        >
          <Icon name="whatsapp" size={25} />
          <span>¿Conversamos?</span>
        </a>
      )}

      {quoteOpen && (
        <Suspense fallback={<PageLoading />}>
          <QuoteBuilder
            services={services}
            initialServices={quoteInitialServices}
            initialMessage={quoteInitialMessage}
            privacyPublished={siteSettings.legal.privacy_published}
            onClose={() => setQuoteOpen(false)}
            onOpenLegal={setLegalOpen}
          />
        </Suspense>
      )}

      {legalOpen && (
        <Suspense fallback={<PageLoading />}>
          <LegalDialog
            kind={legalOpen}
            settings={siteSettings}
            onClose={() => setLegalOpen(null)}
          />
        </Suspense>
      )}

      {selectedPortfolioProject && (
        <Suspense fallback={<PageLoading />}>
          <PortfolioProjectDialog
            project={selectedPortfolioProject}
            onClose={closePortfolioProject}
          />
        </Suspense>
      )}

      {reviewDialogOpen && (
        <Suspense fallback={<PageLoading />}>
          <ReviewSubmissionDialog
            services={services}
            onClose={closeReviewDialog}
            onSubmitted={handleReviewSubmitted}
          />
        </Suspense>
      )}
    </MainLayout>
  )
}
