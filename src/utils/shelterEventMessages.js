import { getErrorMessage } from '../services/apiError';

export const SHELTER_NOT_FOUND_MESSAGE = 'Refugio no encontrado.';
export const EVENT_NOT_FOUND_MESSAGE = 'Evento no encontrado.';
export const OTHER_SHELTER_EVENT_MESSAGE = 'Este evento pertenece a otro refugio.';
export const INVALID_EVENT_MESSAGE = 'Los datos del evento no son válidos. Revisa el nombre y la fecha.';
export const PAST_EVENT_DELETE_MESSAGE = 'No se puede eliminar un evento que ya ocurrió.';

const serverMessage = (error) => error?.response?.data?.apierror?.message ?? '';

function getNotFoundMessage(error) {
  const message = serverMessage(error);
  if (/shelter event/i.test(message)) return EVENT_NOT_FOUND_MESSAGE;
  if (/shelter/i.test(message)) return SHELTER_NOT_FOUND_MESSAGE;
  return null;
}

function getPreconditionMessage(error) {
  const message = serverMessage(error);
  if (/not associated to the shelter/i.test(message)) return OTHER_SHELTER_EVENT_MESSAGE;
  if (/not valid/i.test(message)) return INVALID_EVENT_MESSAGE;
  return null;
}

export function isNotFoundEvent(error) {
  return error?.response?.status === 404 && getNotFoundMessage(error) === EVENT_NOT_FOUND_MESSAGE;
}

export function isNotFoundShelter(error) {
  return error?.response?.status === 404 && getNotFoundMessage(error) === SHELTER_NOT_FOUND_MESSAGE;
}

export function getEventErrorMessage(error) {
  const status = error?.response?.status;
  const known =
    (status === 404 && getNotFoundMessage(error)) ||
    (status === 412 && getPreconditionMessage(error));
  return known || getErrorMessage(error);
}