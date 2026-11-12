import { toDateInputValue } from './adoptionFormatters';
import { PET_UNAVAILABLE_MESSAGE } from './adoptionMessages';
import { isValidAdoptionStatus } from './adoptionOptions';

const isBlank = (value) => !String(value ?? '').trim();

function validatePet(values, pets) {
  if (isBlank(values.petId)) return 'Selecciona una mascota.';
  const pet = pets.find((item) => String(item.id) === String(values.petId));
  return pet?.available === false ? PET_UNAVAILABLE_MESSAGE : undefined;
}

function validateDate(date) {
  if (isBlank(date)) return 'La fecha de adopción es obligatoria.';
  return toDateInputValue(date) === date ? undefined : 'La fecha de adopción no es válida.';
}

export function validateAdoption(values, pets = []) {
  const candidates = {
    petId: validatePet(values, pets),
    adopterId: isBlank(values.adopterId) ? 'Selecciona un adoptante.' : undefined,
    veterinarianId: isBlank(values.veterinarianId)
      ? 'Selecciona un veterinario responsable.'
      : undefined,
    date: validateDate(values.date),
    status:
      values.status && !isValidAdoptionStatus(values.status)
        ? 'El estado no es válido.'
        : undefined,
  };

  return Object.fromEntries(Object.entries(candidates).filter(([, message]) => message));
}
