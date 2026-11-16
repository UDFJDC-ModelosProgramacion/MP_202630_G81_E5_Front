import { describe, it, expect } from 'vitest';
import {
  EVENT_NOT_FOUND_MESSAGE,
  INVALID_EVENT_MESSAGE,
  OTHER_SHELTER_EVENT_MESSAGE,
  PAST_EVENT_DELETE_MESSAGE,
  SHELTER_NOT_FOUND_MESSAGE,
  getEventErrorMessage,
  isNotFoundEvent,
  isNotFoundShelter,
} from './shelterEventMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const shelterMissing = apiError(404, 'The shelter with the given id was not found');
const eventMissing = apiError(404, 'The shelter event with the given id was not found');

describe('getEventErrorMessage', () => {
  it('informa que el refugio no fue encontrado (404)', () => {
    expect(getEventErrorMessage(shelterMissing)).toBe(SHELTER_NOT_FOUND_MESSAGE);
  });

  it('informa que el evento no fue encontrado (404)', () => {
    expect(getEventErrorMessage(eventMissing)).toBe(EVENT_NOT_FOUND_MESSAGE);
  });

  it('rechaza un evento que pertenece a otro refugio (412)', () => {
    expect(
      getEventErrorMessage(apiError(412, 'The shelter event is not associated to the shelter')),
    ).toBe(OTHER_SHELTER_EVENT_MESSAGE);
  });

  it('traduce el rechazo de datos de evento inválidos (412)', () => {
    expect(getEventErrorMessage(apiError(412, 'Shelter event data is not valid'))).toBe(
      INVALID_EVENT_MESSAGE,
    );
  });

  it('muestra el mensaje del back cuando no reconoce el error', () => {
    expect(getEventErrorMessage(apiError(404, 'Algo no existe'))).toBe('Algo no existe');
    expect(getEventErrorMessage(apiError(412, 'Otra regla'))).toBe('Otra regla');
  });
});

describe('isNotFoundEvent', () => {
  it('es verdadero cuando el evento no existe', () => {
    expect(isNotFoundEvent(eventMissing)).toBe(true);
  });

  it('es falso cuando lo que no existe es el refugio', () => {
    expect(isNotFoundEvent(shelterMissing)).toBe(false);
  });
});

describe('isNotFoundShelter', () => {
  it('es verdadero cuando el refugio no existe', () => {
    expect(isNotFoundShelter(shelterMissing)).toBe(true);
  });
});

describe('PAST_EVENT_DELETE_MESSAGE', () => {
  it('explica por qué no se puede eliminar un evento pasado', () => {
    expect(PAST_EVENT_DELETE_MESSAGE).toBe('No se puede eliminar un evento que ya ocurrió.');
  });
});