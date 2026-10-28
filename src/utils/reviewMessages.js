import { getErrorMessage } from '../services/apiError';

export const ADOPTER_NOT_FOUND_MESSAGE = 'Adoptante no encontrado.';
export const REVIEW_NOT_FOUND_MESSAGE = 'Reseña no encontrada.';
export const OTHER_ADOPTER_REVIEW_MESSAGE = 'Esta reseña pertenece a otro adoptante.';
export const INVALID_RATING_MESSAGE = 'La calificación debe estar entre 1 y 5.';

const serverMessage = (error) => error?.response?.data?.apierror?.message ?? '';

function getNotFoundMessage(error) {
  const message = serverMessage(error);
  if (/adopter/i.test(message)) return ADOPTER_NOT_FOUND_MESSAGE;
  if (/review/i.test(message)) return REVIEW_NOT_FOUND_MESSAGE;
  return null;
}

function getPreconditionMessage(error) {
  const message = serverMessage(error);
  if (/not associated to the adopter/i.test(message)) return OTHER_ADOPTER_REVIEW_MESSAGE;
  if (/rating/i.test(message)) return INVALID_RATING_MESSAGE;
  return null;
}

export function isNotFoundReview(error) {
  return error?.response?.status === 404 && getNotFoundMessage(error) === REVIEW_NOT_FOUND_MESSAGE;
}

export function getReviewErrorMessage(error) {
  const status = error?.response?.status;
  const known =
    (status === 404 && getNotFoundMessage(error)) ||
    (status === 412 && getPreconditionMessage(error));
  return known || getErrorMessage(error);
}
