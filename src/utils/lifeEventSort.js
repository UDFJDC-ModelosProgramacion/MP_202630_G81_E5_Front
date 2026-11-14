import { toDateInputValue } from './adoptionFormatters';

// Más recientes primero; con la misma fecha, el último registrado primero.
export function sortLifeEventsByDate(events) {
  return [...events].sort((a, b) => {
    const byDate = toDateInputValue(b.date).localeCompare(toDateInputValue(a.date));
    return byDate !== 0 ? byDate : b.id - a.id;
  });
}