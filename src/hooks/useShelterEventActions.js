import { useState } from 'react';
import { buildEventPayload } from '../services/shelterEventMapper';
import {
  createShelterEvent,
  deleteShelterEvent,
  updateShelterEvent,
} from '../services/shelterEventService';
import { isPastEvent } from '../utils/eventDates';
import {
  PAST_EVENT_DELETE_MESSAGE,
  getEventErrorMessage,
  isNotFoundEvent,
} from '../utils/shelterEventMessages';

const confirmDelete = (event) =>
  window.confirm(`¿Eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`);

export default function useShelterEventActions(shelterId, setEvents) {
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

  const dropEvent = (id) => {
    setEvents((list) => list.filter((event) => event.id !== id));
    setEditing((current) => (current?.id === id ? null : current));
  };

  const create = async (values) => {
    const created = await createShelterEvent(shelterId, buildEventPayload(values));
    setEvents((list) => [...list, { ...created, date: values.date }]);
    finishSave('Evento programado correctamente.');
  };

  const update = async (values) => {
    const payload = buildEventPayload(values);
    await updateShelterEvent(shelterId, editing.id, payload);
    setEvents((list) =>
      list.map((event) =>
        event.id === editing.id ? { ...event, ...payload, date: values.date } : event,
      ),
    );
    finishSave('Evento actualizado correctamente.');
  };

  const save = (values) => {
    clearFeedback();
    return editing ? update(values) : create(values);
  };

  const remove = async (event) => {
    clearFeedback();
    if (isPastEvent(event)) {
      setActionError(PAST_EVENT_DELETE_MESSAGE);
      return;
    }
    if (!confirmDelete(event)) return;

    setDeletingId(event.id);
    try {
      await deleteShelterEvent(shelterId, event.id);
      dropEvent(event.id);
      setMessage('Evento eliminado correctamente.');
    } catch (failure) {
      if (isNotFoundEvent(failure)) dropEvent(event.id);
      setActionError(getEventErrorMessage(failure));
    }
    setDeletingId(null);
  };

  const startEdit = (event) => {
    clearFeedback();
    setEditing(event);
  };

  return {
    editing,
    message,
    actionError,
    deletingId,
    formKey: editing ? `edit-${editing.id}` : `new-${resetCount}`,
    startEdit,
    cancelEdit: () => setEditing(null),
    save,
    remove,
  };
}