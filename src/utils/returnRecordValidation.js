import { toDateInputValue } from './adoptionFormatters';

export const REASON_MAX_LENGTH = 255;

const isBlank = (value) => !String(value ?? '').trim();

function validateDate(date) {
  if (isBlank(date)) return 'La fecha de devolución es obligatoria.';
  return toDateInputValue(date) === date ? undefined : 'La fecha de devolución no es válida.';
}

function validateReason(reason) {
  if (isBlank(reason)) return 'El motivo es obligatorio.';
  return String(reason).trim().length > REASON_MAX_LENGTH
    ? `El motivo no puede superar los ${REASON_MAX_LENGTH} caracteres.`
    : undefined;
}

export function validateReturnRecord(values) {
  const candidates = {
    date: validateDate(values.date),
    reason: validateReason(values.reason),
  };

  return Object.fromEntries(Object.entries(candidates).filter(([, message]) => message));
}
