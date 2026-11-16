import { formatAdoptionDate, toDateInputValue } from './adoptionFormatters';

export const EVENT_STATUS = { UPCOMING: 'Próximo', DONE: 'Realizado' };

export function todayInputValue(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isPastEvent(event, now = new Date()) {
  const day = toDateInputValue(event?.date);
  return day !== '' && day < todayInputValue(now);
}

export function getEventStatus(event, now = new Date()) {
  return isPastEvent(event, now) ? EVENT_STATUS.DONE : EVENT_STATUS.UPCOMING;
}

export function formatEventDate(value) {
  return formatAdoptionDate(value);
}