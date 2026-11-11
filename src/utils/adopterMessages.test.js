import { describe, it, expect } from 'vitest';
import {
ADOPTER_NOT_FOUND_MESSAGE,
DUPLICATE_ADOPTER_EMAIL_MESSAGE,
getAdopterDeleteErrorMessage,
getAdopterSaveErrorMessage,
isDuplicateEmailError,
} from './adopterMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const duplicate = apiError(412, 'There is already an adopter registered with that email');
const notValid = apiError(412, 'Adopter data is not valid');
const adopter = { name: 'Laura Gómez' };

describe('isDuplicateEmailError', () => {
it('detecta el 412 del correo repetido', () => {
    expect(isDuplicateEmailError(duplicate)).toBe(true);
});

it('no confunde otros 412 ni otros códigos', () => {
    expect(isDuplicateEmailError(notValid)).toBe(false);
    expect(isDuplicateEmailError(apiError(500, 'email'))).toBe(false);
    expect(isDuplicateEmailError(undefined)).toBe(false);
});
});

describe('getAdopterSaveErrorMessage', () => {
    it('traduce el correo repetido', () => {
    expect(getAdopterSaveErrorMessage(duplicate)).toBe(DUPLICATE_ADOPTER_EMAIL_MESSAGE);
});

it('muestra el mensaje del servidor en otras reglas de negocio', () => {
    expect(getAdopterSaveErrorMessage(notValid)).toBe('Adopter data is not valid');
});

it('informa que el adoptante no fue encontrado (404)', () => {
    expect(getAdopterSaveErrorMessage({ response: { status: 404, data: {} } })).toBe(
        ADOPTER_NOT_FOUND_MESSAGE,
    );
});

it('avisa cuando no hay conexión', () => {
    expect(getAdopterSaveErrorMessage({ request: {} })).toBe(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
    );
});
});

describe('getAdopterDeleteErrorMessage', () => {
const error412 = apiError(412, 'Unable to delete the adopter because it has associated adoptions');

it('explica por qué no se puede eliminar (412)', () => {
    expect(getAdopterDeleteErrorMessage(error412, adopter)).toBe(
        'No se puede eliminar a Laura Gómez: tiene adopciones, mensajes o reseñas asociadas.',
    );
});

it('usa la versión en primera persona para el perfil propio', () => {
    expect(getAdopterDeleteErrorMessage(error412, adopter, true)).toBe(
        'No se puede eliminar tu cuenta porque tienes adopciones, mensajes o reseñas asociadas.',
    );
});

it('informa que no fue encontrado (404)', () => {
    expect(getAdopterDeleteErrorMessage({ response: { status: 404, data: {} } }, adopter)).toBe(
        ADOPTER_NOT_FOUND_MESSAGE,
    );
});

it('usa el mensaje del servidor ante otros errores', () => {
    expect(getAdopterDeleteErrorMessage(apiError(500, 'Falla interna'), adopter)).toBe('Falla interna');
});
});
