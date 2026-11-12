import { getErrorMessage, isNotFound } from '../services/apiError';

export function getDeleteErrorMessage(error, pet) {
  if (error?.response?.status === 412) {
    return `No se puede eliminar a ${pet.name}: tiene adopciones o fotos asociadas.`;
  }
  if (isNotFound(error)) {
    return 'Mascota no encontrada.';
  }
  return getErrorMessage(error);
}