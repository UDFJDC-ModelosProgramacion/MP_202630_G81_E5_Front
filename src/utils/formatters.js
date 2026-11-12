export function formatAge(age) {
  return `${age} ${age === 1 ? 'año' : 'años'}`;
}

export function formatPetType(pet) {
  return [pet.species, pet.breed].filter(Boolean).join(' · ');
}

export function displayValue(value) {
  return value === null || value === undefined || value === '' ? '—' : value;
}