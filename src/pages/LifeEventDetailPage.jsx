import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import LifeEventBreadcrumb from '../components/LifeEventBreadcrumb';
import LifeEventTypeBadge from '../components/LifeEventTypeBadge';
import Loader from '../components/Loader';
import useLifeEvent from '../hooks/useLifeEvent';
import usePet from '../hooks/usePet';
import { formatEventDate } from '../utils/eventDates';
import { displayValue } from '../utils/formatters';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

function LifeEventDetails({ pet, lifeEvent }) {
  const fields = [
    ['Fecha', formatEventDate(lifeEvent.date)],
    ['Veterinario', lifeEvent.veterinarian?.name],
    ['Mascota', pet.name],
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Evento de vida</h1>
        <LifeEventTypeBadge type={lifeEvent.type} />
      </div>
      <div className="detail-card">
        <dl className="detail-list">
          {fields.map(([label, value]) => (
            <div key={label} className="detail-list__item">
              <dt>{label}</dt>
              <dd>{displayValue(value)}</dd>
            </div>
          ))}
          <div className="detail-list__item life-event-detail__wide">
            <dt>Descripción</dt>
            <dd>{displayValue(lifeEvent.description)}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}

export default function LifeEventDetailPage() {
  const { id, eventId } = useParams();
  const petState = usePet(id);
  const eventState = useLifeEvent(id, eventId);
  const { pet } = petState;
  const { lifeEvent } = eventState;
  const loading = petState.loading || eventState.loading;

  return (
    <section className="narrow-page">
      <LifeEventBreadcrumb pet={pet} current="Detalle" />

      {loading && <Loader label="Cargando evento..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}
      {!loading && pet && eventState.error && <AlertMessage>{eventState.error}</AlertMessage>}
      {!loading && pet && lifeEvent && <LifeEventDetails pet={pet} lifeEvent={lifeEvent} />}

      <div className="detail-actions">
        <Link to={`/mascotas/${id}/eventos-de-vida`} className="btn-outline-brand">
          Volver al listado
        </Link>
        {lifeEvent && (
          <Link to={`/mascotas/${id}/eventos-de-vida/${lifeEvent.id}/editar`} className="btn-brand">
            Editar
          </Link>
        )}
      </div>
    </section>
  );
}