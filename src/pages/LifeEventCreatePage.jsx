import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import LifeEventBreadcrumb from '../components/LifeEventBreadcrumb';
import LifeEventForm from '../components/LifeEventForm';
import Loader from '../components/Loader';
import usePet from '../hooks/usePet';
import useVeterinarians from '../hooks/useVeterinarians';
import { buildLifeEventPayload, EMPTY_LIFE_EVENT_FORM } from '../services/lifeEventMapper';
import { createLifeEvent } from '../services/lifeEventService';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

export default function LifeEventCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const petState = usePet(id);
  const vetsState = useVeterinarians();
  const { pet } = petState;
  const loading = petState.loading || vetsState.loading;

  const handleSubmit = async (values) => {
    await createLifeEvent(pet.id, buildLifeEventPayload(values));
    await navigate(`/mascotas/${pet.id}/eventos-de-vida`, {
      state: { message: 'Evento registrado correctamente.' },
    });
  };

  return (
    <section className="narrow-page">
      <LifeEventBreadcrumb pet={pet} current="Registrar" />

      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar evento</h1>
          <p className="page-subtitle">Tipo y fecha son obligatorios. El veterinario es opcional.</p>
        </div>
      </div>

      {loading && <Loader label="Cargando datos..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}

      {!loading && pet && (
        <>
          {vetsState.error && <AlertMessage>{vetsState.error}</AlertMessage>}
          <LifeEventForm
            pet={pet}
            initialValues={EMPTY_LIFE_EVENT_FORM}
            veterinarians={vetsState.veterinarians}
            submitLabel="Registrar evento"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </section>
  );
}