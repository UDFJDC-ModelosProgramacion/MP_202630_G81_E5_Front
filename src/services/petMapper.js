const PRESERVED_FIELDS = ['id', 'sex', 'size', 'temperament', 'specialNeeds'];

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