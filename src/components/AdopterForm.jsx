import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import {
DUPLICATE_ADOPTER_EMAIL_MESSAGE,
getAdopterSaveErrorMessage,
isDuplicateEmailError,
} from '../utils/adopterMessages';
import { validateAdopter } from '../utils/adopterValidation';

export default function AdopterForm({ initialValues, submitLabel, cancelTo, onSubmit }) {
const [values, setValues] = useState(initialValues);
const [errors, setErrors] = useState({});
const [formError, setFormError] = useState(null);
const [submitting, setSubmitting] = useState(false);

const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
};

  // El back es quien sabe si el correo ya existe: lo mostramos bajo el campo
const showSaveError = (error) => {
    if (isDuplicateEmailError(error)) {
    setErrors({ email: DUPLICATE_ADOPTER_EMAIL_MESSAGE });
    document.getElementById('email')?.focus();
    return;
    }
    setFormError(getAdopterSaveErrorMessage(error));
};

const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateAdopter(values);
    setErrors(validationErrors);
    const firstInvalid = Object.keys(validationErrors)[0];
    if (firstInvalid) {
    document.getElementById(firstInvalid)?.focus();
    return;
    }

    setSubmitting(true);
    try {
    await onSubmit(values);
    } catch (error) {
    showSaveError(error);
    setSubmitting(false);
    }
};

const controlProps = (name) => {
    const invalid = Boolean(errors[name]);
    return {
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    className: `form-control-brand${invalid ? ' form-control-brand--invalid' : ''}`,
    'aria-invalid': invalid ? 'true' : undefined,
    'aria-describedby': invalid ? `${name}-error` : undefined,
    };
};

return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
    <h2 className="adopter-card__title">Datos del adoptante</h2>

    {formError && <AlertMessage>{formError}</AlertMessage>}

    <FormField id="name" label="Nombre" error={errors.name}>
        <input type="text" autoComplete="name" {...controlProps('name')} />
    </FormField>

    <FormField id="email" label="Correo electrónico" error={errors.email}>
        <input type="email" autoComplete="email" {...controlProps('email')} />
    </FormField>

    <FormField id="phone" label="Teléfono" optional>
        <input type="tel" autoComplete="tel" {...controlProps('phone')} />
    </FormField>

    <div className="form-actions">
        <Link to={cancelTo} className="btn-outline-brand">
        Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
        {submitting ? 'Guardando...' : submitLabel}
        </button>
    </div>
    </form>
);
}
