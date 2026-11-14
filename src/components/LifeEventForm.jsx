import { Link } from 'react-router-dom';
import useEntityForm from '../hooks/useEntityForm';
import { getLifeEventErrorMessage } from '../utils/lifeEventMessages';
import { getLifeEventTypeOptions } from '../utils/lifeEventOptions';
import { validateLifeEvent } from '../utils/lifeEventValidation';
import { formatVeterinarianOption } from '../utils/lifeEventVeterinarians';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import LockedPetField from './LockedPetField';

export default function LifeEventForm({
  pet,
  initialValues,
  veterinarians,
  submitLabel,
  onSubmit,
}) {
  const { errors, serverError, submitting, handleSubmit, controlProps } = useEntityForm({
    initialValues,
    validate: validateLifeEvent,
    onSubmit,
    getErrorMessage: getLifeEventErrorMessage,
  });

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <LockedPetField pet={pet} />

      <FormField id="type" label="Tipo" error={errors.type}>
        <select {...controlProps('type')}>
          <option value="">Selecciona un tipo</option>
          {getLifeEventTypeOptions(initialValues.type).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="date" label="Fecha" error={errors.date}>
        <input type="date" {...controlProps('date')} />
      </FormField>

      <FormField id="description" label="Descripción" optional>
        <textarea
          rows={3}
          placeholder="Ej. Aplicación de la vacuna antirrábica"
          {...controlProps('description', ' life-event-form__description')}
        />
      </FormField>

      <FormField id="veterinarianId" label="Veterinario" optional>
        <select {...controlProps('veterinarianId')}>
          <option value="">Sin veterinario</option>
          {veterinarians.map((veterinarian) => (
            <option key={veterinarian.id} value={veterinarian.id}>
              {formatVeterinarianOption(veterinarian)}
            </option>
          ))}
        </select>
      </FormField>

      <div className="form-actions">
        <Link to={`/mascotas/${pet.id}/eventos-de-vida`} className="btn-outline-brand">
          Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}