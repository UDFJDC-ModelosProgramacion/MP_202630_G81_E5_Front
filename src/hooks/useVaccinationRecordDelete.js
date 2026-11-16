import { useState } from 'react';
import { isNotFound } from '../services/apiError';
import { deleteVaccinationRecord } from '../services/vaccinationRecordService';
import {
  getVaccinationRecordErrorMessage,
  VACCINATION_RECORD_NOT_FOUND_MESSAGE,
} from '../utils/vaccinationRecordMessages';

export default function useVaccinationRecordDelete(pet, onRemoved) {
  const [state, setState] = useState({ deleting: false, feedback: null });

  const remove = async () => {
    if (!window.confirm(`¿Eliminar el carnet de ${pet.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setState({ deleting: true, feedback: null });
    try {
      await deleteVaccinationRecord(pet.id);
      onRemoved();
      setState({
        deleting: false,
        feedback: { type: 'success', message: 'Carnet eliminado correctamente.' },
      });
    } catch (error) {
      const message = getVaccinationRecordErrorMessage(error);
      if (isNotFound(error) && message === VACCINATION_RECORD_NOT_FOUND_MESSAGE) onRemoved();
      setState({ deleting: false, feedback: { type: 'error', message } });
    }
  };

  return { ...state, remove };
}