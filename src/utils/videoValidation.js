export function validateVideo(values) {
  const errors = {};

  if (!values.url?.trim()) {
    errors.url = 'La URL es obligatoria.';
  }

  return errors;
}