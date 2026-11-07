import { useEffect, useState } from 'react';
import { getMessage } from '../services/messageService';
import { getMessageErrorMessage } from '../utils/messageMessages';

export default function useMessage(adopterId, messageId) {
  const [state, setState] = useState({ message: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getMessage(adopterId, messageId)
      .then((message) => {
        if (active) setState({ message, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ message: null, loading: false, error: getMessageErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [adopterId, messageId]);

  return state;
}