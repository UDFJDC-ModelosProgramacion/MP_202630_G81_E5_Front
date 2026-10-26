import { useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getStatusErrorMessage } from '../utils/adoptionMessages';
import {
  ADOPTION_STATUS_OPTIONS,
  getAdoptionStatusLabel,
  isValidAdoptionStatus,
} from '../utils/adoptionOptions';

export default function AdoptionStatusForm({ currentStatus, onSave }) {
  const [status, setStatus] = useState(isValidAdoptionStatus(currentStatus) ? currentStatus : '');
  const [fieldError, setFieldError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setStatus(event.target.value);
    setFieldError(null);
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!isValidAdoptionStatus(status)) {
      setFieldError('El estado no es válido.');
      document.getElementById('adoption-new-status')?.focus();
      return;
    }

    setSaving(true);
    try {
      await onSave(status);
      setFeedback({
        type: 'success',
        message: `Estado actualizado a «${getAdoptionStatusLabel(status)}».`,
      });
    } catch (error) {
      setFeedback({ type: 'error', message: getStatusErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {feedback && <AlertMessage variant={feedback.type}>{feedback.message}</AlertMessage>}
      <div className="adoption-status-form">
        <FormField id="adoption-new-status" label="Cambiar estado" error={fieldError}>
          <select
            id="adoption-new-status"
            className={`form-control-brand${fieldError ? ' form-control-brand--invalid' : ''}`}
            value={status}
            onChange={handleChange}
            aria-invalid={fieldError ? 'true' : undefined}
            aria-describedby={fieldError ? 'adoption-new-status-error' : undefined}
          >
            {!isValidAdoptionStatus(status) && <option value="">Selecciona un estado</option>}
            {ADOPTION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <button
          type="submit"
          className="btn-brand adoption-status-form__submit"
          disabled={saving || status === currentStatus}
        >
          {saving ? 'Guardando...' : 'Guardar estado'}
        </button>
      </div>
    </form>
  );
}
