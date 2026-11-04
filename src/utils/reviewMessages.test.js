import { describe, it, expect } from 'vitest';
import {
  ADOPTER_NOT_FOUND_MESSAGE,
  INVALID_RATING_MESSAGE,
  OTHER_ADOPTER_REVIEW_MESSAGE,
  REVIEW_NOT_FOUND_MESSAGE,
  getReviewErrorMessage,
  isNotFoundReview,
} from './reviewMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

describe('getReviewErrorMessage', () => {
  it('informa que el adoptante no fue encontrado (404)', () => {
    expect(
      getReviewErrorMessage(apiError(404, 'The adopter with the given id was not found')),
    ).toBe(ADOPTER_NOT_FOUND_MESSAGE);
  });

  it('informa que la reseña no fue encontrada (404)', () => {
    expect(
      getReviewErrorMessage(apiError(404, 'The review with the given id was not found')),
    ).toBe(REVIEW_NOT_FOUND_MESSAGE);
  });

  it('rechaza una reseña que pertenece a otro adoptante (412)', () => {
    expect(
      getReviewErrorMessage(apiError(412, 'The review is not associated to the adopter')),
    ).toBe(OTHER_ADOPTER_REVIEW_MESSAGE);
  });

  it('traduce el rechazo de una calificación inválida (412)', () => {
    expect(getReviewErrorMessage(apiError(412, 'Review rating must be between 1 and 5'))).toBe(
      INVALID_RATING_MESSAGE,
    );
  });

  it('muestra el mensaje del back cuando no reconoce el error', () => {
    expect(getReviewErrorMessage(apiError(404, 'Algo no existe'))).toBe('Algo no existe');
    expect(getReviewErrorMessage(apiError(412, 'Otra regla'))).toBe('Otra regla');
    expect(getReviewErrorMessage(apiError(500, 'Falla interna'))).toBe('Falla interna');
  });

  it('no confunde un mensaje de adoptante en un código que no es 404', () => {
    expect(getReviewErrorMessage(apiError(500, 'The adopter with the given id was not found'))).toBe(
      'The adopter with the given id was not found',
    );
  });

  it('muestra el error de conexión si no hay respuesta', () => {
    expect(getReviewErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });
});

describe('isNotFoundReview', () => {
  it('es verdadero solo para el 404 de la reseña', () => {
    expect(isNotFoundReview(apiError(404, 'The review with the given id was not found'))).toBe(true);
    expect(isNotFoundReview(apiError(404, 'The adopter with the given id was not found'))).toBe(false);
    expect(isNotFoundReview(apiError(412, 'The review is not associated to the adopter'))).toBe(false);
    expect(isNotFoundReview({ request: {} })).toBe(false);
  });
});
