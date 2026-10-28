export const EMPTY_REVIEW_FORM = { rating: 0, comment: '' };

export function reviewToFormValues(review) {
  return {
    rating: Number(review?.rating) || 0,
    comment: review?.comment ?? '',
  };
}

// El PUT del back reemplaza calificación y comentario y conserva al adoptante,
// así que el formulario no tiene campos ocultos que reenviar.
export function buildReviewPayload(form) {
  return {
    rating: Number(form.rating),
    comment: String(form.comment ?? '').trim() || null,
  };
}
