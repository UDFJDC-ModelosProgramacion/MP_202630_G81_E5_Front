import { getErrorMessage, isNotFound } from '../services/apiError';
import { VETERINARIAN_NOT_FOUND_MESSAGE } from './veterinarianMessages';
import { PET_NOT_FOUND_MESSAGE } from './vaccinationRecordMessages';

export const LIFE_EVENT_NOT_FOUND_MESSAGE = 'Evento de vida no encontrado.';
export const LIFE_EVENT_OTHER_PET_MESSAGE = 'Este evento no pertenece a la mascota.';

function getNotFoundMessage(backMessage) {
  if (/life event/i.test(backMessage)) return LIFE_EVENT_NOT_FOUND_MESSAGE;
  if (/veterinarian/i.test(backMessage)) return VETERINARIAN_NOT_FOUND_MESSAGE;
  return PET_NOT_FOUND_MESSAGE;
}

export function getLifeEventErrorMessage(error) {
  const backMessage = error?.response?.data?.apierror?.message ?? '';

  if (isNotFound(error)) {
    return getNotFoundMessage(backMessage);
  }
  if (error?.response?.status === 412 && /not associated/i.test(backMessage)) {
    return LIFE_EVENT_OTHER_PET_MESSAGE;
  }
  return getErrorMessage(error);
}