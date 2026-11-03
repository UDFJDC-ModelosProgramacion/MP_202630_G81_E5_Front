import { useCallback, useEffect, useState } from 'react';
import { getPets } from '../services/petService';
import { getShelters } from '../services/shelterService';
import { getErrorMessage } from '../services/apiError';
import { buildShelterRows } from '../utils/shelterRows';

export default function useShelterList() {
  const [state, setState] = useState({ shelters: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getShelters(), getPets()])
      .then(([shelters, pets]) => {
        if (active) {
          setState({ shelters: buildShelterRows(shelters, pets), loading: false, error: null });
        }
      })
      .catch((error) => {
        if (active) setState({ shelters: [], loading: false, error: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const removeShelter = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      shelters: prev.shelters.filter((shelter) => shelter.id !== id),
    }));
  }, []);

  return { ...state, reload, removeShelter };
}