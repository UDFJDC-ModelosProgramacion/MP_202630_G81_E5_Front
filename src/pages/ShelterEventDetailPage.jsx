import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useShelterEvent from '../hooks/useShelterEvent';
import { EVENT_STATUS, formatEventDate, getEventStatus } from '../utils/eventDates';
import { displayValue } from '../utils/formatters';

export default function ShelterEventDetailPage() {
  const { id, eventId } = useParams();
  const { event, loading, error } = useShelterEvent(id, eventId);
  const listPath = `/refugios/${id}/eventos`;
  const status = event ? getEventStatus(event) : null;

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={listPath}>Eventos del refugio</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando evento..." />}

      {!loading && error && <AlertMessage>{error}</AlertMessage>}

      {event && (
        <>
          <div className="page-header">
            <h1 className="page-title">Detalle del evento</h1>
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              <div className="detail-list__item">
                <dt>Nombre</dt>
                <dd>{displayValue(event.title)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Fecha</dt>
                <dd>{formatEventDate(event.date)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Tipo</dt>
                <dd>{displayValue(event.type)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Estado</dt>
                <dd>
                  <span
                    className={`event-badge event-badge--${status === EVENT_STATUS.DONE ? 'done' : 'upcoming'}`}
                  >
                    {status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={listPath} className="btn-outline-brand">
          Volver a los eventos
        </Link>
      </div>
    </section>
  );
}