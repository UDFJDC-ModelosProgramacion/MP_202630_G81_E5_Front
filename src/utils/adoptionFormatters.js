import { formatPetType } from './formatters';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

/**
 * Convierte la fecha que devuelve el back (ISO con hora) en "YYYY-MM-DD".
 * Sumar 12 horas antes de cortar evita que la zona horaria del servidor
 * o del navegador corra la fecha un día.
 */
export function toDateInputValue(value) {
  if (value === null || value === undefined || value === '') return '';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';
  return new Date(timestamp + HALF_DAY_MS).toISOString().slice(0, 10);
}

export function formatAdoptionDate(value) {
  const day = toDateInputValue(value);
  if (!day) return '—';
  const [year, month, dayOfMonth] = day.split('-');
  return `${dayOfMonth} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatPetOption(pet) {
  return [pet.name, formatPetType(pet)].filter(Boolean).join(' · ');
}
