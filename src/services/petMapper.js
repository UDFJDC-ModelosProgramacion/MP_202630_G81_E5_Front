const PRESERVED_FIELDS = ['id', 'sex', 'size', 'temperament', 'specialNeeds'];

export const EMPTY_PET_FORM = { shelterId: '', name: '', species: '', breed: '', age: '' };

export function petToFormValues(pet) {
  return {
    shelterId: String(pet.shelter?.id ?? ''),
    name: pet.name ?? '',
    species: pet.species ?? '',
    breed: pet.breed ?? '',
    age: String(pet.age ?? ''),
  };
}

export function buildPetPayload(form, existingPet = {}) {
  const preserved = Object.fromEntries(
    PRESERVED_FIELDS.filter((field) => existingPet[field] !== undefined).map(
      (field) => [field, existingPet[field]],
    ),
  );

  return {
    ...preserved,
    name: form.name.trim(),
    species: form.species.trim(),
    breed: form.breed?.trim() || null,
    age: Number(form.age),
    available: existingPet.available ?? true,
    shelter: { id: Number(form.shelterId) },
  };
}