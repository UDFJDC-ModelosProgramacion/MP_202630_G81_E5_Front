import { useCallback, useEffect, useState } from 'react';
import { getLifeEvents } from '../services/lifeEventService';
import { getLifeEventErrorMessage } from '../utils/lifeEventMessages';
import { sortLifeEventsByDate } from '../utils/lifeEventSort';

export default function useLifeEvents(petId) {
  const [state, setState] = useState({ events: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getLifeEvents(petId)
      .then((events) => {
        if (active) {
          setState({ events: sortLifeEventsByDate(events), loading: false, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ events: [], loading: false, error: getLifeEventErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [petId, reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const removeEvent = useCallback((eventId) => {
    setState((prev) => ({ ...prev, events: prev.events.filter((event) => event.id !== eventId) }));
  }, []);

  return { ...state, reload, removeEvent };
}