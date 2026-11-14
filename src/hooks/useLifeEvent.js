import { useEffect, useState } from 'react';
import { getLifeEvent } from '../services/lifeEventService';
import { getLifeEventErrorMessage } from '../utils/lifeEventMessages';

export default function useLifeEvent(petId, eventId) {
  const [state, setState] = useState({ lifeEvent: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getLifeEvent(petId, eventId)
      .then((lifeEvent) => {
        if (active) setState({ lifeEvent, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({ lifeEvent: null, loading: false, error: getLifeEventErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [petId, eventId]);

  return state;
}