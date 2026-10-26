import { toDateInputValue } from '../utils/adoptionFormatters';
import { DEFAULT_ADOPTION_STATUS } from '../utils/adoptionOptions';

export const EMPTY_ADOPTION_FORM = {
  petId: '',
  adopterId: '',
  veterinarianId: '',
  date: '',
  status: DEFAULT_ADOPTION_STATUS,
};

const toApiDate = (day) => (day ? `${day}T12:00:00.000Z` : null);

export function buildAdoptionPayload(form) {
  const payload = {
    date: toApiDate(form.date),
    pet: { id: Number(form.petId) },
    adopter: { id: Number(form.adopterId) },
    responsibleVeterinarian: { id: Number(form.veterinarianId) },
  };
  if (form.status) payload.status = form.status;
  return payload;
}

// El PUT del back toma fecha y estado del cuerpo: se reenvía la fecha actual para no perderla.
export function buildStatusPayload(adoption, status) {
  return { date: toApiDate(toDateInputValue(adoption.date)), status };
}
