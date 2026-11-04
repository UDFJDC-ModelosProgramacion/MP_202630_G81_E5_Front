import { describe, expect, it } from 'vitest';
import { getPhotoDeleteErrorMessage, getPhotoErrorMessage } from './photoMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

describe('getPhotoErrorMessage', () => {
  it('traduce la URL inválida', () => {
    expect(getPhotoErrorMessage(apiError(412, 'Photo url is not valid'), 'pets')).toBe(
      'La URL de la foto no es válida.',
    );
  });

  it('traduce la foto sin destino', () => {
    expect(
      getPhotoErrorMessage(apiError(412, 'The photo must be associated to a pet or to a shelter'), 'pets'),
    ).toBe('La foto debe asociarse a una mascota o a un refugio.');
  });

  it('traduce la foto de otra mascota', () => {
    expect(getPhotoErrorMessage(apiError(412, 'The photo is not associated to the pet'), 'pets')).toBe(
      'La foto no pertenece a esta mascota.',
    );
  });

  it('traduce la foto de otro refugio', () => {
    expect(
      getPhotoErrorMessage(apiError(412, 'The photo is not associated to the shelter'), 'shelters'),
    ).toBe('La foto no pertenece a este refugio.');
  });

  it('muestra el mensaje del back si no hay traducción', () => {
    expect(getPhotoErrorMessage(apiError(412, 'Otra regla'), 'pets')).toBe('Otra regla');
  });

  it('informa foto no encontrada', () => {
    expect(
      getPhotoErrorMessage(apiError(404, 'The photo with the given id was not found'), 'pets'),
    ).toBe('Foto no encontrada.');
  });

  it('informa mascota no encontrada', () => {
    expect(getPhotoErrorMessage(apiError(404, 'The pet with the given id was not found'), 'pets')).toBe(
      'Mascota no encontrada.',
    );
  });

  it('informa refugio no encontrado', () => {
    expect(getPhotoErrorMessage({ response: { status: 404, data: {} } }, 'shelters')).toBe(
      'Refugio no encontrado.',
    );
  });

  it('usa un mensaje genérico si el destino es desconocido', () => {
    expect(getPhotoErrorMessage({ response: { status: 404, data: {} } }, 'otro')).toBe('No encontrado.');
  });

  it('informa el error de conexión', () => {
    expect(getPhotoErrorMessage({ request: {} }, 'pets')).toMatch(/conectar con el servidor/);
  });
  it('explica por qué no se puede eliminar una foto de otro destino', () => {
    expect(
      getPhotoDeleteErrorMessage(apiError(412, 'The photo is not associated to the pet'), 'pets', 'Foto 1'),
    ).toBe('No se puede eliminar Foto 1: La foto no pertenece a esta mascota.');
  });

  it('al eliminar usa el mensaje normal en los demás errores', () => {
    expect(
      getPhotoDeleteErrorMessage(apiError(404, 'The photo with the given id was not found'), 'pets', 'Foto 1'),
    ).toBe('Foto no encontrada.');
    expect(getPhotoDeleteErrorMessage({ request: {} }, 'pets', 'Foto 1')).toMatch(
      /conectar con el servidor/,
    );
  });
});