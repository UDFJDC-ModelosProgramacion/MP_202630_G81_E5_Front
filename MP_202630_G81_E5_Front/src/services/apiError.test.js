import { describe, it, expect } from 'vitest';
import { getErrorMessage, isNotFound } from './apiError';

describe('getErrorMessage', () => {
  it('usa el mensaje que envía el servidor', () => {
    const error = { response: { status: 412, data: { message: 'La mascota tiene adopciones' } } };
    expect(getErrorMessage(error)).toBe('La mascota tiene adopciones');
  });

  it('usa el mensaje por defecto si el servidor no envía mensaje', () => {
    const error = { response: { status: 500, data: {} } };
    expect(getErrorMessage(error, 'Falló')).toBe('Falló');
  });

  it('avisa cuando no hay conexión con el servidor', () => {
    expect(getErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });

  it('devuelve el mensaje por defecto ante errores desconocidos', () => {
    expect(getErrorMessage(new Error('x'))).toMatch(/error inesperado/);
  });
  it('lee el mensaje anidado en apierror', () => {
  const error = { response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } } };
  expect(getErrorMessage(error)).toBe('Shelter is not valid');
  });
});

describe('isNotFound', () => {
  it('detecta el estado 404', () => {
    expect(isNotFound({ response: { status: 404 } })).toBe(true);
    expect(isNotFound({ response: { status: 412 } })).toBe(false);
    expect(isNotFound(undefined)).toBe(false);
  });
});