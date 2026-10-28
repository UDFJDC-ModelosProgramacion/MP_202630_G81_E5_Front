import { useLocation, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';
import ReviewSummary from '../components/ReviewSummary';
import useReviews from '../hooks/useReviews';

export default function ReviewListPage() {
  const { adopterId } = useParams();
  const { reviews, loading, error, reload } = useReviews(adopterId);
  const location = useLocation();
  const successMessage = location.state?.message;
  const loaded = !loading && !error;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis reseñas</h1>
          <p className="page-subtitle">Calificaciones que has dejado sobre tu proceso de adopción.</p>
        </div>
      </div>

      {successMessage && <AlertMessage variant="success">{successMessage}</AlertMessage>}

      {loading && <Loader label="Cargando reseñas..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {loaded && <ReviewSummary reviews={reviews} />}

      {loaded && reviews.length === 0 && (
        <p className="empty-state">Aún no has publicado ninguna reseña.</p>
      )}

      {loaded && reviews.length > 0 && (
        <ul className="review-list" aria-label="Mis reseñas">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} adopterId={adopterId} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
