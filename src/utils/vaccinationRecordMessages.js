import { getErrorMessage, isNotFound } from '../services/apiError';

export const PET_NOT_FOUND_MESSAGE = 'Mascota no encontrada.';
export const VACCINATION_RECORD_NOT_FOUND_MESSAGE = 'Carnet de vacunación no encontrado.';
export const VACCINATION_RECORD_EXISTS_MESSAGE = 'Esta mascota ya tiene un carnet de vacunación.';

export function getVaccinationRecordErrorMessage(error) {
  const backMessage = error?.response?.data?.apierror?.message ?? '';

  if (error?.response?.status === 412 && /already has/i.test(backMessage)) {
    return VACCINATION_RECORD_EXISTS_MESSAGE;
  }
  if (isNotFound(error)) {
    return /vaccination record/i.test(backMessage)
      ? VACCINATION_RECORD_NOT_FOUND_MESSAGE
      : PET_NOT_FOUND_MESSAGE;
  }
  return getErrorMessage(error);
}