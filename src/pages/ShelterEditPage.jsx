import { Link, useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ShelterForm from '../components/ShelterForm';
import useShelter from '../hooks/useShelter';
import useShelters from '../hooks/useShelters';
import { updateShelter } from '../services/shelterService';
import { buildShelterPayload, shelterToFormValues } from '../services/shelterMapper';

export default function ShelterEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const current = useShelter(id);
  const all = useShelters();

  const loading = current.loading || all.loading;
  const error = current.error || all.error;

  const handleSubmit = async (values) => {
    await updateShelter(current.shelter.id, buildShelterPayload(values));
    await navigate('/refugios', { state: { message: 'Cambios guardados correctamente.' } });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/refugios">Refugios</Link> / Editar refugio
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Editar refugio</h1>
          <p className="page-subtitle">Nombre y ciudad son obligatorios.</p>
        </div>
      </div>

      {loading && <Loader label="Cargando refugio..." />}
      {!loading && error && (
        <AlertMessage>{current.notFound ? 'Refugio no encontrado.' : error}</AlertMessage>
      )}
      {!loading && !error && current.shelter && (
        <ShelterForm
          initialValues={shelterToFormValues(current.shelter)}
          shelters={all.shelters}
          ignoreId={current.shelter.id}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}