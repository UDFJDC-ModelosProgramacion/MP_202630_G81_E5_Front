import { describe, expect, it } from 'vitest';
import {
  getVeterinarianDeleteErrorMessage,
  VETERINARIAN_NOT_FOUND_MESSAGE,
} from './veterinarianMessages';

const veterinarian = { name: 'Carlos Gómez' };
const precondition = (message) => ({
  response: { status: 412, data: { apierror: { message } } },
});

describe('getVeterinarianDeleteErrorMessage', () => {
  it('explica el rechazo por eventos de vida asociados', () => {
    const error = precondition('Unable to delete the veterinarian because it has associated life events');
    expect(getVeterinarianDeleteErrorMessage(error, veterinarian)).toBe(
      'No se puede eliminar a Carlos Gómez: tiene eventos de vida asociados.',
    );
  });

  it('explica el rechazo por adopciones asociadas', () => {
    const error = precondition('Unable to delete the veterinarian because it has associated adoptions');
    expect(getVeterinarianDeleteErrorMessage(error, veterinarian)).toBe(
      'No se puede eliminar a Carlos Gómez: tiene adopciones asociadas.',
    );
  });

  it('usa un mensaje genérico en 412 con un texto desconocido', () => {
    expect(getVeterinarianDeleteErrorMessage(precondition('otro'), veterinarian)).toBe(
      'No se puede eliminar a Carlos Gómez: tiene eventos de vida o adopciones asociados.',
    );
  });

  it('informa cuando el veterinario no existe', () => {
    expect(
      getVeterinarianDeleteErrorMessage({ response: { status: 404, data: {} } }, veterinarian),
    ).toBe(VETERINARIAN_NOT_FOUND_MESSAGE);
  });

  it('informa el error de conexión', () => {
    expect(getVeterinarianDeleteErrorMessage({ request: {} }, veterinarian)).toMatch(
      /conectar con el servidor/,
    );
  });

  it('usa el mensaje del back en otros errores', () => {
    const error = { response: { status: 500, data: { apierror: { message: 'Boom' } } } };
    expect(getVeterinarianDeleteErrorMessage(error, veterinarian)).toBe('Boom');
  });
});