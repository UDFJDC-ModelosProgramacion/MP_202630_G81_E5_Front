import { getErrorMessage, isNotFound } from '../services/apiError';

export const DUPLICATE_ADOPTER_EMAIL_MESSAGE = 'Ya existe un adoptante con este correo electrónico.';
export const ADOPTER_NOT_FOUND_MESSAGE = 'Adoptante no encontrado.';

const DELETE_REASON = 'adopciones, mensajes o reseñas asociadas';

// El back responde en inglés: "There is already an adopter registered with that email"
export function isDuplicateEmailError(error) {
    const message = error?.response?.data?.apierror?.message ?? '';
    return error?.response?.status === 412 && message.toLowerCase().includes('email');
}

export function getAdopterSaveErrorMessage(error) {
    if (isDuplicateEmailError(error)) {
    return DUPLICATE_ADOPTER_EMAIL_MESSAGE;
    }
    if (isNotFound(error)) {
    return ADOPTER_NOT_FOUND_MESSAGE;
    }
    return getErrorMessage(error);
}

// ownAccount = true cuando el adoptante borra su propio perfil (mockup "Mi perfil")
export function getAdopterDeleteErrorMessage(error, adopter, ownAccount = false) {
    if (error?.response?.status === 412) {
    return ownAccount
        ? `No se puede eliminar tu cuenta porque tienes ${DELETE_REASON}.`
        : `No se puede eliminar a ${adopter.name}: tiene ${DELETE_REASON}.`;
    }
    if (isNotFound(error)) {
    return ADOPTER_NOT_FOUND_MESSAGE;
    }
    return getErrorMessage(error);
}