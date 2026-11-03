import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { parseTargetValue } from '../services/photoMapper';
import { getPhotoErrorMessage } from '../utils/photoMessages';
import { validatePhoto } from '../utils/photoValidation';

export default function PhotoForm({ initialValues, targets, isEditing = false, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) document.getElementById('url')?.focus();
  }, [isEditing]);

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

    const validationErrors = validatePhoto(values);
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
      setServerError(getPhotoErrorMessage(error, parseTargetValue(values.target)?.owner));
    } finally {
      setSubmitting(false);
    }
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

  const submitLabel = isEditing ? 'Guardar cambios' : 'Agregar foto';

  return (
    <form
      className="form-card photo-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="photo-form-title"
    >
      <h2 id="photo-form-title" className="photo-form__title">
        {isEditing ? 'Editar foto' : 'Agregar foto'}
      </h2>

      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="target" label="Asociar a" error={errors.target}>
        <select {...controlProps('target')} disabled={isEditing}>
          <option value="">Selecciona un destino</option>
          {targets.map((target) => (
            <option key={target.value} value={target.value}>
              {target.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="url" label="URL de la foto" error={errors.url}>
        <input type="text" inputMode="url" placeholder="https://..." {...controlProps('url')} />
      </FormField>

      <div className="photo-form__actions">
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {isEditing && (
          <button type="button" className="btn-outline-brand" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}