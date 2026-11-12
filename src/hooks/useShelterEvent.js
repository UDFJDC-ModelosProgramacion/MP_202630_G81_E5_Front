import { useEffect, useState } from 'react';
import { getShelterEvent } from '../services/shelterEventService';
import { getEventErrorMessage } from '../utils/shelterEventMessages';

export default function useShelterEvent(shelterId, eventId) {
  const [state, setState] = useState({ event: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getShelterEvent(shelterId, eventId)
      .then((event) => {
        if (active) setState({ event, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ event: null, loading: false, error: getEventErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [shelterId, eventId]);

  return state;
}