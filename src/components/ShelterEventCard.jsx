import { Link } from 'react-router-dom';
import { EVENT_STATUS, formatEventDate, getEventStatus } from '../utils/eventDates';

export default function ShelterEventCard({
  event,
  shelterId,
  editing,
  deleting,
  onEdit,
  onDelete,
}) {
  const status = getEventStatus(event);
  const done = status === EVENT_STATUS.DONE;

  return (
    <article className={`event-card${editing ? ' event-card--editing' : ''}`}>
      <div className="event-card__header">
        <h3 className="event-card__title">{event.title}</h3>
        <span className={`event-badge event-badge--${done ? 'done' : 'upcoming'}`}>{status}</span>
      </div>
      <p className="event-card__date">{formatEventDate(event.date)}</p>
      {event.type ? (
        <p className="event-card__type">{event.type}</p>
      ) : (
        <p className="event-card__type event-card__type--empty">Sin tipo.</p>
      )}
      <div className="event-card__actions">
        <Link
          to={`/refugios/${shelterId}/eventos/${event.id}`}
          className="event-card__button"
          aria-label={`Ver detalle del evento ${event.id}`}
        >
          Ver detalle
        </Link>
        <button
          type="button"
          className="event-card__button"
          aria-label={`Editar el evento ${event.id}`}
          disabled={deleting}
          onClick={onEdit}
        >
          Editar
        </button>
        <button
          type="button"
          className="event-card__button event-card__button--danger"
          aria-label={`Eliminar el evento ${event.id}`}
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </article>
  );
}