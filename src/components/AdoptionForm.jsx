import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { formatPetOption } from '../utils/adoptionFormatters';
import {
  PET_UNAVAILABLE_MESSAGE,
  getCreateErrorMessage,
  isPetUnavailableError,
} from '../utils/adoptionMessages';
import { ADOPTION_STATUS_OPTIONS } from '../utils/adoptionOptions';
import { validateAdoption } from '../utils/adoptionValidation';

const renderOptions = (items, getLabel) =>
  items.map((item) => (
    <option key={item.id} value={item.id}>
      {getLabel(item)}
    </option>
  ));

export default function AdoptionForm({
  initialValues,
  pets,
  adopters,
  veterinarians,
  submitLabel,
  onSubmit,
}) {
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

    const validationErrors = validateAdoption(values, pets);
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
      if (isPetUnavailableError(error)) {
        setErrors({ petId: PET_UNAVAILABLE_MESSAGE });
        focusField('petId');
      } else {
        setServerError(getCreateErrorMessage(error));
      }
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

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="petId" label="Mascota" error={errors.petId}>
        <select {...controlProps('petId')}>
          <option value="">Selecciona una mascota</option>
          {renderOptions(pets, formatPetOption)}
        </select>
      </FormField>

      <FormField id="adopterId" label="Adoptante" error={errors.adopterId}>
        <select {...controlProps('adopterId')}>
          <option value="">Selecciona un adoptante</option>
          {renderOptions(adopters, (adopter) => adopter.name)}
        </select>
      </FormField>

      <FormField id="veterinarianId" label="Veterinario responsable" error={errors.veterinarianId}>
        <select {...controlProps('veterinarianId')}>
          <option value="">Selecciona un veterinario</option>
          {renderOptions(veterinarians, (veterinarian) => veterinarian.name)}
        </select>
      </FormField>

      <div className="adoption-form__row">
        <FormField id="date" label="Fecha de adopción" error={errors.date}>
          <input type="date" {...controlProps('date')} />
        </FormField>

        <FormField id="status" label="Estado" optional error={errors.status}>
          <select
            {...controlProps('status')}
            aria-describedby={errors.status ? 'status-error' : 'status-hint'}
          >
            {ADOPTION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id="status-hint" className="adoption-form__hint">
            Si no eliges un estado, se guarda como «En curso».
          </p>
        </FormField>
      </div>

      <div className="form-actions">
        <Link to="/adopciones" className="btn-outline-brand">
          Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
