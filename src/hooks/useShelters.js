import { useEffect, useState } from 'react';
import { getShelters } from '../services/shelterService';
import { getErrorMessage } from '../services/apiError';

export default function useShelters() {
  const [state, setState] = useState({ shelters: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    getShelters()
      .then((shelters) => {
        if (active) setState({ shelters, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ shelters: [], loading: false, error: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}