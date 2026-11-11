import { getErrorMessage, isNotFound } from '../services/apiError';
import { ADOPTION_NOT_FOUND_MESSAGE } from './adoptionMessages';

    export const TRIAL_COHABITATION_NOT_FOUND_MESSAGE =
    'Esta adopción no tiene una convivencia de prueba registrada.';
    export const TRIAL_COHABITATION_ALREADY_EXISTS_MESSAGE =
    'Esta adopción ya tiene una convivencia de prueba registrada.';
    export const TRIAL_COHABITATION_START_REQUIRED_MESSAGE = 'La fecha de inicio es obligatoria.';
    export const TRIAL_COHABITATION_DATE_INVALID_MESSAGE =
    'La fecha de fin debe ser posterior a la fecha de inicio.';
    export const TRIAL_COHABITATION_REGISTERED_MESSAGE =
    'Convivencia de prueba registrada correctamente.';
    export const TRIAL_COHABITATION_UPDATED_MESSAGE =
    'Convivencia de prueba actualizada correctamente.';
    export const TRIAL_COHABITATION_DELETED_MESSAGE =
    'Convivencia de prueba eliminada correctamente.';
    export const TRIAL_COHABITATION_EMPTY_NOTE =
    'Esta adopción todavía no tiene una convivencia de prueba registrada.';


    const PRECONDITION_MESSAGES = [
    [/already has an associated trial cohabitation/i, TRIAL_COHABITATION_ALREADY_EXISTS_MESSAGE],
    [/end date must be after the start date/i, TRIAL_COHABITATION_DATE_INVALID_MESSAGE],
    [/trial cohabitation data is not valid/i, TRIAL_COHABITATION_START_REQUIRED_MESSAGE],
    ];

    export function getTrialCohabitationErrorMessage(error) {
    const backendMessage = error?.response?.data?.apierror?.message ?? '';

    if (isNotFound(error)) {
        return /trial cohabitation/i.test(backendMessage)
        ? TRIAL_COHABITATION_NOT_FOUND_MESSAGE
        : ADOPTION_NOT_FOUND_MESSAGE;
    }

    const match = PRECONDITION_MESSAGES.find(([pattern]) => pattern.test(backendMessage));
    return match ? match[1] : getErrorMessage(error);
}
