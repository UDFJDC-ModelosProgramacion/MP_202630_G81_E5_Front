import ReviewStars from './ReviewStars';
import {
  formatAverage,
  formatRatingOf,
  formatReviewCount,
  getAverageRating,
} from '../utils/reviewFormatters';

export default function ReviewSummary({ reviews }) {
  const average = getAverageRating(reviews);
  const starsLabel =
    average === null ? 'Sin calificaciones' : `Promedio: ${formatRatingOf(formatAverage(average))}`;

  return (
    <section className="review-summary" aria-label="Resumen de calificaciones">
      <p className="review-summary__average">{formatAverage(average)}</p>
      <div>
        <ReviewStars rating={average} label={starsLabel} />
        <p className="review-summary__count">{formatReviewCount(reviews.length)}</p>
      </div>
    </section>
  );
}
