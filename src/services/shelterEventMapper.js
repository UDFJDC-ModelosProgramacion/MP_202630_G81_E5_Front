import { toDateInputValue } from '../utils/adoptionFormatters';

export const EMPTY_EVENT_FORM = { title: '', date: '', type: '' };

const toApiDate = (day) => (day ? `${day}T12:00:00.000Z` : null);

export function eventToFormValues(event) {
  return {
    title: event.title ?? '',
    date: toDateInputValue(event.date),
    type: event.type ?? '',
  };
}

export function buildEventPayload(form) {
  const type = form.type.trim();
  return {
    title: form.title.trim(),
    date: toApiDate(form.date),
    type: type || null,
  };
}