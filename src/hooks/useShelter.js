import { useEffect, useState } from 'react';
import { getShelter } from '../services/shelterService';
import { getErrorMessage, isNotFound } from '../services/apiError';

export default function useShelter(id) {
  const [state, setState] = useState({ shelter: null, loading: true, error: null, notFound: false });

  useEffect(() => {
    let active = true;
    getShelter(id)
      .then((shelter) => {
        if (active) setState({ shelter, loading: false, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            shelter: null,
            loading: false,
            error: getErrorMessage(error),
            notFound: isNotFound(error),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}