import { getErrorMessage, isNotFound } from '../services/apiError';

export const PET_UNAVAILABLE_MESSAGE =
  'Esta mascota ya no está disponible para adopción. Elige otra.';
export const ADOPTION_NOT_FOUND_MESSAGE = 'Adopción no encontrada.';

export function isPetUnavailableError(error) {
  const message = error?.response?.data?.apierror?.message ?? '';
  return error?.response?.status === 412 && /not available for adoption/i.test(message);
}

export function getAdoptionPetName(adoption) {
  return adoption?.pet?.name ?? 'la mascota';
}

export function getDeleteErrorMessage(error, adoption) {
  if (error?.response?.status === 412) {
    return `No se puede eliminar la adopción de ${getAdoptionPetName(adoption)}: ${getErrorMessage(error)}`;
  }
  if (isNotFound(error)) {
    return ADOPTION_NOT_FOUND_MESSAGE;
  }
  return getErrorMessage(error);
}

export function getStatusErrorMessage(error) {
  if (isNotFound(error)) {
    return ADOPTION_NOT_FOUND_MESSAGE;
  }
  return getErrorMessage(error);
}
