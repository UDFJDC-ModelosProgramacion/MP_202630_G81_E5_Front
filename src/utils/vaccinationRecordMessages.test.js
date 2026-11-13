import { describe, expect, it } from 'vitest';
import {
  getVaccinationRecordErrorMessage,
  PET_NOT_FOUND_MESSAGE,
  VACCINATION_RECORD_EXISTS_MESSAGE,
  VACCINATION_RECORD_NOT_FOUND_MESSAGE,
} from './vaccinationRecordMessages';

const apiError = (status, message) => ({
  response: { status, data: message ? { apierror: { message } } : {} },
});

describe('getVaccinationRecordErrorMessage', () => {
  it('explica que la mascota ya tiene carnet', () => {
    const error = apiError(412, 'The pet already has an associated vaccination record');
    expect(getVaccinationRecordErrorMessage(error)).toBe(VACCINATION_RECORD_EXISTS_MESSAGE);
  });

  it('informa que la mascota no existe', () => {
    const error = apiError(404, 'The pet with the given id was not found');
    expect(getVaccinationRecordErrorMessage(error)).toBe(PET_NOT_FOUND_MESSAGE);
  });

  it('informa que la mascota no tiene carnet', () => {
    const error = apiError(404, 'The pet does not have an associated vaccination record');
    expect(getVaccinationRecordErrorMessage(error)).toBe(VACCINATION_RECORD_NOT_FOUND_MESSAGE);
  });

  it('usa el mensaje de mascota no encontrada si el 404 no trae mensaje', () => {
    expect(getVaccinationRecordErrorMessage(apiError(404))).toBe(PET_NOT_FOUND_MESSAGE);
  });

  it('muestra el mensaje del back en otros rechazos 412', () => {
    const error = apiError(412, 'Vaccination record data is not valid');
    expect(getVaccinationRecordErrorMessage(error)).toBe('Vaccination record data is not valid');
  });

  it('informa el error de conexión', () => {
    expect(getVaccinationRecordErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });

  it('usa el mensaje del back en errores inesperados', () => {
    expect(getVaccinationRecordErrorMessage(apiError(500, 'Boom'))).toBe('Boom');
  });
});