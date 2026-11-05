import { useEffect, useState } from 'react';
import { getReturnRecord } from '../services/returnRecordService';
import { getReturnRecordErrorMessage, isReturnRecordNotFound } from '../utils/returnRecordMessages';

// Una adopción sin devolución no es un error: la pantalla ofrece registrarla.
export default function useReturnRecord(adoptionId) {
  const [state, setState] = useState({ returnRecord: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getReturnRecord(adoptionId)
      .then((returnRecord) => {
        if (active) setState({ returnRecord, loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        const failureMessage = isReturnRecordNotFound(error) ? null : getReturnRecordErrorMessage(error);
        setState({ returnRecord: null, loading: false, error: failureMessage });
      });
    return () => {
      active = false;
    };
  }, [adoptionId]);

  return state;
}
