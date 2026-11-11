import { useState } from 'react';
import { buildNotificationPayload } from '../services/notificationMapper';
import {
  createNotification,
  deleteNotification,
  updateNotification,
} from '../services/notificationService';
import { getNotificationErrorMessage, isNotFoundNotification } from '../utils/notificationMessages';

const confirmDelete = () =>
  window.confirm('¿Eliminar esta notificación? Esta acción no se puede deshacer.');

export default function useNotificationActions(shelterId, setNotifications) {
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [resetCount, setResetCount] = useState(0);

  const clearFeedback = () => {
    setMessage(null);
    setActionError(null);
  };

  const finishSave = (text) => {
    setMessage(text);
    setEditing(null);
    setResetCount((count) => count + 1);
  };

  const dropNotification = (id) => {
    setNotifications((list) => list.filter((item) => item.id !== id));
    setEditing((current) => (current?.id === id ? null : current));
  };

  const create = async (values) => {
    const created = await createNotification(shelterId, buildNotificationPayload(values));
    setNotifications((list) => [...list, created]);
    finishSave('Notificación enviada correctamente.');
  };

  const update = async (values) => {
    const payload = buildNotificationPayload(values, editing);
    await updateNotification(shelterId, editing.id, payload);
    setNotifications((list) =>
      list.map((item) => (item.id === editing.id ? { ...item, ...payload } : item)),
    );
    finishSave('Notificación actualizada correctamente.');
  };

  const save = (values) => {
    clearFeedback();
    return editing ? update(values) : create(values);
  };

  const remove = async (notification) => {
    clearFeedback();
    if (!confirmDelete()) return;

    setDeletingId(notification.id);
    try {
      await deleteNotification(shelterId, notification.id);
      dropNotification(notification.id);
      setMessage('Notificación eliminada correctamente.');
    } catch (failure) {
      if (isNotFoundNotification(failure)) dropNotification(notification.id);
      setActionError(getNotificationErrorMessage(failure));
    }
    setDeletingId(null);
  };

  const startEdit = (notification) => {
    clearFeedback();
    setEditing(notification);
  };

  const cancel = () => {
    clearFeedback();
    setEditing(null);
    setResetCount((count) => count + 1);
  };

  return {
    editing,
    message,
    actionError,
    deletingId,
    formKey: editing ? `edit-${editing.id}` : `new-${resetCount}`,
    startEdit,
    cancel,
    save,
    remove,
  };
}