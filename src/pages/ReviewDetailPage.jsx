import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ReviewStars from '../components/ReviewStars';
import useReview from '../hooks/useReview';
import { displayValue } from '../utils/formatters';
import { formatRatingOf } from '../utils/reviewFormatters';

export default function ReviewDetailPage() {
  const { adopterId, reviewId } = useParams();
  const { review, loading, error } = useReview(adopterId, reviewId);
  const listPath = `/adoptantes/${adopterId}/resenas`;

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={listPath}>Mis reseñas</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando reseña..." />}

      {!loading && error && <AlertMessage>{error}</AlertMessage>}

      {review && (
        <>
          <div className="page-header">
            <h1 className="page-title">Detalle de la reseña</h1>
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              <div className="detail-list__item">
                <dt>Adoptante</dt>
                <dd>{displayValue(review.adopter?.name)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Calificación</dt>
                <dd className="review-detail__rating">
                  <ReviewStars rating={review.rating} />
                  <span>{formatRatingOf(review.rating)}</span>
                </dd>
              </div>
              <div className="detail-list__item review-detail__wide">
                <dt>Comentario</dt>
                <dd>{displayValue(review.comment)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={listPath} className="btn-outline-brand">
          Volver a mis reseñas
        </Link>
      </div>
    </section>
  );
}
