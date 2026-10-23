export function validatePet(values) {
  const errors = {};

  if (!String(values.shelterId ?? '').trim()) {
    errors.shelterId = 'Selecciona un refugio.';
  }
  if (!values.name?.trim()) {
    errors.name = 'El nombre es obligatorio.';
  }
  if (!values.species?.trim()) {
    errors.species = 'La especie es obligatoria.';
  }

  const age = String(values.age ?? '').trim();
  if (age === '') {
    errors.age = 'La edad es obligatoria.';
  } else if (!Number.isInteger(Number(age))) {
    errors.age = 'La edad debe ser un número entero.';
  } else if (Number(age) < 0) {
    errors.age = 'La edad no puede ser negativa. Usa 0 o más.';
  }

  return errors;
}