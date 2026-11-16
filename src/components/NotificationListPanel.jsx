import NotificationCard from './NotificationCard';

export default function NotificationListPanel({
  notifications,
  shelterId,
  editingId,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <section className="notification-panel" aria-labelledby="notification-list-title">
      <h2 id="notification-list-title" className="notification-panel__title">
        Notificaciones enviadas
      </h2>
      {notifications.length === 0 ? (
        <p className="empty-state">Este refugio aún no ha enviado notificaciones.</p>
      ) : (
        <ul className="notification-list" aria-label="Notificaciones del refugio">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationCard
                notification={notification}
                shelterId={shelterId}
                editing={editingId === notification.id}
                deleting={deletingId === notification.id}
                onEdit={() => onEdit(notification)}
                onDelete={() => onDelete(notification)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}