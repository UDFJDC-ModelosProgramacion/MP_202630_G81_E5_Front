import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useNotification from '../hooks/useNotification';
import { displayValue } from '../utils/formatters';

export default function NotificationDetailPage() {
  const { id, notificationId } = useParams();
  const { notification, loading, error } = useNotification(id, notificationId);
  const listPath = `/refugios/${id}/notificaciones`;

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={listPath}>Notificaciones del refugio</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando notificación..." />}

      {!loading && error && <AlertMessage>{error}</AlertMessage>}

      {notification && (
        <>
          <div className="page-header">
            <h1 className="page-title">Detalle de la notificación</h1>
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              <div className="detail-list__item">
                <dt>Canal</dt>
                <dd>
                  <span className="notification-badge">{notification.channel}</span>
                </dd>
              </div>
              <div className="detail-list__item">
                <dt>Mensaje</dt>
                <dd>{displayValue(notification.message)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={listPath} className="btn-outline-brand">
          Volver a las notificaciones
        </Link>
      </div>
    </section>
  );
}