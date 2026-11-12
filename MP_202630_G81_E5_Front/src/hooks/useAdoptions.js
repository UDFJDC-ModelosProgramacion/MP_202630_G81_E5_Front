import { useCallback, useEffect, useState } from 'react';
import { getAdoptions } from '../services/adoptionService';
import { getErrorMessage } from '../services/apiError';

export default function useAdoptions() {
  const [state, setState] = useState({ adoptions: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdoptions()
      .then((adoptions) => {
        if (active) setState({ adoptions, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ adoptions: [], loading: false, error: getErrorMessage(error) });
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
