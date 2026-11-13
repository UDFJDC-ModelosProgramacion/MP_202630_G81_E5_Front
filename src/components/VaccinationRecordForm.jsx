import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import { getVaccinationRecordErrorMessage } from '../utils/vaccinationRecordMessages';
import { validateVaccinationRecord } from '../utils/vaccinationRecordValidation';

export default function VaccinationRecordForm({ pet, initialValues, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const petSummary = [pet.name, pet.species].filter(Boolean).join(' · ');

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

    const validationErrors = validateVaccinationRecord(values);
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
      setServerError(getVaccinationRecordErrorMessage(error));
      setSubmitting(false);
    }
  };

  const controlProps = (name, extraClass = '') => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    className: `form-control-brand${extraClass}${errors[name] ? ' form-control-brand--invalid' : ''}`,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="petId" label="Mascota">
        <select id="petId" className="form-control-brand" value={pet.id} disabled>
          <option value={pet.id}>{petSummary}</option>
        </select>
      </FormField>

      <FormField id="vaccinesApplied" label="Vacunas aplicadas" error={errors.vaccinesApplied}>
        <textarea
          rows={4}
          placeholder="Ej. Rabia, Parvovirus, Moquillo"
          {...controlProps('vaccinesApplied', ' vaccination-form__vaccines')}
        />
      </FormField>

      <FormField id="nextDueDate" label="Próxima fecha de vacunación" optional>
        <input type="date" {...controlProps('nextDueDate')} />
      </FormField>

      <div className="form-actions">
        <Link to={`/mascotas/${pet.id}/carnet`} className="btn-outline-brand">
          Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}