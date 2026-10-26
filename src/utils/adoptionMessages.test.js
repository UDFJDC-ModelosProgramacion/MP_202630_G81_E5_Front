import { describe, it, expect } from 'vitest';
import {
  ADOPTION_NOT_FOUND_MESSAGE,
  PET_UNAVAILABLE_MESSAGE,
  getAdoptionPetName,
  getCreateErrorMessage,
  getDeleteErrorMessage,
  getMissingDataMessage,
  getStatusErrorMessage,
  isPetUnavailableError,
} from './adoptionMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const adoption = { pet: { name: 'Luna' } };

describe('isPetUnavailableError', () => {
  it('reconoce el 412 de mascota no disponible', () => {
    expect(isPetUnavailableError(apiError(412, 'The pet is not available for adoption'))).toBe(true);
  });

  it('ignora otros 412 y otros códigos', () => {
    expect(isPetUnavailableError(apiError(412, 'Adoption data is not valid'))).toBe(false);
    expect(isPetUnavailableError(apiError(404, 'The pet is not available for adoption'))).toBe(false);
    expect(isPetUnavailableError({ request: {} })).toBe(false);
  });

  it('expone el mensaje en español para el campo mascota', () => {
    expect(PET_UNAVAILABLE_MESSAGE).toBe(
      'Esta mascota ya no está disponible para adopción. Elige otra.',
    );
  });
});

describe('getAdoptionPetName', () => {
  it('usa el nombre de la mascota o un texto genérico', () => {
    expect(getAdoptionPetName(adoption)).toBe('Luna');
    expect(getAdoptionPetName({ pet: null })).toBe('la mascota');
    expect(getAdoptionPetName(undefined)).toBe('la mascota');
  });
});

describe('getCreateErrorMessage', () => {
  it('traduce el 404 del adoptante', () => {
    expect(getCreateErrorMessage(apiError(404, 'The adopter with the given id was not found'))).toBe(
      'El adoptante seleccionado no fue encontrado.',
    );
  });

  it('traduce el 404 del veterinario', () => {
    expect(
      getCreateErrorMessage(apiError(404, 'The veterinarian with the given id was not found')),
    ).toBe('El veterinario seleccionado no fue encontrado.');
  });

  it('traduce el 404 de la mascota', () => {
    expect(getCreateErrorMessage(apiError(404, 'The pet with the given id was not found'))).toBe(
      'La mascota seleccionada no fue encontrada.',
    );
  });

  it('muestra el mensaje del back cuando no reconoce el 404', () => {
    expect(getCreateErrorMessage(apiError(404, 'Algo no existe'))).toBe('Algo no existe');
  });

  it('muestra el mensaje del back en otros errores y el de conexión si no hay respuesta', () => {
    expect(getCreateErrorMessage(apiError(412, 'Adoption data is not valid'))).toBe(
      'Adoption data is not valid',
    );
    expect(getCreateErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });
});

describe('getMissingDataMessage', () => {
  it('devuelve null cuando hay mascotas, adoptantes y veterinarios', () => {
    expect(getMissingDataMessage({ pets: [1], adopters: [1], veterinarians: [1] })).toBeNull();
  });

  it('lista lo que falta', () => {
    expect(getMissingDataMessage({ pets: [], adopters: [1], veterinarians: [1] })).toBe(
      'Faltan datos para registrar una adopción: no hay mascotas.',
    );
    expect(getMissingDataMessage({ pets: [1], adopters: [], veterinarians: [] })).toBe(
      'Faltan datos para registrar una adopción: no hay adoptantes, veterinarios.',
    );
  });
});

describe('getDeleteErrorMessage', () => {
  it('explica que no se puede eliminar cuando el back lo rechaza (412)', () => {
    expect(getDeleteErrorMessage(apiError(412, 'Regla de negocio'), adoption)).toBe(
      'No se puede eliminar la adopción de Luna: Regla de negocio',
    );
  });

  it('informa que la adopción no fue encontrada (404)', () => {
    expect(getDeleteErrorMessage({ response: { status: 404, data: {} } }, adoption)).toBe(
      ADOPTION_NOT_FOUND_MESSAGE,
    );
  });

  it('usa el mensaje del servidor o el de conexión ante otros errores', () => {
    expect(getDeleteErrorMessage(apiError(500, 'Falla interna'), adoption)).toBe('Falla interna');
    expect(getDeleteErrorMessage({ request: {} }, adoption)).toMatch(/conectar con el servidor/);
  });
});

describe('getStatusErrorMessage', () => {
  it('informa que la adopción no existe (404)', () => {
    expect(getStatusErrorMessage({ response: { status: 404, data: {} } })).toBe(
      'Adopción no encontrada.',
    );
  });

  it('muestra el mensaje del back cuando el estado no es válido (412)', () => {
    expect(getStatusErrorMessage(apiError(412, 'Adoption status is not valid'))).toBe(
      'Adoption status is not valid',
    );
  });

  it('muestra el error de conexión si no hay respuesta', () => {
    expect(getStatusErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });
});
