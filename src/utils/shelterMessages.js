import { getErrorMessage, isNotFound } from '../services/apiError';

export const DUPLICATE_SHELTER_MESSAGE =
  'Ya existe un refugio con ese nombre en esa ciudad.';

export function getSaveErrorMessage(error) {
  if (error?.response?.status === 412) {
    return getErrorMessage(error);
  }
  if (isNotFound(error)) {
    return 'Refugio no encontrado.';
  }
  return getErrorMessage(error);
}

export function getDeleteErrorMessage(error, shelter) {
  if (error?.response?.status === 412) {
    return `No se puede eliminar ${shelter.name}: tiene mascotas, eventos u otros datos asociados.`;
  }
  if (isNotFound(error)) {
    return 'Refugio no encontrado.';
  }
  return getErrorMessage(error);
}