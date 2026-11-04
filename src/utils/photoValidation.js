export function validatePhoto(values) {
  const errors = {};

  if (!String(values.target ?? '').trim()) {
    errors.target = 'La foto debe asociarse a una mascota o a un refugio.';
  }
  if (!values.url?.trim()) {
    errors.url = 'La URL es obligatoria.';
  }

  return errors;
}