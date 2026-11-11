import { useEffect, useState } from 'react';
import { getNotification } from '../services/notificationService';
import { getNotificationErrorMessage } from '../utils/notificationMessages';

export default function useNotification(shelterId, notificationId) {
  const [state, setState] = useState({ notification: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getNotification(shelterId, notificationId)
      .then((notification) => {
        if (active) setState({ notification, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({ notification: null, loading: false, error: getNotificationErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [shelterId, notificationId]);

  return state;
}