import { useState } from 'react';
import { getAdoptionPetName } from '../utils/adoptionMessages';
import { buildReturnPayload, buildSavedReturnRecord } from '../services/returnRecordMapper';
import {
  createReturnRecord,
  deleteReturnRecord,
  getReturnRecord,
  updateReturnRecord,
} from '../services/returnRecordService';
import {
  RETURN_RECORD_DELETED_MESSAGE,
  RETURN_RECORD_EXISTS_MESSAGE,
  RETURN_RECORD_NOT_FOUND_MESSAGE,
  RETURN_RECORD_UPDATED_MESSAGE,
  getReturnRecordErrorMessage,
  getReturnRegisteredMessage,
  isReturnRecordExists,
  isReturnRecordNotFound,
} from '../utils/returnRecordMessages';

// El back ya marca la adopción como devuelta y libera la mascota: se refleja igual en pantalla.
const markReturned = (adoption) => ({
  ...adoption,
  status: 'RETURNED',
  pet: adoption.pet ? { ...adoption.pet, available: true } : adoption.pet,
});

export default function useReturnRecordActions({ adoption, setAdoption, setReturnRecord }) {
  const [message, setMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const clearFeedback = () => {
    setMessage(null);
    setActionError(null);
  };

  const dropReturnRecord = () => {
    setReturnRecord(null);
    setEditing(false);
  };

  // Si otra persona ya registró la devolución, se muestra la que existe y se avisa del rechazo.
  const showExisting = async (failure) => {
    try {
      setReturnRecord(await getReturnRecord(adoption.id));
    } catch {
      throw failure;
    }
    setActionError(RETURN_RECORD_EXISTS_MESSAGE);
  };

  const register = async (values) => {
    clearFeedback();
    try {
      const created = await createReturnRecord(adoption.id, buildReturnPayload(values));
      setReturnRecord(buildSavedReturnRecord(values, created));
      setAdoption(markReturned(adoption));
      setMessage(getReturnRegisteredMessage(adoption));
    } catch (failure) {
      if (!isReturnRecordExists(failure)) throw failure;
      await showExisting(failure);
    }
  };

  // Si la devolución ya no existe, se vuelve al formulario de registro.
  const update = async (values) => {
    clearFeedback();
    try {
      const saved = await updateReturnRecord(adoption.id, buildReturnPayload(values));
      setReturnRecord(buildSavedReturnRecord(values, saved));
      setEditing(false);
      setMessage(RETURN_RECORD_UPDATED_MESSAGE);
    } catch (failure) {
      if (!isReturnRecordNotFound(failure)) throw failure;
      dropReturnRecord();
      setActionError(RETURN_RECORD_NOT_FOUND_MESSAGE);
    }
  };

  const remove = async () => {
    const petName = getAdoptionPetName(adoption);
    if (!window.confirm(`¿Eliminar la devolución de ${petName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    clearFeedback();
    setDeleting(true);
    try {
      await deleteReturnRecord(adoption.id);
      dropReturnRecord();
      setMessage(RETURN_RECORD_DELETED_MESSAGE);
    } catch (failure) {
      if (isReturnRecordNotFound(failure)) dropReturnRecord();
      setActionError(getReturnRecordErrorMessage(failure));
    }
    setDeleting(false);
  };

  const startEdit = () => {
    clearFeedback();
    setEditing(true);
  };

  return {
    message,
    actionError,
    editing,
    deleting,
    register,
    update,
    remove,
    startEdit,
    cancelEdit: () => setEditing(false),
  };
}
