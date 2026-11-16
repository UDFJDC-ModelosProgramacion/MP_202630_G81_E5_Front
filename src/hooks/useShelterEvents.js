import { useCallback, useEffect, useState } from 'react';
import { getShelterEvents } from '../services/shelterEventService';
import { getEventErrorMessage } from '../utils/shelterEventMessages';

export default function useShelterEvents(shelterId) {
  const [state, setState] = useState({ events: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getShelterEvents(shelterId)
      .then((events) => {
        if (active) setState({ events, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ events: [], loading: false, error: getEventErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [shelterId, reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const setEvents = useCallback((update) => {
    setState((prev) => ({ ...prev, events: update(prev.events) }));
  }, []);

  return { ...state, reload, setEvents };
}