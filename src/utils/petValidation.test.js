import { describe, it, expect } from 'vitest';
import { validatePet } from './petValidation';

const valid = { shelterId: '1', name: 'Luna', species: 'Perro', breed: '', age: '2' };

describe('validatePet', () => {
  it('acepta una mascota válida', () => {
    expect(validatePet(valid)).toEqual({});
  });

  it('acepta la edad 0', () => {
    expect(validatePet({ ...valid, age: '0' })).toEqual({});
  });

  it('rechaza nombre vacío o solo espacios', () => {
    expect(validatePet({ ...valid, name: '' }).name).toBe('El nombre es obligatorio.');
    expect(validatePet({ ...valid, name: '   ' }).name).toBe('El nombre es obligatorio.');
  });

  it('rechaza especie vacía', () => {
    expect(validatePet({ ...valid, species: '' }).species).toBe('La especie es obligatoria.');
  });

  it('rechaza edad negativa', () => {
    expect(validatePet({ ...valid, age: '-1' }).age).toBe('La edad no puede ser negativa. Usa 0 o más.');
  });

  it('rechaza edad vacía o no entera', () => {
    expect(validatePet({ ...valid, age: '' }).age).toBe('La edad es obligatoria.');
    expect(validatePet({ ...valid, age: '1.5' }).age).toBe('La edad debe ser un número entero.');
  });

  it('rechaza cuando no se indica refugio', () => {
    expect(validatePet({ ...valid, shelterId: '' }).shelterId).toBe('Selecciona un refugio.');
  });
});