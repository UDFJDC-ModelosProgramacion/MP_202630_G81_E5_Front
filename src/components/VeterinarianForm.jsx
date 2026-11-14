import { Link } from 'react-router-dom';
import useEntityForm from '../hooks/useEntityForm';
import { getErrorMessage } from '../services/apiError';
import { validateVeterinarian } from '../utils/veterinarianValidation';
import AlertMessage from './AlertMessage';
import FormField from './FormField';

export default function VeterinarianForm({
  initialValues,
  shelters,
  submitLabel,
  onSubmit,
  shelterLocked = false,
}) {
  const { errors, serverError, submitting, handleSubmit, controlProps } = useEntityForm({
    initialValues,
    validate: validateVeterinarian,
    onSubmit,
    getErrorMessage,
  });

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <FormField id="shelterId" label="Refugio" optional>
        <select {...controlProps('shelterId')} disabled={shelterLocked}>
          <option value="">Sin refugio</option>
          {shelters.map((shelter) => (
            <option key={shelter.id} value={shelter.id}>
              {shelter.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="name" label="Nombre" error={errors.name}>
        <input type="text" placeholder="Ej. Laura Martínez" {...controlProps('name')} />
      </FormField>

      <FormField id="email" label="Correo" error={errors.email}>
        <input type="email" placeholder="Ej. laura@refugio.org" {...controlProps('email')} />
      </FormField>

      <FormField id="phone" label="Teléfono" optional>
        <input type="tel" placeholder="Ej. 3105551234" {...controlProps('phone')} />
      </FormField>

      <FormField id="specialty" label="Especialidad" error={errors.specialty}>
        <input type="text" placeholder="Ej. Medicina interna" {...controlProps('specialty')} />
      </FormField>

      <FormField id="availability" label="Disponibilidad" optional>
        <input
          type="text"
          placeholder="Ej. Lunes a viernes 8:00–14:00"
          {...controlProps('availability')}
        />
      </FormField>

      <div className="form-actions">
        <Link to="/veterinarios" className="btn-outline-brand">
          Cancelar
        </Link>
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}