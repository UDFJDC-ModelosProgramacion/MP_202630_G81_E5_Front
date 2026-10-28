import { Link } from 'react-router-dom';
import ReviewStars from './ReviewStars';
import { formatRatingOf } from '../utils/reviewFormatters';

export default function ReviewCard({ review, adopterId, editing, deleting, onEdit, onDelete }) {
  return (
    <article className={`review-card${editing ? ' review-card--editing' : ''}`}>
      <div className="review-card__header">
        <ReviewStars rating={review.rating} />
        <span className="review-card__rating">{formatRatingOf(review.rating)}</span>
      </div>
      {review.comment ? (
        <p className="review-card__comment">{review.comment}</p>
      ) : (
        <p className="review-card__comment review-card__comment--empty">Sin comentario.</p>
      )}
      <div className="review-card__actions">
        <Link
          to={`/adoptantes/${adopterId}/resenas/${review.id}`}
          className="review-card__button"
          aria-label={`Ver detalle de la reseña ${review.id}`}
        >
          Ver detalle
        </Link>
        <button
          type="button"
          className="review-card__button"
          aria-label={`Editar la reseña ${review.id}`}
          disabled={deleting}
          onClick={onEdit}
        >
          Editar
        </button>
        <button
          type="button"
          className="review-card__button review-card__button--danger"
          aria-label={`Eliminar la reseña ${review.id}`}
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </article>
  );
}
