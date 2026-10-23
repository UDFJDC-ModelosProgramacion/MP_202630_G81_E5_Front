import { Link, useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PetForm from '../components/PetForm';
import usePet from '../hooks/usePet';
import { updatePet } from '../services/petService';
import { buildPetPayload, petToFormValues } from '../services/petMapper';

export default function PetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pet, loading, error, notFound } = usePet(id);

  const handleSubmit = async (values) => {
    await updatePet(pet.id, buildPetPayload(values, pet));
    await navigate('/mascotas', { state: { message: 'Cambios guardados correctamente.' } });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/mascotas">Mascotas</Link> / Editar mascota
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Editar mascota</h1>
          <p className="page-subtitle">
            Actualiza los datos de la mascota. El refugio no se puede cambiar.
          </p>
        </div>
      </div>

      {loading && <Loader label="Cargando mascota..." />}
      {!loading && error && (
        <AlertMessage>{notFound ? 'Mascota no encontrada.' : error}</AlertMessage>
      )}
      {pet && (
        <PetForm
          initialValues={petToFormValues(pet)}
          shelters={pet.shelter ? [pet.shelter] : []}
          shelterLocked
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}