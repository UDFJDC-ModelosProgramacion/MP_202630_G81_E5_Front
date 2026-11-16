import { useState } from 'react';
import { buildMessagePayload } from '../services/messageMapper';
import { createMessage, deleteMessage, updateMessage } from '../services/messageService';
import { getMessageErrorMessage, isNotFoundMessage } from '../utils/messageMessages';

const confirmDelete = () =>
  window.confirm('¿Eliminar este mensaje? Esta acción no se puede deshacer.');

export default function useMessageActions(adopterId, setMessages, refresh) {
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
    refresh();
  };

  const dropMessage = (id) => {
    setMessages((list) => list.filter((item) => item.id !== id));
    setEditing((current) => (current?.id === id ? null : current));
  };

  const create = async (values) => {
    await createMessage(adopterId, buildMessagePayload(values));
    finishSave('Mensaje enviado correctamente.');
  };

  const update = async (values) => {
    await updateMessage(adopterId, editing.id, buildMessagePayload(values));
    finishSave('Mensaje actualizado correctamente.');
  };

  const save = (values) => {
    clearFeedback();
    return editing ? update(values) : create(values);
  };

  const remove = async (item) => {
    if (!confirmDelete()) return;

    clearFeedback();
    setDeletingId(item.id);
    try {
      await deleteMessage(adopterId, item.id);
      dropMessage(item.id);
      setMessage('Mensaje eliminado correctamente.');
    } catch (failure) {
      if (isNotFoundMessage(failure)) dropMessage(item.id);
      setActionError(getMessageErrorMessage(failure));
    }
    setDeletingId(null);
  };

  const startEdit = (item) => {
    clearFeedback();
    setEditing(item);
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