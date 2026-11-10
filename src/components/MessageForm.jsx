import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getMessageErrorMessage } from '../utils/messageMessages';
import { validateMessage } from '../utils/messageValidation';

export default function MessageForm({
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

  const focusField = (name) => document.getElementById(name)?.focus();

  useEffect(() => {
    if (focusOnMount) document.getElementById('content')?.focus();
  }, [focusOnMount]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateMessage(values);
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
      setServerError(getMessageErrorMessage(error));
    }
    setSubmitting(false);
  };

  return (
    <form className="form-card message-form" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="content" label="Mensaje" error={errors.content}>
        <textarea
          id="content"
          name="content"
          rows={5}
          value={values.content}
          placeholder="Escribe tu mensaje"
          className={`form-control-brand message-form__content${errors.content ? ' form-control-brand--invalid' : ''}`}
          aria-invalid={errors.content ? 'true' : undefined}
          aria-describedby={errors.content ? 'content-error' : undefined}
          onChange={(event) => handleChange('content', event.target.value)}
        />
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