import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import NotificationListPanel from '../components/NotificationListPanel';
import NotificationPanel from '../components/NotificationPanel';
import useNotificationActions from '../hooks/useNotificationActions';
import useNotifications from '../hooks/useNotifications';
import useShelter from '../hooks/useShelter';

export default function NotificationListPage() {
  const { id } = useParams();
  const { shelter } = useShelter(id);
  const { notifications, loading, error, reload, setNotifications } = useNotifications(id);
  const actions = useNotificationActions(id, setNotifications);

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/refugios">Refugios</Link> / {shelter ? shelter.name : 'Refugio'}
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Notificaciones</h1>
          <p className="page-subtitle">Mensajes que el refugio envía a los usuarios.</p>
        </div>
      </div>

      {actions.message && <AlertMessage variant="success">{actions.message}</AlertMessage>}
      {actions.actionError && <AlertMessage>{actions.actionError}</AlertMessage>}

      {loading && <Loader label="Cargando notificaciones..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!loading && !error && (
        <div className="notification-layout">
          <NotificationListPanel
            notifications={notifications}
            shelterId={id}
            editingId={actions.editing?.id}
            deletingId={actions.deletingId}
            onEdit={actions.startEdit}
            onDelete={actions.remove}
          />
          <NotificationPanel
            editing={actions.editing}
            formKey={actions.formKey}
            onSubmit={actions.save}
            onCancel={actions.cancel}
          />
        </div>
      )}
    </section>
  );
}