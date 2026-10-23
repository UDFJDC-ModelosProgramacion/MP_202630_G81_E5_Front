import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PetForm from '../components/PetForm';
import useShelters from '../hooks/useShelters';
import { createPet } from '../services/petService';
import { buildPetPayload, EMPTY_PET_FORM } from '../services/petMapper';

export default function PetCreatePage() {
  const navigate = useNavigate();
  const { shelters, loading, error } = useShelters();

  const initialValues = {
    ...EMPTY_PET_FORM,
    shelterId: shelters.length === 1 ? String(shelters[0].id) : '',
  };

  const handleSubmit = async (values) => {
    await createPet(buildPetPayload(values));
    navigate('/mascotas', { state: { message: 'Mascota registrada correctamente.' } });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/mascotas">Mascotas</Link> / Registrar mascota
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar mascota</h1>
          <p className="page-subtitle">
            Nombre y especie son obligatorios. La mascota queda disponible para adopción.
          </p>
        </div>
      </div>

      {loading && <Loader label="Cargando refugios..." />}
      {!loading && error && <AlertMessage>{error}</AlertMessage>}
      {!loading && !error && shelters.length === 0 && (
        <AlertMessage>
          No hay refugios registrados. Registra un refugio antes de crear mascotas.
        </AlertMessage>
      )}
      {!loading && !error && shelters.length > 0 && (
        <PetForm
          initialValues={initialValues}
          shelters={shelters}
          submitLabel="Registrar mascota"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}