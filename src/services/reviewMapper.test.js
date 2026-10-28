import { describe, it, expect } from 'vitest';
import { buildReviewPayload, EMPTY_REVIEW_FORM, reviewToFormValues } from './reviewMapper';

describe('EMPTY_REVIEW_FORM', () => {
  it('empieza sin calificación y sin comentario', () => {
    expect(EMPTY_REVIEW_FORM).toEqual({ rating: 0, comment: '' });
  });
});

describe('buildReviewPayload', () => {
  it('construye la reseña con la calificación numérica y el comentario recortado', () => {
    expect(buildReviewPayload({ rating: '4', comment: '  Muy buen proceso  ' })).toEqual({
      rating: 4,
      comment: 'Muy buen proceso',
    });
  });

  it('envía comentario nulo cuando está vacío o solo tiene espacios', () => {
    expect(buildReviewPayload({ rating: 5, comment: '' }).comment).toBeNull();
    expect(buildReviewPayload({ rating: 5, comment: '   ' }).comment).toBeNull();
    expect(buildReviewPayload({ rating: 5 }).comment).toBeNull();
  });

  it('no incluye el adoptante ni el id', () => {
    expect(Object.keys(buildReviewPayload({ rating: 3, comment: 'ok' }))).toEqual([
      'rating',
      'comment',
    ]);
  });
});

describe('reviewToFormValues', () => {
  it('convierte una reseña en valores de formulario', () => {
    expect(reviewToFormValues({ id: 1, rating: 4, comment: 'Bien' })).toEqual({
      rating: 4,
      comment: 'Bien',
    });
  });

  it('usa valores vacíos si faltan datos', () => {
    expect(reviewToFormValues({ rating: 2, comment: null })).toEqual({ rating: 2, comment: '' });
    expect(reviewToFormValues(undefined)).toEqual({ rating: 0, comment: '' });
  });
});
