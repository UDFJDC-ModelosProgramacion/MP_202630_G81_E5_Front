import { getErrorMessage } from '../services/apiError';

export const SHELTER_NOT_FOUND_MESSAGE = 'Refugio no encontrado.';
export const VIDEO_NOT_FOUND_MESSAGE = 'Video no encontrado.';
export const OTHER_SHELTER_VIDEO_MESSAGE = 'Este video pertenece a otro refugio.';
export const INVALID_VIDEO_MESSAGE = 'La URL del video no es válida.';

const serverMessage = (error) => error?.response?.data?.apierror?.message ?? '';

function getNotFoundMessage(error) {
  const message = serverMessage(error);
  if (/video/i.test(message)) return VIDEO_NOT_FOUND_MESSAGE;
  if (/shelter/i.test(message)) return SHELTER_NOT_FOUND_MESSAGE;
  return null;
}

function getPreconditionMessage(error) {
  const message = serverMessage(error);
  if (/not associated to the shelter/i.test(message)) return OTHER_SHELTER_VIDEO_MESSAGE;
  if (/not valid/i.test(message)) return INVALID_VIDEO_MESSAGE;
  return null;
}

export function isNotFoundVideo(error) {
  return error?.response?.status === 404 && getNotFoundMessage(error) === VIDEO_NOT_FOUND_MESSAGE;
}

export function isNotFoundShelter(error) {
  return error?.response?.status === 404 && getNotFoundMessage(error) === SHELTER_NOT_FOUND_MESSAGE;
}

export function getVideoErrorMessage(error) {
  const status = error?.response?.status;
  const known =
    (status === 404 && getNotFoundMessage(error)) ||
    (status === 412 && getPreconditionMessage(error));
  return known || getErrorMessage(error);
}

export function formatVideoCount(count) {
  return `Mostrando ${count} ${count === 1 ? 'video' : 'videos'}`;
}

export function getVideoDeleteErrorMessage(error) {
  const message = getVideoErrorMessage(error);
  if (error?.response?.status === 412) return `No se puede eliminar el video: ${message}`;
  return message;
}