import { useState } from 'react';
import { buildVideoPayload } from '../services/videoMapper';
import { createVideo, deleteVideo, updateVideo } from '../services/videoService';
import { getVideoDeleteErrorMessage, isNotFoundVideo } from '../utils/videoMessages';

const confirmDelete = () =>
  window.confirm('¿Eliminar este video? Esta acción no se puede deshacer.');

export default function useVideoActions(shelterId, setVideos) {
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

  const dropVideo = (id) => {
    setVideos((list) => list.filter((video) => video.id !== id));
    setEditing((current) => (current?.id === id ? null : current));
  };

  const create = async (values) => {
    const created = await createVideo(shelterId, buildVideoPayload(values));
    setVideos((list) => [...list, created]);
    finishSave('Video cargado correctamente.');
  };

  const update = async (values) => {
    const payload = buildVideoPayload(values);
    await updateVideo(shelterId, editing.id, payload);
    setVideos((list) =>
      list.map((video) => (video.id === editing.id ? { ...video, ...payload } : video)),
    );
    finishSave('Video actualizado correctamente.');
  };

  const save = (values) => {
    clearFeedback();
    return editing ? update(values) : create(values);
  };

  const remove = async (video) => {
    clearFeedback();
    if (!confirmDelete()) return;

    setDeletingId(video.id);
    try {
      await deleteVideo(shelterId, video.id);
      dropVideo(video.id);
      setMessage('Video eliminado correctamente.');
    } catch (failure) {
      if (isNotFoundVideo(failure)) dropVideo(video.id);
      setActionError(getVideoDeleteErrorMessage(failure));
    }
    setDeletingId(null);
  };

  const startEdit = (video) => {
    clearFeedback();
    setEditing(video);
  };

  return {
    editing,
    message,
    actionError,
    deletingId,
    formKey: editing ? `edit-${editing.id}` : `new-${resetCount}`,
    clearFeedback,
    startEdit,
    cancelEdit: () => setEditing(null),
    save,
    remove,
  };
}