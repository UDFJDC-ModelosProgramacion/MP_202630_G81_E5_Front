import { describe, expect, it } from 'vitest';
import {
  getLifeEventErrorMessage,
  LIFE_EVENT_NOT_FOUND_MESSAGE,
  LIFE_EVENT_OTHER_PET_MESSAGE,
} from './lifeEventMessages';

const apiError = (status, message) => ({
  response: { status, data: message ? { apierror: { message } } : {} },
});

describe('getLifeEventErrorMessage', () => {
  it('informa que el evento no existe', () => {
    const error = apiError(404, 'The life event with the given id was not found');
    expect(getLifeEventErrorMessage(error)).toBe(LIFE_EVENT_NOT_FOUND_MESSAGE);
  });

  it('informa que el veterinario no existe', () => {
    const error = apiError(404, 'The veterinarian with the given id was not found');
    expect(getLifeEventErrorMessage(error)).toBe('Veterinario no encontrado.');
  });

  it('informa que la mascota no existe', () => {
    const error = apiError(404, 'The pet with the given id was not found');
    expect(getLifeEventErrorMessage(error)).toBe('Mascota no encontrada.');
  });

  it('usa el mensaje de mascota no encontrada si el 404 no trae mensaje', () => {
    expect(getLifeEventErrorMessage(apiError(404))).toBe('Mascota no encontrada.');
  });

  it('explica que el evento es de otra mascota', () => {
    const error = apiError(412, 'The life event is not associated to the pet');
    expect(getLifeEventErrorMessage(error)).toBe(LIFE_EVENT_OTHER_PET_MESSAGE);
  });

  it('muestra el mensaje del back en otros rechazos 412', () => {
    const error = apiError(412, 'Life event data is not valid');
    expect(getLifeEventErrorMessage(error)).toBe('Life event data is not valid');
  });

  it('informa el error de conexión', () => {
    expect(getLifeEventErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });

  it('usa el mensaje del back en errores inesperados', () => {
    expect(getLifeEventErrorMessage(apiError(500, 'Boom'))).toBe('Boom');
  });
});