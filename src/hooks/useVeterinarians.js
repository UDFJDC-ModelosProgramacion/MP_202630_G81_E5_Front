import { useCallback, useEffect, useState } from 'react';
import { getVeterinarians } from '../services/veterinarianService';
import { getErrorMessage } from '../services/apiError';

export default function useVeterinarians() {
  const [state, setState] = useState({ veterinarians: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getVeterinarians()
      .then((veterinarians) => {
        if (active) setState({ veterinarians, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({ veterinarians: [], loading: false, error: getErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const removeVeterinarian = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      veterinarians: prev.veterinarians.filter((veterinarian) => veterinarian.id !== id),
    }));
  }, []);

  return { ...state, reload, removeVeterinarian };
}