import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getErrorMessage } from '../services/apiError';
import { SPECIES_OPTIONS } from '../utils/petOptions';
import { validatePet } from '../utils/petValidation';

export default function PetForm({
  initialValues,
  shelters,
  submitLabel,
  onSubmit,
  shelterLocked = false,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const speciesOptions =
    !initialValues.species || SPECIES_OPTIONS.includes(initialValues.species)
      ? SPECIES_OPTIONS
      : [...SPECIES_OPTIONS, initialValues.species];

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

    const validationErrors = validatePet(values);
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
      setServerError(getErrorMessage(error));
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

      <FormField id="shelterId" label="Refugio" error={errors.shelterId}>
        <select {...controlProps('shelterId')} disabled={shelterLocked}>
          <option value="">Selecciona un refugio</option>
          {shelters.map((shelter) => (
            <option key={shelter.id} value={shelter.id}>
              {shelter.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="name" label="Nombre" error={errors.name}>
        <input type="text" placeholder="Ej. Luna" {...controlProps('name')} />
      </FormField>

      <FormField id="species" label="Especie" error={errors.species}>
        <select {...controlProps('species')}>
          <option value="">Selecciona una especie</option>
          {speciesOptions.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="breed" label="Raza" optional>
        <input type="text" placeholder="Ej. Labrador" {...controlProps('breed')} />
      </FormField>

      <FormField id="age" label="Edad (años)" error={errors.age}>
        <input type="number" min="0" step="1" placeholder="Ej. 2" {...controlProps('age')} />
      </FormField>

      <div className="form-actions">
        <Link to="/mascotas" className="btn-outline-brand">
          Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}