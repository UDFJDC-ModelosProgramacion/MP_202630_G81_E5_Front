import { Link } from 'react-router-dom';

export default function NotificationCard({
  notification,
  shelterId,
  editing,
  deleting,
  onEdit,
  onDelete,
}) {
  return (
    <article className={`notification-card${editing ? ' notification-card--editing' : ''}`}>
      <div className="notification-card__header">
        <span className="notification-badge">{notification.channel}</span>
        <Link
          to={`/refugios/${shelterId}/notificaciones/${notification.id}`}
          className="notification-card__link"
          aria-label={`Ver detalle de la notificación ${notification.id}`}
        >
          Ver detalle
        </Link>
      </div>
      <p className="notification-card__message">{notification.message}</p>
      <div className="notification-card__actions">
        <button
          type="button"
          className="notification-card__button"
          aria-label={`Editar la notificación ${notification.id}`}
          disabled={deleting}
          onClick={onEdit}
        >
          Editar
        </button>
        <button
          type="button"
          className="notification-card__button notification-card__button--danger"
          aria-label={`Eliminar la notificación ${notification.id}`}
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </article>
  );
}