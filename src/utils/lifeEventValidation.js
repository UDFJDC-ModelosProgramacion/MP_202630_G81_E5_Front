export function validateLifeEvent(values) {
  const errors = {};

  if (!values.type?.trim()) {
    errors.type = 'El tipo es obligatorio.';
  }
  if (!values.date?.trim()) {
    errors.date = 'La fecha es obligatoria.';
  }

  return errors;
}