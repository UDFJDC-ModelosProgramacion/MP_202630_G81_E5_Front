import { Link, useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VeterinarianForm from '../components/VeterinarianForm';
import useVeterinarian from '../hooks/useVeterinarian';
import {
  buildVeterinarianPayload,
  veterinarianToFormValues,
} from '../services/veterinarianMapper';
import { updateVeterinarian } from '../services/veterinarianService';
import { VETERINARIAN_NOT_FOUND_MESSAGE } from '../utils/veterinarianMessages';

export default function VeterinarianEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { veterinarian, loading, error, notFound } = useVeterinarian(id);

  const handleSubmit = async (values) => {
    await updateVeterinarian(veterinarian.id, buildVeterinarianPayload(values, veterinarian));
    await navigate('/veterinarios', { state: { message: 'Cambios guardados correctamente.' } });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/veterinarios">Veterinarios</Link> / Editar veterinario
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Editar veterinario</h1>
          <p className="page-subtitle">
            Actualiza los datos del veterinario. El refugio no se puede cambiar.
          </p>
        </div>
      </div>

      {loading && <Loader label="Cargando veterinario..." />}
      {!loading && error && (
        <AlertMessage>{notFound ? VETERINARIAN_NOT_FOUND_MESSAGE : error}</AlertMessage>
      )}
      {veterinarian && (
        <VeterinarianForm
          initialValues={veterinarianToFormValues(veterinarian)}
          shelters={veterinarian.shelter ? [veterinarian.shelter] : []}
          shelterLocked
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}