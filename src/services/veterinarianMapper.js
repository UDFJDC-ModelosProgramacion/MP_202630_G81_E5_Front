export const EMPTY_VETERINARIAN_FORM = {
  shelterId: '',
  name: '',
  email: '',
  phone: '',
  specialty: '',
  availability: '',
};

export function veterinarianToFormValues(veterinarian) {
  return {
    shelterId: String(veterinarian.shelter?.id ?? ''),
    name: veterinarian.name ?? '',
    email: veterinarian.email ?? '',
    phone: veterinarian.phone ?? '',
    specialty: veterinarian.specialty ?? '',
    availability: veterinarian.availability ?? '',
  };
}

export function buildVeterinarianPayload(form, existingVeterinarian = {}) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || null,
    specialty: form.specialty.trim(),
    availability: form.availability?.trim() || null,
  };

  if (existingVeterinarian.id !== undefined) {
    payload.id = existingVeterinarian.id;
  }

  const shelterId = String(form.shelterId ?? '').trim();
  if (shelterId) {
    payload.shelter = { id: Number(shelterId) };
  }

  return payload;
}