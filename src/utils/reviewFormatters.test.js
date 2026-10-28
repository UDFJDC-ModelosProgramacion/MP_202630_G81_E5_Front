import { describe, it, expect } from 'vitest';
import {
  formatAverage,
  formatRatingOf,
  formatReviewCount,
  getAverageRating,
  getRatingHint,
} from './reviewFormatters';

describe('getAverageRating', () => {
  it('calcula el promedio de las calificaciones', () => {
    expect(getAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBeCloseTo(4.333, 3);
  });

  it('acepta calificaciones como texto', () => {
    expect(getAverageRating([{ rating: '2' }, { rating: '4' }])).toBe(3);
  });

  it('devuelve null si no hay reseñas', () => {
    expect(getAverageRating([])).toBeNull();
    expect(getAverageRating(undefined)).toBeNull();
  });
});

describe('formatAverage', () => {
  it('usa un decimal y coma, como el mockup', () => {
    expect(formatAverage(13 / 3)).toBe('4,3');
    expect(formatAverage(5)).toBe('5,0');
    expect(formatAverage(1)).toBe('1,0');
  });

  it('muestra un guion si no hay promedio', () => {
    expect(formatAverage(null)).toBe('—');
    expect(formatAverage(undefined)).toBe('—');
  });
});

describe('formatReviewCount', () => {
  it('escribe el total en plural y en singular', () => {
    expect(formatReviewCount(3)).toBe('Basado en 3 reseñas publicadas');
    expect(formatReviewCount(1)).toBe('Basado en 1 reseña publicada');
  });

  it('avisa cuando no hay reseñas', () => {
    expect(formatReviewCount(0)).toBe('Aún no hay reseñas publicadas');
  });
});

describe('formatRatingOf y getRatingHint', () => {
  it('escribe la calificación como "4 de 5"', () => {
    expect(formatRatingOf(4)).toBe('4 de 5');
  });

  it('explica la escala y la calificación seleccionada, como el mockup', () => {
    expect(getRatingHint(4)).toBe('Elige de 1 (muy mala) a 5 (excelente). Seleccionada: 4 de 5.');
  });

  it('solo explica la escala cuando no hay selección', () => {
    expect(getRatingHint(0)).toBe('Elige de 1 (muy mala) a 5 (excelente).');
  });
});
