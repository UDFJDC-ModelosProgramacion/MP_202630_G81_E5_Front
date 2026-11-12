export function validateShelter(values) {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'El nombre es obligatorio.';
  }
  if (!values.city?.trim()) {
    errors.city = 'La ciudad es obligatoria.';
  }

  return errors;
}

function normalize(text) {
  return String(text ?? '').trim().toLowerCase();
}

export function isDuplicateShelter(shelters, values, ignoreId = null) {
  return shelters.some(
    (shelter) =>
      String(shelter.id) !== String(ignoreId) &&
      normalize(shelter.name) === normalize(values.name) &&
      normalize(shelter.city) === normalize(values.city),
  );
}