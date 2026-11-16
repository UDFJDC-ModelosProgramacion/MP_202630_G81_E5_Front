export function validateVeterinarian(values) {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'El nombre es obligatorio.';
  }
  if (!values.email?.trim()) {
    errors.email = 'El correo es obligatorio.';
  }
  if (!values.specialty?.trim()) {
    errors.specialty = 'La especialidad es obligatoria.';
  }

  return errors;
}