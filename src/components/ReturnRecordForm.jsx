import { useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getReturnRecordErrorMessage } from '../utils/returnRecordMessages';
import { validateReturnRecord } from '../utils/returnRecordValidation';

export default function ReturnRecordForm({ initialValues, submitLabel, hint, cancel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const focusField = (name) => document.getElementById(name)?.focus();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateReturnRecord(values);
    setErrors(validationErrors);
    const firstInvalid = Object.keys(validationErrors)[0];
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(getReturnRecordErrorMessage(error));
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

  const reasonProps = controlProps('reason');

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="date" label="Fecha de devolución" error={errors.date}>
        <input type="date" {...controlProps('date')} />
      </FormField>

      <FormField id="reason" label="Motivo" error={errors.reason}>
        <textarea
          rows={5}
          placeholder="Cuéntanos por qué se devuelve la mascota"
          {...reasonProps}
          className={`${reasonProps.className} return-form__reason`}
        />
      </FormField>

      {hint && <p className="return-form__hint">{hint}</p>}

      <div className="return-form__actions">
        {cancel}
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
