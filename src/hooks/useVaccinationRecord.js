import { useCallback, useEffect, useState } from 'react';
import { getVaccinationRecord } from '../services/vaccinationRecordService';
import { getErrorMessage, isNotFound } from '../services/apiError';

export default function useVaccinationRecord(petId) {
  const [state, setState] = useState({
    record: null,
    loading: true,
    error: null,
    notFound: false,
  });

  useEffect(() => {
    let active = true;
    getVaccinationRecord(petId)
      .then((record) => {
        if (active) setState({ record, loading: false, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            record: null,
            loading: false,
            error: getErrorMessage(error),
            notFound: isNotFound(error),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [petId]);

  const clearRecord = useCallback(() => {
    setState({ record: null, loading: false, error: null, notFound: true });
  }, []);

  return { ...state, clearRecord };
}