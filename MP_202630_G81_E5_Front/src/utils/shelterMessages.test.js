import { describe, it, expect } from 'vitest';
import {
  DUPLICATE_SHELTER_MESSAGE,
  getDeleteErrorMessage,
  getSaveErrorMessage,
} from './shelterMessages';

const shelter = { name: 'Huellitas' };

describe('getDeleteErrorMessage', () => {
  it('explica que no se puede eliminar cuando tiene datos asociados (412)', () => {
    const error = { response: { status: 412, data: { apierror: { message: 'has pets' } } } };
    expect(getDeleteErrorMessage(error, shelter)).toBe(
      'No se puede eliminar Huellitas: tiene mascotas, eventos u otros datos asociados.',
    );
  });

  it('informa que el refugio no fue encontrado (404)', () => {
    expect(getDeleteErrorMessage({ response: { status: 404, data: {} } }, shelter)).toBe(
      'Refugio no encontrado.',
    );
  });

  it('usa el mensaje del servidor ante otros errores', () => {
    const error = { response: { status: 500, data: { apierror: { message: 'Falla interna' } } } };
    expect(getDeleteErrorMessage(error, shelter)).toBe('Falla interna');
  });
});

describe('getSaveErrorMessage', () => {
  it('muestra el mensaje del servidor en una regla de negocio (412)', () => {
    const error = { response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } } };
    expect(getSaveErrorMessage(error)).toBe('Shelter is not valid');
  });

  it('informa que el refugio no fue encontrado (404)', () => {
    expect(getSaveErrorMessage({ response: { status: 404, data: {} } })).toBe('Refugio no encontrado.');
  });

  it('avisa cuando no hay conexión con el servidor', () => {
    expect(getSaveErrorMessage({ request: {} })).toBe(
      'No se pudo conectar con el servidor. Verifica tu conexión.',
    );
  });
});

describe('DUPLICATE_SHELTER_MESSAGE', () => {
  it('tiene el texto del aviso de duplicado', () => {
    expect(DUPLICATE_SHELTER_MESSAGE).toBe('Ya existe un refugio con este nombre en esta ciudad.');
  });
});