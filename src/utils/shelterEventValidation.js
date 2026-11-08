export function validateShelterEvent(values) {
  const errors = {};

  if (!values.title?.trim()) {
    errors.title = 'El nombre es obligatorio.';
  }
  if (!values.date) {
    errors.date = 'La fecha es obligatoria.';
  }

  return errors;
}