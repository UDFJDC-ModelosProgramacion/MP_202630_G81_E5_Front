import { formatAge, formatPetType } from './formatters';

/** Día local de hoy como "YYYY-MM-DD", el formato del campo de fecha. */
export function getTodayDay(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** "Perro · Criollo · 3 años", como en el resumen de la adopción. */
export function formatPetSummary(pet) {
  if (!pet) return '';
  const type = formatPetType(pet);
  const age = Number.isInteger(pet.age) ? formatAge(pet.age) : '';
  return [type, age].filter(Boolean).join(' · ');
}
