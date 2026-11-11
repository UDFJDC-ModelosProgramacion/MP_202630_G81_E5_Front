import { useCallback, useEffect, useState } from 'react';
import { getMessages } from '../services/messageService';
import { getMessageErrorMessage } from '../utils/messageMessages';

export default function useMessages(adopterId) {
  const [state, setState] = useState({ messages: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getMessages(adopterId)
      .then((messages) => {
        if (active) setState({ messages, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ messages: [], loading: false, error: getMessageErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [adopterId, reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const refresh = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const setMessages = useCallback((update) => {
    setState((prev) => ({ ...prev, messages: update(prev.messages) }));
  }, []);

  return { ...state, reload, refresh, setMessages };
}