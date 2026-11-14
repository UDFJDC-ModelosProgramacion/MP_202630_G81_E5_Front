import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import LifeEventBreadcrumb from '../components/LifeEventBreadcrumb';
import LifeEventForm from '../components/LifeEventForm';
import Loader from '../components/Loader';
import useLifeEvent from '../hooks/useLifeEvent';
import usePet from '../hooks/usePet';
import useVeterinarians from '../hooks/useVeterinarians';
import { buildLifeEventPayload, lifeEventToFormValues } from '../services/lifeEventMapper';
import { updateLifeEvent } from '../services/lifeEventService';
import { withCurrentVeterinarian } from '../utils/lifeEventVeterinarians';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

export default function LifeEventEditPage() {
  const { id, eventId } = useParams();
  const navigate = useNavigate();
  const petState = usePet(id);
  const eventState = useLifeEvent(id, eventId);
  const vetsState = useVeterinarians();
  const { pet } = petState;
  const { lifeEvent } = eventState;
  const loading = petState.loading || eventState.loading || vetsState.loading;

  const handleSubmit = async (values) => {
    await updateLifeEvent(pet.id, lifeEvent.id, buildLifeEventPayload(values, lifeEvent));
    await navigate(`/mascotas/${pet.id}/eventos-de-vida`, {
      state: { message: 'Cambios guardados correctamente.' },
    });
  };

  return (
    <section className="narrow-page">
      <LifeEventBreadcrumb pet={pet} current="Editar" />

      <div className="page-header">
        <div>
          <h1 className="page-title">Editar evento</h1>
          <p className="page-subtitle">
            Actualiza los datos del evento de vida. La mascota no se puede cambiar.
          </p>
        </div>
      </div>

      {loading && <Loader label="Cargando evento..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}
      {!loading && pet && eventState.error && <AlertMessage>{eventState.error}</AlertMessage>}

      {!loading && pet && lifeEvent && (
        <>
          {vetsState.error && <AlertMessage>{vetsState.error}</AlertMessage>}
          <LifeEventForm
            pet={pet}
            initialValues={lifeEventToFormValues(lifeEvent)}
            veterinarians={withCurrentVeterinarian(vetsState.veterinarians, lifeEvent.veterinarian)}
            submitLabel="Guardar cambios"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </section>
  );
}