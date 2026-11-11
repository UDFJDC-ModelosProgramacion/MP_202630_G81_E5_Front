import NotificationForm from './NotificationForm';
import { EMPTY_NOTIFICATION_FORM, notificationToFormValues } from '../services/notificationMapper';

export default function NotificationPanel({ editing, formKey, onSubmit, onCancel }) {
  return (
    <aside className="notification-panel" aria-labelledby="notification-panel-title">
      <h2 id="notification-panel-title" className="notification-panel__title">
        {editing ? 'Editar notificación' : 'Nueva notificación'}
      </h2>
      <NotificationForm
        key={formKey}
        initialValues={editing ? notificationToFormValues(editing) : EMPTY_NOTIFICATION_FORM}
        submitLabel={editing ? 'Guardar cambios' : 'Enviar notificación'}
        focusOnMount={Boolean(editing)}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </aside>
  );
}