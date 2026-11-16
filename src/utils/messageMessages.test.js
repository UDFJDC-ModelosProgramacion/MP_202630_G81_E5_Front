import { describe, it, expect } from 'vitest';
import {
  ADOPTER_NOT_FOUND_MESSAGE,
  INVALID_MESSAGE_MESSAGE,
  MESSAGE_ALREADY_SENT_MESSAGE,
  MESSAGE_NOT_FOUND_MESSAGE,
  OTHER_ADOPTER_MESSAGE,
  getMessageErrorMessage,
  isNotFoundMessage,
} from './messageMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

describe('getMessageErrorMessage', () => {
  it('informa que el adoptante no fue encontrado (404)', () => {
    expect(
      getMessageErrorMessage(apiError(404, 'The adopter with the given id was not found')),
    ).toBe(ADOPTER_NOT_FOUND_MESSAGE);
  });

  it('informa que el mensaje no fue encontrado (404)', () => {
    expect(
      getMessageErrorMessage(apiError(404, 'The message with the given id was not found')),
    ).toBe(MESSAGE_NOT_FOUND_MESSAGE);
  });

  it('rechaza un mensaje que pertenece a otro adoptante (412)', () => {
    expect(
      getMessageErrorMessage(apiError(412, 'The message is not associated to the adopter')),
    ).toBe(OTHER_ADOPTER_MESSAGE);
  });

  it('explica que un mensaje ya enviado no se puede editar (412)', () => {
    expect(
      getMessageErrorMessage(
        apiError(412, 'The message was already sent and cannot be edited'),
      ),
    ).toBe(MESSAGE_ALREADY_SENT_MESSAGE);
  });

  it('traduce los datos inválidos y la fecha futura (412)', () => {
    expect(getMessageErrorMessage(apiError(412, 'Message data is not valid'))).toBe(
      INVALID_MESSAGE_MESSAGE,
    );
    expect(
      getMessageErrorMessage(apiError(412, 'Message sent date cannot be in the future')),
    ).toBe(INVALID_MESSAGE_MESSAGE);
  });

  it('muestra el mensaje del back cuando no reconoce el error', () => {
    expect(getMessageErrorMessage(apiError(404, 'Algo no existe'))).toBe('Algo no existe');
    expect(getMessageErrorMessage(apiError(412, 'Otra regla'))).toBe('Otra regla');
    expect(getMessageErrorMessage(apiError(500, 'Falla interna'))).toBe('Falla interna');
  });

  it('no confunde un mensaje conocido en un código que no corresponde', () => {
    expect(
      getMessageErrorMessage(apiError(500, 'The adopter with the given id was not found')),
    ).toBe('The adopter with the given id was not found');
  });

  it('muestra el error de conexión si no hay respuesta', () => {
    expect(getMessageErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });
});

describe('isNotFoundMessage', () => {
  it('es verdadero solo para el 404 del mensaje', () => {
    expect(isNotFoundMessage(apiError(404, 'The message with the given id was not found'))).toBe(
      true,
    );
    expect(isNotFoundMessage(apiError(404, 'The adopter with the given id was not found'))).toBe(
      false,
    );
    expect(isNotFoundMessage(apiError(412, 'The message is not associated to the adopter'))).toBe(
      false,
    );
    expect(isNotFoundMessage({ request: {} })).toBe(false);
  });
});