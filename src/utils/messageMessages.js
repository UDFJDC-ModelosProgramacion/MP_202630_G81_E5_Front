import { getErrorMessage } from '../services/apiError';

export const ADOPTER_NOT_FOUND_MESSAGE = 'Adoptante no encontrado.';
export const MESSAGE_NOT_FOUND_MESSAGE = 'Mensaje no encontrado.';
export const OTHER_ADOPTER_MESSAGE = 'Este mensaje pertenece a otro adoptante.';
export const MESSAGE_ALREADY_SENT_MESSAGE = 'No se puede editar un mensaje que ya fue enviado.';
export const INVALID_MESSAGE_MESSAGE = 'Los datos del mensaje no son válidos. Revisa el contenido.';

const serverMessage = (error) => error?.response?.data?.apierror?.message ?? '';

function getNotFoundMessage(error) {
  const message = serverMessage(error);
  if (/adopter/i.test(message)) return ADOPTER_NOT_FOUND_MESSAGE;
  if (/message/i.test(message)) return MESSAGE_NOT_FOUND_MESSAGE;
  return null;
}

function getPreconditionMessage(error) {
  const message = serverMessage(error);
  if (/not associated to the adopter/i.test(message)) return OTHER_ADOPTER_MESSAGE;
  if (/already sent/i.test(message)) return MESSAGE_ALREADY_SENT_MESSAGE;
  if (/not valid|future/i.test(message)) return INVALID_MESSAGE_MESSAGE;
  return null;
}

export function isNotFoundMessage(error) {
  return error?.response?.status === 404 && getNotFoundMessage(error) === MESSAGE_NOT_FOUND_MESSAGE;
}

export function getMessageErrorMessage(error) {
  const status = error?.response?.status;
  const known =
    (status === 404 && getNotFoundMessage(error)) ||
    (status === 412 && getPreconditionMessage(error));
  return known || getErrorMessage(error);
}