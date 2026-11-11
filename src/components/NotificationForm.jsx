import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getNotificationErrorMessage } from '../utils/notificationMessages';
import { NOTIFICATION_CHANNELS } from '../utils/notificationOptions';
import { validateNotification } from '../utils/notificationValidation';

export default function NotificationForm({
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
    if (focusOnMount) document.getElementById('message')?.focus();
  }, [focusOnMount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateNotification(values);
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
      setServerError(getNotificationErrorMessage(error));
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
    <form className="notification-form" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="channel" label="Canal" error={errors.channel}>
        <select {...controlProps('channel')}>
          {NOTIFICATION_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="message" label="Mensaje" error={errors.message}>
        <textarea rows={4} placeholder="Escribe el mensaje para los usuarios" {...controlProps('message')} />
      </FormField>

      <div className="form-actions">
        <button type="button" className="btn-outline-brand" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}