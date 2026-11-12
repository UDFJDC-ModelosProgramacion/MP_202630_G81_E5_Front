import { describe, it, expect } from 'vitest';
import { COMMENT_MAX_LENGTH, validateReview } from './reviewValidation';

describe('validateReview', () => {
  it('acepta cualquier calificación de 1 a 5, con o sin comentario', () => {
    [1, 2, 3, 4, 5].forEach((rating) => {
      expect(validateReview({ rating, comment: 'Bien' })).toEqual({});
      expect(validateReview({ rating, comment: '' })).toEqual({});
    });
  });

  it('acepta la calificación como texto numérico', () => {
    expect(validateReview({ rating: '3', comment: '' })).toEqual({});
  });

  it('exige una calificación cuando falta', () => {
    const message = 'Elige una calificación de 1 a 5.';
    expect(validateReview({ rating: 0, comment: '' }).rating).toBe(message);
    expect(validateReview({ rating: '', comment: '' }).rating).toBe(message);
    expect(validateReview({ rating: null, comment: '' }).rating).toBe(message);
    expect(validateReview({ comment: '' }).rating).toBe(message);
  });

  it('rechaza una calificación menor que 1', () => {
    expect(validateReview({ rating: -1, comment: '' }).rating).toBe(
      'La calificación debe estar entre 1 y 5.',
    );
  });

  it('rechaza una calificación mayor que 5', () => {
    expect(validateReview({ rating: 6, comment: '' }).rating).toBe(
      'La calificación debe estar entre 1 y 5.',
    );
  });

  it('rechaza una calificación con decimales o que no es un número', () => {
    expect(validateReview({ rating: 2.5, comment: '' }).rating).toBe(
      'La calificación debe estar entre 1 y 5.',
    );
    expect(validateReview({ rating: 'abc', comment: '' }).rating).toBe(
      'La calificación debe estar entre 1 y 5.',
    );
  });

  it('acepta un comentario del largo máximo y rechaza uno más largo', () => {
    expect(validateReview({ rating: 5, comment: 'a'.repeat(COMMENT_MAX_LENGTH) })).toEqual({});
    expect(validateReview({ rating: 5, comment: 'a'.repeat(COMMENT_MAX_LENGTH + 1) }).comment).toBe(
      'El comentario no puede superar los 255 caracteres.',
    );
  });

  it('no cuenta los espacios de los extremos del comentario', () => {
    expect(validateReview({ rating: 5, comment: ` ${'a'.repeat(COMMENT_MAX_LENGTH)} ` })).toEqual({});
  });

  it('lista la calificación antes que el comentario', () => {
    const errors = validateReview({ rating: 0, comment: 'a'.repeat(COMMENT_MAX_LENGTH + 1) });
    expect(Object.keys(errors)).toEqual(['rating', 'comment']);
  });
});
