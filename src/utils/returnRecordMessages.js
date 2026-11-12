import { getErrorMessage } from '../services/apiError';
import { ADOPTION_NOT_FOUND_MESSAGE } from './adoptionMessages';

export const NO_RETURN_RECORD_MESSAGE = 'Esta adopción todavía no tiene una devolución registrada.';
export const RETURN_RECORD_NOT_FOUND_MESSAGE = 'Devolución no encontrada.';
export const RETURN_RECORD_EXISTS_MESSAGE = 'Esta adopción ya tiene una devolución registrada.';
export const RETURN_RECORD_INVALID_MESSAGE = 'Los datos de la devolución no son válidos.';
export const RETURN_RECORD_UPDATED_MESSAGE = 'Devolución actualizada correctamente.';
export const RETURN_RECORD_DELETED_MESSAGE = 'Devolución eliminada correctamente.';

const serverMessage = (error) => error?.response?.data?.apierror?.message ?? '';
const hasStatus = (error, status) => error?.response?.status === status;

export function isReturnRecordNotFound(error) {
  return hasStatus(error, 404) && /return record/i.test(serverMessage(error));
}

export function isReturnRecordExists(error) {
  return hasStatus(error, 412) && /already has/i.test(serverMessage(error));
}

export function getReturnRegisteredMessage(adoption) {
  const petName = adoption?.pet?.name ?? 'La mascota';
  return `Devolución registrada. ${petName} vuelve a estar disponible para adopción.`;
}

function getKnownMessage(error) {
  if (isReturnRecordNotFound(error)) return RETURN_RECORD_NOT_FOUND_MESSAGE;
  if (hasStatus(error, 404)) return ADOPTION_NOT_FOUND_MESSAGE;
  if (isReturnRecordExists(error)) return RETURN_RECORD_EXISTS_MESSAGE;
  if (hasStatus(error, 412) && /not valid/i.test(serverMessage(error))) {
    return RETURN_RECORD_INVALID_MESSAGE;
  }
  return null;
}

export function getReturnRecordErrorMessage(error) {
  return getKnownMessage(error) ?? getErrorMessage(error);
}
