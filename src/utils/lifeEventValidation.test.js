import { describe, expect, it } from 'vitest';
import { validateLifeEvent } from './lifeEventValidation';

const valid = { type: 'Control', date: '2026-03-02' };

describe('validateLifeEvent', () => {
  it('no devuelve errores con tipo y fecha', () => {
    expect(validateLifeEvent(valid)).toEqual({});
  });

  it('acepta descripción y veterinario vacíos (son opcionales)', () => {
    expect(validateLifeEvent({ ...valid, description: '', veterinarianId: '' })).toEqual({});
  });

  it('exige el tipo', () => {
    expect(validateLifeEvent({ ...valid, type: '  ' }).type).toBe('El tipo es obligatorio.');
    expect(validateLifeEvent({ ...valid, type: undefined }).type).toBe('El tipo es obligatorio.');
  });

  it('exige la fecha', () => {
    expect(validateLifeEvent({ ...valid, date: '' }).date).toBe('La fecha es obligatoria.');
    expect(validateLifeEvent({ ...valid, date: undefined }).date).toBe('La fecha es obligatoria.');
  });

  it('devuelve los errores en el orden del formulario', () => {
    expect(Object.keys(validateLifeEvent({}))).toEqual(['type', 'date']);
  });
});