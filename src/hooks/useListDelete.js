import { useState } from 'react';
import { isNotFound } from '../services/apiError';

export default function useListDelete({
  deleteItem,
  onRemoved,
  confirmMessage,
  successMessage,
  getErrorMessage,
  isGone = isNotFound,
  initialFeedback = null,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(initialFeedback);

  const handleDelete = async (item) => {
    if (!window.confirm(confirmMessage(item))) {
      return;
    }

    setFeedback(null);
    setDeletingId(item.id);
    try {
      await deleteItem(item);
      onRemoved(item);
      setFeedback({ type: 'success', message: successMessage(item) });
    } catch (error) {
      if (isGone(error)) onRemoved(item);
      setFeedback({ type: 'error', message: getErrorMessage(error, item) });
    } finally {
      setDeletingId(null);
    }
  };

  return { deletingId, feedback, handleDelete };
}