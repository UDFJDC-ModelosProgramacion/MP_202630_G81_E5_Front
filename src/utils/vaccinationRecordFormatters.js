import { toDateInputValue } from './adoptionFormatters';

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function parseVaccines(value) {
  return String(value ?? '')
    .split(',')
    .map((vaccine) => vaccine.trim())
    .filter(Boolean);
}

export function formatVaccinationDate(value) {
  const day = toDateInputValue(value);
  if (!day) return '—';
  const [year, month, dayOfMonth] = day.split('-');
  return `${Number(dayOfMonth)} de ${MONTHS[Number(month) - 1]} de ${year}`;
}