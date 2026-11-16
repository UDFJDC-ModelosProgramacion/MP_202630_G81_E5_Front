import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ShelterEventCard from '../components/ShelterEventCard';
import ShelterEventPanel from '../components/ShelterEventPanel';
import useShelter from '../hooks/useShelter';
import useShelterEventActions from '../hooks/useShelterEventActions';
import useShelterEvents from '../hooks/useShelterEvents';

export default function ShelterEventsPage() {
  const { id } = useParams();
  const { shelter } = useShelter(id);
  const { events, loading, error, reload, setEvents } = useShelterEvents(id);
  const actions = useShelterEventActions(id, setEvents);
  const loaded = !loading && !error;

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/refugios">Refugios</Link> /{' '}
        {shelter ? <Link to={`/refugios/${id}`}>{shelter.name}</Link> : 'Refugio'} / Eventos
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Eventos del refugio</h1>
          <p className="page-subtitle">Jornadas y actividades programadas por el refugio.</p>
        </div>
      </div>

      {actions.message && <AlertMessage variant="success">{actions.message}</AlertMessage>}
      {actions.actionError && <AlertMessage>{actions.actionError}</AlertMessage>}

      {loading && <Loader label="Cargando eventos..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {loaded && (
        <div className="event-layout">
          <div>
            {events.length === 0 ? (
              <p className="empty-state">Este refugio aún no tiene eventos programados.</p>
            ) : (
              <ul className="event-list" aria-label="Eventos del refugio">
                {events.map((event) => (
                  <li key={event.id}>
                    <ShelterEventCard
                      event={event}
                      shelterId={id}
                      editing={actions.editing?.id === event.id}
                      deleting={actions.deletingId === event.id}
                      onEdit={() => actions.startEdit(event)}
                      onDelete={() => actions.remove(event)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ShelterEventPanel
            editing={actions.editing}
            formKey={actions.formKey}
            onSubmit={actions.save}
            onCancel={actions.cancelEdit}
          />
        </div>
      )}
    </section>
  );
}