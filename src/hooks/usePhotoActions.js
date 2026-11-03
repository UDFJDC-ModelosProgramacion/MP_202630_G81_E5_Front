import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  buildPhotoPayload,
  buildPhotoUpdatePayload,
  parseTargetValue,
} from '../services/photoMapper';
import { createPhoto, updatePhoto } from '../services/photoService';
import { photosPath } from '../utils/photoOwners';

const ADDED_MESSAGE = 'Foto agregada correctamente.';
const SAVED_MESSAGE = 'Cambios guardados correctamente.';

export default function usePhotoActions({ owner, entity, addPhoto, replacePhoto }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [feedback, setFeedback] = useState(() =>
    location.state?.message ? { type: 'success', message: location.state.message } : null,
  );

  const finish = (message) => {
    setFeedback({ type: 'success', message });
    setEditing(null);
    setFormKey((key) => key + 1);
  };

  const create = async (values) => {
    const created = await createPhoto(buildPhotoPayload(values));
    const target = parseTargetValue(values.target);
    if (target.owner !== owner || target.ownerId !== entity.id) {
      await navigate(photosPath(target.owner, target.ownerId), { state: { message: ADDED_MESSAGE } });
      return;
    }
    addPhoto(created);
    finish(ADDED_MESSAGE);
  };

  const edit = async (values) => {
    const updated = await updatePhoto(owner, entity.id, editing.id, buildPhotoUpdatePayload(values));
    replacePhoto(updated);
    finish(SAVED_MESSAGE);
  };

  const startEdit = (photo) => {
    setFeedback(null);
    setEditing(photo);
  };

  return {
    editing,
    formKey,
    feedback,
    startEdit,
    cancelEdit: () => setEditing(null),
    submitPhoto: (values) => (editing ? edit(values) : create(values)),
  };
}