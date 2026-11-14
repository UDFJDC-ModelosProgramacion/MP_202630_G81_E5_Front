import { Link } from 'react-router-dom';
import useEntityForm from '../hooks/useEntityForm';
import { getVaccinationRecordErrorMessage } from '../utils/vaccinationRecordMessages';
import { validateVaccinationRecord } from '../utils/vaccinationRecordValidation';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import LockedPetField from './LockedPetField';

export default function VaccinationRecordForm({ pet, initialValues, submitLabel, onSubmit }) {
  const { errors, serverError, submitting, handleSubmit, controlProps } = useEntityForm({
    initialValues,
    validate: validateVaccinationRecord,
    onSubmit,
    getErrorMessage: getVaccinationRecordErrorMessage,
  });

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <LockedPetField pet={pet} />

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