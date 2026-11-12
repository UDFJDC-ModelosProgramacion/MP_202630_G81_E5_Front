import { describe, it, expect } from 'vitest';
import { formatAdoptionDate, formatPetOption, toDateInputValue } from './adoptionFormatters';

describe('toDateInputValue', () => {
  it('toma el día de la fecha ISO que devuelve el back', () => {
    expect(toDateInputValue('2026-09-20T00:00:00.000+00:00')).toBe('2026-09-20');
  });

  it('no corre el día cuando el servidor guarda la medianoche local de Bogotá', () => {
    expect(toDateInputValue('2026-09-20T05:00:00.000+00:00')).toBe('2026-09-20');
  });

  it('no corre el día cuando el servidor está adelantado respecto a UTC', () => {
    expect(toDateInputValue('2026-09-19T22:00:00.000+00:00')).toBe('2026-09-20');
  });

  it('acepta una fecha simple y una marca de tiempo numérica', () => {
    expect(toDateInputValue('2026-09-20')).toBe('2026-09-20');
    expect(toDateInputValue(Date.UTC(2026, 8, 20))).toBe('2026-09-20');
  });

  it('devuelve vacío si no hay fecha o es inválida', () => {
    expect(toDateInputValue(null)).toBe('');
    expect(toDateInputValue(undefined)).toBe('');
    expect(toDateInputValue('')).toBe('');
    expect(toDateInputValue('no es fecha')).toBe('');
  });
});

describe('formatAdoptionDate', () => {
  it('muestra día con dos dígitos, mes abreviado y año', () => {
    expect(formatAdoptionDate('2026-09-20T00:00:00.000+00:00')).toBe('20 sep 2026');
    expect(formatAdoptionDate('2026-09-02T00:00:00.000+00:00')).toBe('02 sep 2026');
    expect(formatAdoptionDate('2026-08-28T00:00:00.000+00:00')).toBe('28 ago 2026');
  });

  it('muestra un guion si no hay fecha', () => {
    expect(formatAdoptionDate(null)).toBe('—');
  });
});

describe('formatPetOption', () => {
  it('une nombre, especie y raza', () => {
    expect(formatPetOption({ name: 'Luna', species: 'Perro', breed: 'Labrador' })).toBe(
      'Luna · Perro · Labrador',
    );
  });

  it('omite la raza si no existe', () => {
    expect(formatPetOption({ name: 'Nube', species: 'Gato', breed: null })).toBe('Nube · Gato');
  });
});
