import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ShelterForm from '../components/ShelterForm';
import useShelters from '../hooks/useShelters';
import { createShelter } from '../services/shelterService';
import { buildShelterPayload, EMPTY_SHELTER_FORM } from '../services/shelterMapper';

export default function ShelterCreatePage() {
  const navigate = useNavigate();
  const { shelters, loading, error } = useShelters();

  const handleSubmit = async (values) => {
    await createShelter(buildShelterPayload(values));
    await navigate('/refugios', { state: { message: 'Refugio registrado correctamente.' } });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/refugios">Refugios</Link> / Registrar refugio
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar refugio</h1>
          <p className="page-subtitle">Nombre y ciudad son obligatorios.</p>
        </div>
      </div>

      {loading && <Loader label="Cargando refugios..." />}
      {!loading && error && <AlertMessage>{error}</AlertMessage>}
      {!loading && !error && (
        <ShelterForm
          initialValues={EMPTY_SHELTER_FORM}
          shelters={shelters}
          submitLabel="Registrar refugio"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}