import { useCallback, useEffect, useState } from 'react';
import { getPets } from '../services/petService';
import { getErrorMessage } from '../services/apiError';

export default function usePets() {
  const [state, setState] = useState({ pets: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getPets()
      .then((pets) => {
        if (active) setState({ pets, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ pets: [], loading: false, error: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, reload };
}