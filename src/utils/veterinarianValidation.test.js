import { describe, expect, it } from 'vitest';
import { validateVeterinarian } from './veterinarianValidation';

const valid = { name: 'Laura', email: 'laura@refugio.org', specialty: 'Cirugía' };

describe('validateVeterinarian', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validateVeterinarian(valid)).toEqual({});
  });

  it('exige el nombre', () => {
    expect(validateVeterinarian({ ...valid, name: '   ' }).name).toBe('El nombre es obligatorio.');
    expect(validateVeterinarian({ ...valid, name: undefined }).name).toBe(
      'El nombre es obligatorio.',
    );
  });

  it('exige el correo', () => {
    expect(validateVeterinarian({ ...valid, email: '' }).email).toBe('El correo es obligatorio.');
  });

  it('exige la especialidad', () => {
    expect(validateVeterinarian({ ...valid, specialty: ' ' }).specialty).toBe(
      'La especialidad es obligatoria.',
    );
  });

  it('devuelve los errores en el orden del formulario', () => {
    expect(Object.keys(validateVeterinarian({}))).toEqual(['name', 'email', 'specialty']);
  });
});