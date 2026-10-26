import { Link, useNavigate } from 'react-router-dom';
import AdoptionForm from '../components/AdoptionForm';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdoptionOptions from '../hooks/useAdoptionOptions';
import { buildAdoptionPayload, EMPTY_ADOPTION_FORM } from '../services/adoptionMapper';
import { createAdoption } from '../services/adoptionService';
import { getMissingDataMessage } from '../utils/adoptionMessages';

export default function AdoptionCreatePage() {
  const navigate = useNavigate();
  const { pets, adopters, veterinarians, loading, error } = useAdoptionOptions();
  const missingMessage =
    loading || error ? null : getMissingDataMessage({ pets, adopters, veterinarians });

  const handleSubmit = async (values) => {
    await createAdoption(buildAdoptionPayload(values));
    await navigate('/adopciones', { state: { message: 'Adopción registrada correctamente.' } });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/adopciones">Adopciones</Link> / Registrar adopción
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar adopción</h1>
          <p className="page-subtitle">Todos los campos son obligatorios, excepto el estado.</p>
        </div>
      </div>

      {loading && <Loader label="Cargando datos..." />}
      {!loading && error && <AlertMessage>{error}</AlertMessage>}
      {missingMessage && <AlertMessage>{missingMessage}</AlertMessage>}
      {!loading && !error && !missingMessage && (
        <AdoptionForm
          initialValues={EMPTY_ADOPTION_FORM}
          pets={pets}
          adopters={adopters}
          veterinarians={veterinarians}
          submitLabel="Registrar adopción"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
