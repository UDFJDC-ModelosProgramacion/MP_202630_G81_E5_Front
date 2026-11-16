import { describe, expect, it } from 'vitest';
import {
  RETURN_RECORD_EXISTS_MESSAGE,
  RETURN_RECORD_INVALID_MESSAGE,
  RETURN_RECORD_NOT_FOUND_MESSAGE,
  getReturnRecordErrorMessage,
  getReturnRegisteredMessage,
  isReturnRecordExists,
  isReturnRecordNotFound,
} from './returnRecordMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const noRecord = apiError(404, 'The adoption does not have an associated return record');
const noAdoption = apiError(404, 'The adoption with the given id was not found');
const exists = apiError(412, 'The adoption already has an associated return record');
const invalid = apiError(412, 'Return record data is not valid');

describe('getReturnRecordErrorMessage', () => {
  it('informa que la devolución no fue encontrada (404)', () => {
    expect(getReturnRecordErrorMessage(noRecord)).toBe(RETURN_RECORD_NOT_FOUND_MESSAGE);
  });

  it('informa que la adopción no fue encontrada (404)', () => {
    expect(getReturnRecordErrorMessage(noAdoption)).toBe('Adopción no encontrada.');
  });

  it('rechaza una segunda devolución para la misma adopción (412)', () => {
    expect(getReturnRecordErrorMessage(exists)).toBe(RETURN_RECORD_EXISTS_MESSAGE);
  });

  it('traduce el rechazo de datos no válidos (412)', () => {
    expect(getReturnRecordErrorMessage(invalid)).toBe(RETURN_RECORD_INVALID_MESSAGE);
  });

  it('muestra el mensaje del back cuando no reconoce el error', () => {
    expect(getReturnRecordErrorMessage(apiError(412, 'Otra regla'))).toBe('Otra regla');
    expect(getReturnRecordErrorMessage(apiError(500, 'Falla interna'))).toBe('Falla interna');
  });

  it('muestra el error de conexión si no hay respuesta', () => {
    expect(getReturnRecordErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });
});

describe('detección de errores', () => {
  it('reconoce solo el 404 de la devolución', () => {
    expect(isReturnRecordNotFound(noRecord)).toBe(true);
    expect(isReturnRecordNotFound(noAdoption)).toBe(false);
    expect(isReturnRecordNotFound(exists)).toBe(false);
    expect(isReturnRecordNotFound({ request: {} })).toBe(false);
  });

  it('reconoce solo el 412 de devolución ya registrada', () => {
    expect(isReturnRecordExists(exists)).toBe(true);
    expect(isReturnRecordExists(invalid)).toBe(false);
    expect(isReturnRecordExists(noRecord)).toBe(false);
  });
});

describe('getReturnRegisteredMessage', () => {
  it('nombra la mascota que vuelve a estar disponible', () => {
    expect(getReturnRegisteredMessage({ pet: { name: 'Firulais' } })).toBe(
      'Devolución registrada. Firulais vuelve a estar disponible para adopción.',
    );
    expect(getReturnRegisteredMessage({})).toBe(
      'Devolución registrada. La mascota vuelve a estar disponible para adopción.',
    );
  });
});
