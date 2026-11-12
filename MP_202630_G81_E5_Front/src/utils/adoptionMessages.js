import { getErrorMessage, isNotFound } from '../services/apiError';

export const PET_UNAVAILABLE_MESSAGE =
  'Esta mascota ya no está disponible para adopción. Elige otra.';
export const ADOPTION_NOT_FOUND_MESSAGE = 'Adopción no encontrada.';

const NOT_FOUND_MESSAGES = [
  [/adopter/i, 'El adoptante seleccionado no fue encontrado.'],
  [/veterinarian/i, 'El veterinario seleccionado no fue encontrado.'],
  [/pet/i, 'La mascota seleccionada no fue encontrada.'],
];

export function isPetUnavailableError(error) {
  const message = error?.response?.data?.apierror?.message ?? '';
  return error?.response?.status === 412 && /not available for adoption/i.test(message);
}

export function getAdoptionPetName(adoption) {
  return adoption?.pet?.name ?? 'la mascota';
}

export function getCreateErrorMessage(error) {
  if (isNotFound(error)) {
    const message = error?.response?.data?.apierror?.message ?? '';
    const match = NOT_FOUND_MESSAGES.find(([pattern]) => pattern.test(message));
    if (match) return match[1];
  }
  return getErrorMessage(error);
}

export function getMissingDataMessage({ pets, adopters, veterinarians }) {
  const missing = [];
  if (pets.length === 0) missing.push('mascotas');
  if (adopters.length === 0) missing.push('adoptantes');
  if (veterinarians.length === 0) missing.push('veterinarios');
  if (missing.length === 0) return null;
  return `Faltan datos para registrar una adopción: no hay ${missing.join(', ')}.`;
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
