import { useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';
import ReviewPanel from '../components/ReviewPanel';
import ReviewSummary from '../components/ReviewSummary';
import useReviewActions from '../hooks/useReviewActions';
import useReviews from '../hooks/useReviews';

export default function ReviewListPage() {
  const { adopterId } = useParams();
  const { reviews, loading, error, reload, setReviews } = useReviews(adopterId);
  const actions = useReviewActions(adopterId, setReviews);
  const loaded = !loading && !error;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis reseñas</h1>
          <p className="page-subtitle">Calificaciones que has dejado sobre tu proceso de adopción.</p>
        </div>
      </div>

      {actions.message && <AlertMessage variant="success">{actions.message}</AlertMessage>}
      {actions.actionError && <AlertMessage>{actions.actionError}</AlertMessage>}

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
                    <ReviewCard
                      review={review}
                      adopterId={adopterId}
                      editing={actions.editing?.id === review.id}
                      deleting={actions.deletingId === review.id}
                      onEdit={() => actions.startEdit(review)}
                      onDelete={() => actions.remove(review)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ReviewPanel
            editing={actions.editing}
            formKey={actions.formKey}
            onSubmit={actions.save}
            onCancel={actions.cancelEdit}
          />
        </div>
      )}
    </section>
  );
}
