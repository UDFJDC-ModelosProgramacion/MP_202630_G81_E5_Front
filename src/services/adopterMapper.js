// Campos que el formulario no toca pero el PUT necesita para no perderlos
const PRESERVED_FIELDS = ['id', 'address'];

export const EMPTY_ADOPTER_FORM = { name: '', email: '', phone: '' };

export function adopterToFormValues(adopter) {
return {
    name: adopter.name ?? '',
    email: adopter.email ?? '',
    phone: adopter.phone ?? '',
};
}

export function buildAdopterPayload(form, existingAdopter = {}) {
const preserved = Object.fromEntries(
    PRESERVED_FIELDS.filter((field) => existingAdopter[field] !== undefined).map(
    (field) => [field, existingAdopter[field]],
    ),
);

return {
    ...preserved,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || null,
};
}