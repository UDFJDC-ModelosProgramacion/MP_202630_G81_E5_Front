import { describe, it, expect } from 'vitest';
import { buildPetPayload, EMPTY_PET_FORM, petToFormValues } from './petMapper';

const form = { shelterId: '3', name: '  Luna ', species: 'Perro', breed: '', age: '0' };

describe('buildPetPayload', () => {
  it('construye una mascota nueva disponible y asociada al refugio', () => {
    expect(buildPetPayload(form)).toEqual({
      name: 'Luna',
      species: 'Perro',
      breed: null,
      age: 0,
      available: true,
      shelter: { id: 3 },
    });
  });

  it('conserva los campos que el formulario no edita', () => {
    const existing = { id: 7, sex: 'F', size: 'M', temperament: 'Dócil', specialNeeds: 'Ninguna', available: false };
    const payload = buildPetPayload({ ...form, breed: ' Labrador ' }, existing);
    expect(payload).toMatchObject({ id: 7, sex: 'F', size: 'M', temperament: 'Dócil', specialNeeds: 'Ninguna', available: false, breed: 'Labrador' });
  });
});

describe('petToFormValues', () => {
  it('convierte una mascota en valores de formulario', () => {
    const pet = { name: 'Luna', species: 'Perro', breed: null, age: 0, shelter: { id: 2 } };
    expect(petToFormValues(pet)).toEqual({ shelterId: '2', name: 'Luna', species: 'Perro', breed: '', age: '0' });
  });

  it('expone un formulario vacío', () => {
    expect(EMPTY_PET_FORM).toEqual({ shelterId: '', name: '', species: '', breed: '', age: '' });
  });
});