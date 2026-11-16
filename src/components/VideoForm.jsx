import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getVideoErrorMessage } from '../utils/videoMessages';
import { validateVideo } from '../utils/videoValidation';

export default function VideoForm({
  initialValues,
  submitLabel,
  focusOnMount,
  shelterId,
  shelterOptions,
  shelterLocked,
  onShelterChange,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (focusOnMount) document.getElementById('url')?.focus();
  }, [focusOnMount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleShelterChange = async (event) => {
    await onShelterChange(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateVideo(values);
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
      setServerError(getVideoErrorMessage(error));
    }
    setSubmitting(false);
  };

  return (
    <form className="video-form" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="video-shelter" label="Refugio">
        <select
          id="video-shelter"
          className="form-control-brand"
          value={String(shelterId)}
          disabled={shelterLocked}
          onChange={handleShelterChange}
        >
          {shelterOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="url" label="URL del video" error={errors.url}>
        <input
          id="url"
          name="url"
          type="text"
          placeholder="https://..."
          value={values.url}
          onChange={handleChange}
          className={`form-control-brand${errors.url ? ' form-control-brand--invalid' : ''}`}
          aria-invalid={errors.url ? 'true' : undefined}
          aria-describedby={errors.url ? 'url-error' : undefined}
        />
      </FormField>

      <div className="video-form__actions">
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-outline-brand" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}