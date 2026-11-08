import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getEventErrorMessage } from '../utils/shelterEventMessages';
import { validateShelterEvent } from '../utils/shelterEventValidation';

export default function ShelterEventForm({
  initialValues,
  submitLabel,
  focusOnMount,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (focusOnMount) document.getElementById('title')?.focus();
  }, [focusOnMount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateShelterEvent(values);
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
      setServerError(getEventErrorMessage(error));
    }
    setSubmitting(false);
  };

  const controlProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    className: `form-control-brand${errors[name] ? ' form-control-brand--invalid' : ''}`,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="title" label="Nombre" error={errors.title}>
        <input type="text" placeholder="Ej. Jornada de adopción" {...controlProps('title')} />
      </FormField>

      <FormField id="date" label="Fecha" error={errors.date}>
        <input type="date" {...controlProps('date')} />
      </FormField>

      <FormField id="type" label="Tipo" optional error={errors.type}>
        <input type="text" placeholder="Ej. Jornada, feria, vacunación" {...controlProps('type')} />
      </FormField>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-outline-brand" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}