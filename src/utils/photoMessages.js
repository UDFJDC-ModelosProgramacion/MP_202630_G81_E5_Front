import { getErrorMessage, isNotFound } from '../services/apiError';
import { PHOTO_OWNER } from './photoOwners';

const SERVER_MESSAGES = {
  'Photo url is not valid': 'La URL de la foto no es válida.',
  'The photo must be associated to a pet or to a shelter':
    'La foto debe asociarse a una mascota o a un refugio.',
  'The photo is not associated to the pet': 'La foto no pertenece a esta mascota.',
  'The photo is not associated to the shelter': 'La foto no pertenece a este refugio.',
};

const OWNER_NOT_FOUND = {
  [PHOTO_OWNER.PET]: 'Mascota no encontrada.',
  [PHOTO_OWNER.SHELTER]: 'Refugio no encontrado.',
};

function getNotFoundMessage(error, owner) {
  if (/photo/i.test(getErrorMessage(error))) return 'Foto no encontrada.';
  return OWNER_NOT_FOUND[owner] ?? 'No encontrado.';
}

export function getPhotoErrorMessage(error, owner) {
  if (isNotFound(error)) return getNotFoundMessage(error, owner);
  const message = getErrorMessage(error);
  return SERVER_MESSAGES[message] ?? message;
}

export function getPhotoDeleteErrorMessage(error, owner, label) {
  const message = getPhotoErrorMessage(error, owner);
  if (error?.response?.status === 412) {
    return `No se puede eliminar ${label}: ${message}`;
  }
  return message;
}