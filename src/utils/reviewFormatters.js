import { MAX_RATING } from './reviewValidation';

export function getAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
  return total / reviews.length;
}

export function formatAverage(average) {
  return average === null || average === undefined ? '—' : average.toFixed(1).replace('.', ',');
}

export function formatReviewCount(count) {
  if (count === 0) return 'Aún no hay reseñas publicadas';
  return `Basado en ${count} ${count === 1 ? 'reseña publicada' : 'reseñas publicadas'}`;
}

export function formatRatingOf(rating) {
  return `${rating} de ${MAX_RATING}`;
}

export function getRatingHint(rating) {
  const base = `Elige de 1 (muy mala) a ${MAX_RATING} (excelente).`;
  return rating ? `${base} Seleccionada: ${formatRatingOf(rating)}.` : base;
}
