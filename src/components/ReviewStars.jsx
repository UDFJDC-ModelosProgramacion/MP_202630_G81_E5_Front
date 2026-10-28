import { MAX_RATING } from '../utils/reviewValidation';
import { formatRatingOf } from '../utils/reviewFormatters';

const POSITIONS = Array.from({ length: MAX_RATING }, (_, index) => index + 1);

export default function ReviewStars({ rating, label }) {
  const filled = Math.round(Number(rating)) || 0;
  const accessibleLabel = label ?? `Calificación: ${formatRatingOf(filled)}`;

  return (
    <span className="review-stars" role="img" aria-label={accessibleLabel}>
      {POSITIONS.map((position) => (
        <span
          key={position}
          className={`review-stars__star${position <= filled ? ' review-stars__star--filled' : ''}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}
