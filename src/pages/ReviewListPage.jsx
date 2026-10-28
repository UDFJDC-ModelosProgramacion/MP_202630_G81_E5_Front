import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import ReviewSummary from '../components/ReviewSummary';
import useReviews from '../hooks/useReviews';
import { buildReviewPayload, EMPTY_REVIEW_FORM } from '../services/reviewMapper';
import { createReview } from '../services/reviewService';

export default function ReviewListPage() {
  const { adopterId } = useParams();
  const { reviews, loading, error, reload, setReviews } = useReviews(adopterId);
  const location = useLocation();
  const [message, setMessage] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const successMessage = message ?? location.state?.message;
  const loaded = !loading && !error;

  const handleCreate = async (values) => {
    const created = await createReview(adopterId, buildReviewPayload(values));
    setReviews((current) => [...current, created]);
    setMessage('Reseña publicada correctamente.');
    setFormKey((key) => key + 1);
  };

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

      {loaded && (
        <div className="review-layout">
          <div>
            <ReviewSummary reviews={reviews} />
            {reviews.length === 0 ? (
              <p className="empty-state">Aún no has publicado ninguna reseña.</p>
            ) : (
              <ul className="review-list" aria-label="Mis reseñas">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <ReviewCard review={review} adopterId={adopterId} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside aria-labelledby="review-panel-title">
            <h2 id="review-panel-title" className="review-panel__title">
              Nueva reseña
            </h2>
            <ReviewForm
              key={formKey}
              initialValues={EMPTY_REVIEW_FORM}
              submitLabel="Publicar reseña"
              onSubmit={handleCreate}
            />
          </aside>
        </div>
      )}
    </section>
  );
}
