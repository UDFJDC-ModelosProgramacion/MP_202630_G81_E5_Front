export const MIN_RATING = 1;
export const MAX_RATING = 5;
// La columna `comment` del back es un VARCHAR(255) por defecto.
export const COMMENT_MAX_LENGTH = 255;

function validateRating(rating) {
  if (rating === null || rating === undefined || rating === '' || Number(rating) === 0) {
    return 'Elige una calificación de 1 a 5.';
  }
  const value = Number(rating);
  if (!Number.isInteger(value) || value < MIN_RATING || value > MAX_RATING) {
    return 'La calificación debe estar entre 1 y 5.';
  }
  return undefined;
}

function validateComment(comment) {
  return String(comment ?? '').trim().length > COMMENT_MAX_LENGTH
    ? `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.`
    : undefined;
}

export function validateReview(values) {
  const candidates = {
    rating: validateRating(values.rating),
    comment: validateComment(values.comment),
  };

  return Object.fromEntries(Object.entries(candidates).filter(([, message]) => message));
}
