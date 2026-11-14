import { Link, useLocation, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import LifeEventBreadcrumb from '../components/LifeEventBreadcrumb';
import LifeEventTable from '../components/LifeEventTable';
import Loader from '../components/Loader';
import useLifeEvents from '../hooks/useLifeEvents';
import usePet from '../hooks/usePet';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

function EventsView({ pet, eventsState, message }) {
  const { events, error, reload } = eventsState;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eventos de vida</h1>
          <p className="page-subtitle">Historial médico y de cuidado de {pet.name}.</p>
        </div>
        <Link to={`/mascotas/${pet.id}/eventos-de-vida/nuevo`} className="btn-brand">
          + Registrar evento
        </Link>
      </div>

      {message && <AlertMessage variant="success">{message}</AlertMessage>}

      {error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!error && events.length === 0 && (
        <p className="empty-state">Esta mascota aún no tiene eventos de vida registrados.</p>
      )}

      {!error && events.length > 0 && <LifeEventTable petId={pet.id} events={events} />}
    </>
  );
}

export default function LifeEventListPage() {
  const { id } = useParams();
  const location = useLocation();
  const petState = usePet(id);
  const eventsState = useLifeEvents(id);
  const { pet } = petState;
  const loading = petState.loading || eventsState.loading;

  return (
    <section>
      <LifeEventBreadcrumb pet={pet} />

      {loading && <Loader label="Cargando eventos de vida..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}

      {!loading && pet && (
        <EventsView pet={pet} eventsState={eventsState} message={location.state?.message} />
      )}
    </section>
  );
}