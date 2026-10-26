import { describe, it, expect } from 'vitest';
import { validateAdoption } from './adoptionValidation';

const valid = {
  petId: '1',
  adopterId: '2',
  veterinarianId: '3',
  date: '2026-09-20',
  status: 'IN_PROGRESS',
};

const pets = [
  { id: 1, name: 'Nube', available: true },
  { id: 2, name: 'Luna', available: false },
];

describe('validateAdoption', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validateAdoption(valid, pets)).toEqual({});
  });

  it('acepta el estado vacío (el back lo guarda como "En curso")', () => {
    expect(validateAdoption({ ...valid, status: '' }, pets)).toEqual({});
  });

  it('exige la mascota', () => {
    expect(validateAdoption({ ...valid, petId: '' }, pets).petId).toBe('Selecciona una mascota.');
  });

  it('exige el adoptante', () => {
    expect(validateAdoption({ ...valid, adopterId: '' }, pets).adopterId).toBe(
      'Selecciona un adoptante.',
    );
  });

  it('exige el veterinario responsable', () => {
    expect(validateAdoption({ ...valid, veterinarianId: '' }, pets).veterinarianId).toBe(
      'Selecciona un veterinario responsable.',
    );
  });

  it('exige la fecha', () => {
    expect(validateAdoption({ ...valid, date: '' }, pets).date).toBe(
      'La fecha de adopción es obligatoria.',
    );
  });

  it('rechaza una fecha que no existe', () => {
    expect(validateAdoption({ ...valid, date: '2026-02-31' }, pets).date).toBe(
      'La fecha de adopción no es válida.',
    );
  });

  it('rechaza una mascota que ya no está disponible', () => {
    expect(validateAdoption({ ...valid, petId: '2' }, pets).petId).toBe(
      'Esta mascota ya no está disponible para adopción. Elige otra.',
    );
  });

  it('no valida disponibilidad si la mascota no está en la lista', () => {
    expect(validateAdoption({ ...valid, petId: '99' }, pets)).toEqual({});
    expect(validateAdoption(valid)).toEqual({});
  });

  it('rechaza un estado que no existe', () => {
    expect(validateAdoption({ ...valid, status: 'CANCELLED' }, pets).status).toBe(
      'El estado no es válido.',
    );
  });

  it('trata los campos ausentes como vacíos', () => {
    expect(Object.keys(validateAdoption({}))).toEqual([
      'petId',
      'adopterId',
      'veterinarianId',
      'date',
    ]);
  });

  it('lista los errores en el orden de los campos del formulario', () => {
    const errors = validateAdoption(
      { petId: '', adopterId: '', veterinarianId: '', date: '', status: '' },
      pets,
    );
    expect(Object.keys(errors)).toEqual(['petId', 'adopterId', 'veterinarianId', 'date']);
  });
});
