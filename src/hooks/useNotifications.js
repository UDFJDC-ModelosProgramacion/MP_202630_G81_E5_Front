import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from '../services/notificationService';
import { getNotificationErrorMessage } from '../utils/notificationMessages';

export default function useNotifications(shelterId) {
  const [state, setState] = useState({ notifications: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getNotifications(shelterId)
      .then((notifications) => {
        if (active) setState({ notifications, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({ notifications: [], loading: false, error: getNotificationErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [shelterId, reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const setNotifications = useCallback((update) => {
    setState((prev) => ({ ...prev, notifications: update(prev.notifications) }));
  }, []);

  return { ...state, reload, setNotifications };
}