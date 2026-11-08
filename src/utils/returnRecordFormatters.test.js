import { describe, expect, it } from 'vitest';
import { formatPetSummary, getTodayDay } from './returnRecordFormatters';

describe('getTodayDay', () => {
  it('escribe el día local con ceros a la izquierda', () => {
    expect(getTodayDay(new Date(2026, 9, 5, 23, 30))).toBe('2026-10-05');
    expect(getTodayDay(new Date(2026, 0, 31, 0, 5))).toBe('2026-01-31');
  });

  it('usa la fecha actual si no se indica otra', () => {
    expect(getTodayDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatPetSummary', () => {
  it('une especie, raza y edad como en el mockup', () => {
    expect(formatPetSummary({ species: 'Perro', breed: 'Criollo', age: 3 })).toBe(
      'Perro · Criollo · 3 años',
    );
    expect(formatPetSummary({ species: 'Gato', breed: 'Persa', age: 1 })).toBe('Gato · Persa · 1 año');
  });

  it('omite lo que falta', () => {
    expect(formatPetSummary({ species: 'Perro', age: 0 })).toBe('Perro · 0 años');
    expect(formatPetSummary({ species: 'Perro' })).toBe('Perro');
    expect(formatPetSummary(null)).toBe('');
  });
});
