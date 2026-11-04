import { describe, it, expect } from 'vitest';
import { isDuplicateShelter, validateShelter } from './shelterValidation';

const valid = { name: 'Huellitas', city: 'Bogotá' };

describe('validateShelter', () => {
  it('acepta un refugio válido', () => {
    expect(validateShelter(valid)).toEqual({});
  });

  it('rechaza nombre vacío o solo espacios', () => {
    expect(validateShelter({ ...valid, name: '' }).name).toBe('El nombre es obligatorio.');
    expect(validateShelter({ ...valid, name: '   ' }).name).toBe('El nombre es obligatorio.');
  });

  it('rechaza ciudad vacía o solo espacios', () => {
    expect(validateShelter({ ...valid, city: '' }).city).toBe('La ciudad es obligatoria.');
    expect(validateShelter({ ...valid, city: '  ' }).city).toBe('La ciudad es obligatoria.');
  });
});

describe('isDuplicateShelter', () => {
  const shelters = [
    { id: 1, name: 'Huellitas', city: 'Bogotá' },
    { id: 2, name: 'Patitas', city: 'Cali' },
  ];

  it('detecta el mismo nombre y ciudad sin importar mayúsculas ni espacios', () => {
    expect(isDuplicateShelter(shelters, { name: ' huellitas ', city: 'BOGOTÁ' })).toBe(true);
  });

  it('no marca como duplicado si cambia la ciudad', () => {
    expect(isDuplicateShelter(shelters, { name: 'Huellitas', city: 'Cali' })).toBe(false);
  });

  it('ignora el refugio que se está editando', () => {
    expect(isDuplicateShelter(shelters, valid, 1)).toBe(false);
    expect(isDuplicateShelter(shelters, valid, 2)).toBe(true);
  });

  it('funciona con una lista vacía', () => {
    expect(isDuplicateShelter([], valid)).toBe(false);
  });
});