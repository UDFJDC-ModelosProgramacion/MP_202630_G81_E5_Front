export const EMPTY_SHELTER_FORM = { name: '', city: '' };

export function shelterToFormValues(shelter) {
  return {
    name: shelter.name ?? '',
    city: shelter.city ?? '',
  };
}

export function buildShelterPayload(form) {
  return {
    name: form.name.trim(),
    city: form.city.trim(),
  };
}