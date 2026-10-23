import { describe, it, expect } from 'vitest';
import { buildPetPayload } from './petMapper';

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