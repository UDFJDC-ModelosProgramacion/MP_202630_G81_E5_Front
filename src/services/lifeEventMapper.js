import { toDateInputValue } from '../utils/adoptionFormatters';

export const EMPTY_LIFE_EVENT_FORM = { type: '', date: '', description: '', veterinarianId: '' };

export function lifeEventToFormValues(lifeEvent) {
  return {
    type: lifeEvent.type ?? '',
    date: toDateInputValue(lifeEvent.date),
    description: lifeEvent.description ?? '',
    veterinarianId: String(lifeEvent.veterinarian?.id ?? ''),
  };
}

export function buildLifeEventPayload(form, existingEvent = {}) {
  const payload = {
    type: form.type.trim(),
    date: form.date.trim(),
    description: form.description?.trim() || null,
  };

  if (existingEvent.id !== undefined) {
    payload.id = existingEvent.id;
  }

  const veterinarianId = String(form.veterinarianId ?? '').trim();
  if (veterinarianId) {
    payload.veterinarian = { id: Number(veterinarianId) };
  }

  return payload;
}