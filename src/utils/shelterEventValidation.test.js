import { describe, it, expect } from 'vitest';
import { validateShelterEvent } from './shelterEventValidation';

describe('validateShelterEvent', () => {
  it('exige el nombre y la fecha', () => {
    expect(validateShelterEvent({ title: '', date: '', type: '' })).toEqual({
      title: 'El nombre es obligatorio.',
      date: 'La fecha es obligatoria.',
    });
  });

  it('rechaza un nombre formado solo por espacios', () => {
    expect(validateShelterEvent({ title: '   ', date: '2026-11-20' })).toEqual({
      title: 'El nombre es obligatorio.',
    });
  });

  it('no devuelve errores cuando los datos son válidos', () => {
    expect(validateShelterEvent({ title: 'Jornada', date: '2026-11-20', type: '' })).toEqual({});
  });
});