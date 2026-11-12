import { describe, it, expect } from 'vitest';
import { getDeleteErrorMessage } from './petMessages';

const pet = { name: 'Rocky' };

describe('getDeleteErrorMessage', () => {
  it('explica que no se puede eliminar cuando hay adopciones o fotos (412)', () => {
    const error = { response: { status: 412, data: { apierror: { message: 'Pet has adoptions' } } } };
    expect(getDeleteErrorMessage(error, pet)).toBe(
      'No se puede eliminar a Rocky: tiene adopciones o fotos asociadas.',
    );
  });

  it('informa que la mascota no fue encontrada (404)', () => {
    expect(getDeleteErrorMessage({ response: { status: 404, data: {} } }, pet)).toBe(
      'Mascota no encontrada.',
    );
  });

  it('usa el mensaje del servidor ante otros errores', () => {
    const error = { response: { status: 500, data: { apierror: { message: 'Falla interna' } } } };
    expect(getDeleteErrorMessage(error, pet)).toBe('Falla interna');
  });
});