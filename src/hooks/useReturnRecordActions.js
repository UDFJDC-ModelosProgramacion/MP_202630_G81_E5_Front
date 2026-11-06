import { useState } from 'react';
import { buildReturnPayload, buildSavedReturnRecord } from '../services/returnRecordMapper';
import { createReturnRecord, getReturnRecord } from '../services/returnRecordService';
import {
  RETURN_RECORD_EXISTS_MESSAGE,
  getReturnRegisteredMessage,
  isReturnRecordExists,
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
    setMessage(null);
    setActionError(null);
    const payload = buildReturnPayload(values);
    try {
      const created = await createReturnRecord(adoption.id, payload);
      setReturnRecord(buildSavedReturnRecord(values, created));
      setAdoption(markReturned(adoption));
      setMessage(getReturnRegisteredMessage(adoption));
    } catch (failure) {
      if (!isReturnRecordExists(failure)) throw failure;
      await showExisting(failure);
    }
  };

  return { message, actionError, register };
}
