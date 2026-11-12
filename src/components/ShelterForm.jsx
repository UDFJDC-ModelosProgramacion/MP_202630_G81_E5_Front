import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { DUPLICATE_SHELTER_MESSAGE, getSaveErrorMessage } from '../utils/shelterMessages';
import { isDuplicateShelter, validateShelter } from '../utils/shelterValidation';

export default function ShelterForm({
  initialValues,
  shelters = [],
  ignoreId = null,
  submitLabel,
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [duplicate, setDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setDuplicate(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setDuplicate(false);

    const validationErrors = validateShelter(values);
    setErrors(validationErrors);
    const firstInvalid = Object.keys(validationErrors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    if (isDuplicateShelter(shelters, values, ignoreId)) {
      setDuplicate(true);
      setFormError(DUPLICATE_SHELTER_MESSAGE);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(getSaveErrorMessage(error));
      setSubmitting(false);
    }
  };

  const controlProps = (name) => {
    const invalid = Boolean(errors[name]) || duplicate;
    return {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      className: `form-control-brand${invalid ? ' form-control-brand--invalid' : ''}`,
      'aria-invalid': invalid ? 'true' : undefined,
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    };
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {formError && <AlertMessage>{formError}</AlertMessage>}

      <FormField id="name" label="Nombre" error={errors.name}>
        <input type="text" placeholder="Ej. Huellitas del Sur" {...controlProps('name')} />
      </FormField>

      <FormField id="city" label="Ciudad" error={errors.city}>
        <input type="text" placeholder="Ej. Bogotá" {...controlProps('city')} />
        <p className="adoption-form__hint">
          Puedes repetir el nombre solo si el refugio está en otra ciudad.
        </p>
      </FormField>

      <div className="form-actions">
        <Link to="/refugios" className="btn-outline-brand">
          Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}