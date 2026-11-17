import { demoReviewExamples } from "../../constants/siteData"
import type { ServiceReview } from "../../lib/api"

export default function ReviewWall({
  reviews,
  pendingReviewPreviews,
  visibleReviewCount,
  hasMoreReviews,
  loadingMoreReviews,
  refreshingReviews,
  reviewRefreshStatus,
  reviewLoadError,
  onRefresh,
  onLoadMore,
  onOpenDialog,
}: {
  reviews: ServiceReview[]
  pendingReviewPreviews: ServiceReview[]
  visibleReviewCount: number
  hasMoreReviews: boolean
  loadingMoreReviews: boolean
  refreshingReviews: boolean
  reviewRefreshStatus: string
  reviewLoadError: string
  onRefresh: () => void
  onLoadMore: () => void
  onOpenDialog: () => void
}) {
  return (
    <section className="section review-wall" id="resenas">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="kicker">Opiniones de clientes</span>
            <h2>Testimonios de nuestros clientes.</h2>
          </div>
          <p>
            Las opiniones reales se publican después de su revisión. Los
            ejemplos se identifican claramente como demostraciones, no como
            reseñas de clientes.
          </p>
        </div>
        <div className="review-wall-toolbar">
          <div className="review-wall-summary">
            <span className="review-wall-mark" aria-hidden="true">
              ★
            </span>
            <div>
              {reviews.length > 0 ? (
                <>
                  <strong>
                    {(
                      reviews.reduce(
                        (total, review) => total + review.calificacion,
                        0,
                      ) / reviews.length
                    ).toFixed(1)}{" "}
                    / 5
                  </strong>
                  <span>{reviews.length} reseñas aprobadas recientes</span>
                </>
              ) : (
                <>
                  <strong>Opiniones verificadas</strong>
                  <span>Aún no hay reseñas aprobadas</span>
                </>
              )}
            </div>
          </div>
          <div className="review-wall-actions">
            <button
              className="button button-secondary review-wall-refresh"
              type="button"
              onClick={onRefresh}
              disabled={refreshingReviews}
            >
              {refreshingReviews
                ? "Actualizando..."
                : pendingReviewPreviews.length > 0
                  ? "Comprobar aprobación"
                  : "Actualizar reseñas"}
            </button>
            <button
              className="button review-wall-write"
              type="button"
              onClick={onOpenDialog}
            >
              Escribir una reseña
            </button>
          </div>
        </div>
        {reviewRefreshStatus && (
          <p className="review-wall-refresh-status" role="status">
            {reviewRefreshStatus}
          </p>
        )}
        {reviews.length === 0 && pendingReviewPreviews.length === 0 && (
          <p className="review-wall-demo-note" role="note">
            Ejemplos ficticios para mostrar el diseño. No son opiniones ni
            resultados de clientes reales.
          </p>
        )}
        <div className="review-wall-grid">
          {pendingReviewPreviews.map((review) => (
            <article className="review-wall-card" key={`pending-${review.id}`}>
              <span className="review-wall-pending">Pendiente de revisión</span>
              <span
                className="review-wall-stars"
                aria-label={`${review.calificacion} de 5 estrellas`}
              >
                {"★".repeat(review.calificacion)}
                {"☆".repeat(5 - review.calificacion)}
              </span>
              <h3>{review.titulo || review.service?.nombre || "Tu reseña"}</h3>
              <p>{review.comentario}</p>
              <footer>
                <b>{review.nombre}</b>
                {review.service?.nombre && <span>{review.service.nombre}</span>}
              </footer>
            </article>
          ))}
          {reviews.length > 0
            ? reviews.slice(0, visibleReviewCount).map((review) => (
                <article className="review-wall-card" key={review.id}>
                  <span className="review-wall-approved">Reseña aprobada</span>
                  <span
                    className="review-wall-stars"
                    aria-label={`${review.calificacion} de 5 estrellas`}
                  >
                    {"★".repeat(review.calificacion)}
                    {"☆".repeat(5 - review.calificacion)}
                  </span>
                  <h3>
                    {review.titulo ||
                      review.service?.nombre ||
                      "Reseña de cliente"}
                  </h3>
                  <p>{review.comentario}</p>
                  <footer>
                    <b>{review.nombre}</b>
                    {review.service?.nombre && (
                      <span>{review.service.nombre}</span>
                    )}
                  </footer>
                </article>
              ))
            : pendingReviewPreviews.length === 0 &&
              demoReviewExamples.slice(0, visibleReviewCount).map((review) => (
                <article
                  className="review-wall-card review-wall-card-demo"
                  key={review.titulo}
                >
                  <span className="review-wall-demo-badge">
                    Ejemplo ficticio
                  </span>
                  <span
                    className="review-wall-stars"
                    aria-label={`Calificación ilustrativa: ${review.calificacion} de 5 estrellas`}
                  >
                    {"★".repeat(review.calificacion)}
                    {"☆".repeat(5 - review.calificacion)}
                  </span>
                  <h3>{review.titulo}</h3>
                  <p>{review.comentario}</p>
                  <footer>
                    <b>No corresponde a un cliente</b>
                    <span>{review.servicio}</span>
                  </footer>
                </article>
              ))}
        </div>
        {reviewLoadError && (
          <p className="review-submit-error" role="alert">
            {reviewLoadError}
          </p>
        )}
        {(reviews.length > visibleReviewCount ||
          hasMoreReviews ||
          (reviews.length === 0 &&
            demoReviewExamples.length > visibleReviewCount)) && (
          <div className="review-wall-load-more">
            <button
              className="button button-secondary"
              type="button"
              disabled={loadingMoreReviews}
              onClick={onLoadMore}
            >
              {loadingMoreReviews ? "Cargando..." : "Cargar más"}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
