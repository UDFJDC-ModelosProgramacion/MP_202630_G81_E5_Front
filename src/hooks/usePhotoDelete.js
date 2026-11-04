import { useState } from 'react';
import { isNotFound } from '../services/apiError';
import { deletePhoto } from '../services/photoService';
import { getPhotoDeleteErrorMessage } from '../utils/photoMessages';

export default function usePhotoDelete({ owner, entity, removePhoto, onFeedback, onRemoved }) {
  const [deletingId, setDeletingId] = useState(null);

  const drop = (photo) => {
    removePhoto(photo.id);
    onRemoved(photo);
  };

  const handleDelete = async (photo, label) => {
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }

    onFeedback(null);
    setDeletingId(photo.id);
    try {
      await deletePhoto(owner, entity.id, photo.id);
      drop(photo);
      onFeedback({ type: 'success', message: 'Foto eliminada correctamente.' });
    } catch (error) {
      if (isNotFound(error)) drop(photo);
      onFeedback({ type: 'error', message: getPhotoDeleteErrorMessage(error, owner, label) });
    } finally {
      setDeletingId(null);
    }
  };

  return { deletingId, handleDelete };
}