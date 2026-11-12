import { describe, it, expect } from 'vitest';
import { displayValue, formatAge, formatPetType } from './formatters';

describe('formatters', () => {
  it('formatea la edad en singular y plural', () => {
    expect(formatAge(0)).toBe('0 años');
    expect(formatAge(1)).toBe('1 año');
    expect(formatAge(5)).toBe('5 años');
  });

  it('une especie y raza, omitiendo la raza si no existe', () => {
    expect(formatPetType({ species: 'Perro', breed: 'Labrador' })).toBe('Perro · Labrador');
    expect(formatPetType({ species: 'Gato', breed: null })).toBe('Gato');
  });

  it('muestra un guion cuando no hay valor', () => {
    expect(displayValue(null)).toBe('—');
    expect(displayValue('')).toBe('—');
    expect(displayValue('Dócil')).toBe('Dócil');
  });
});