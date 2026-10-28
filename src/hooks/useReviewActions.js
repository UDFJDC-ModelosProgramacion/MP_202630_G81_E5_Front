import { useState } from 'react';
import { buildReviewPayload } from '../services/reviewMapper';
import { createReview, deleteReview, updateReview } from '../services/reviewService';
import { formatRatingOf } from '../utils/reviewFormatters';
import { getReviewErrorMessage, isNotFoundReview } from '../utils/reviewMessages';

const confirmDelete = (review) =>
  window.confirm(`¿Eliminar tu reseña de ${formatRatingOf(review.rating)}? Esta acción no se puede deshacer.`);

export default function useReviewActions(adopterId, setReviews) {
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

  const dropReview = (id) => {
    setReviews((list) => list.filter((review) => review.id !== id));
    setEditing((current) => (current?.id === id ? null : current));
  };

  const create = async (values) => {
    const created = await createReview(adopterId, buildReviewPayload(values));
    setReviews((list) => [...list, created]);
    finishSave('Reseña publicada correctamente.');
  };

  const update = async (values) => {
    const payload = buildReviewPayload(values);
    await updateReview(adopterId, editing.id, payload);
    setReviews((list) =>
      list.map((review) => (review.id === editing.id ? { ...review, ...payload } : review)),
    );
    finishSave('Reseña actualizada correctamente.');
  };

  const save = (values) => {
    clearFeedback();
    return editing ? update(values) : create(values);
  };

  const remove = async (review) => {
    if (!confirmDelete(review)) return;

    clearFeedback();
    setDeletingId(review.id);
    try {
      await deleteReview(adopterId, review.id);
      dropReview(review.id);
      setMessage('Reseña eliminada correctamente.');
    } catch (failure) {
      if (isNotFoundReview(failure)) dropReview(review.id);
      setActionError(getReviewErrorMessage(failure));
    }
    setDeletingId(null);
  };

  const startEdit = (review) => {
    clearFeedback();
    setEditing(review);
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
