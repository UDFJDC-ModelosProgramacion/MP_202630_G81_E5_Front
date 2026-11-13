import { getErrorMessage, isNotFound } from '../services/apiError';

export const VETERINARIAN_NOT_FOUND_MESSAGE = 'Veterinario no encontrado.';

function getPreconditionReason(error) {
  const backMessage = error.response?.data?.apierror?.message ?? '';
  if (/life events/i.test(backMessage)) return 'tiene eventos de vida asociados';
  if (/adoptions/i.test(backMessage)) return 'tiene adopciones asociadas';
  return 'tiene eventos de vida o adopciones asociados';
}

export function getVeterinarianDeleteErrorMessage(error, veterinarian) {
  if (error?.response?.status === 412) {
    return `No se puede eliminar a ${veterinarian.name}: ${getPreconditionReason(error)}.`;
  }
  if (isNotFound(error)) {
    return VETERINARIAN_NOT_FOUND_MESSAGE;
  }
  return getErrorMessage(error);
}