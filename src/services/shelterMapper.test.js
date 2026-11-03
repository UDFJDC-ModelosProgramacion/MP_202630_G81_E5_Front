import { describe, it, expect } from 'vitest';
import { buildShelterPayload, EMPTY_SHELTER_FORM, shelterToFormValues } from './shelterMapper';

describe('buildShelterPayload', () => {
  it('quita los espacios sobrantes del nombre y la ciudad', () => {
    expect(buildShelterPayload({ name: '  Huellitas ', city: ' Bogotá  ' })).toEqual({
      name: 'Huellitas',
      city: 'Bogotá',
    });
  });
});

describe('shelterToFormValues', () => {
  it('convierte un refugio en valores de formulario', () => {
    expect(shelterToFormValues({ id: 1, name: 'Huellitas', city: 'Bogotá' })).toEqual({
      name: 'Huellitas',
      city: 'Bogotá',
    });
  });

  it('usa texto vacío cuando faltan datos', () => {
    expect(shelterToFormValues({})).toEqual({ name: '', city: '' });
  });

  it('expone un formulario vacío', () => {
    expect(EMPTY_SHELTER_FORM).toEqual({ name: '', city: '' });
  });
});