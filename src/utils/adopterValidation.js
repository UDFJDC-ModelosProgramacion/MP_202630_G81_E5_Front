export function validateAdopter(values) {
const errors = {};

    if (!values.name?.trim()) {
    errors.name = 'El nombre es obligatorio.';
}
    if (!values.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
}

return errors;
}