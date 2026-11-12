import { useEffect, useState } from 'react';
import { getAdopter } from '../services/adopterService';
import { getErrorMessage, isNotFound } from '../services/apiError';

export default function useAdopter(id) {
  const [state, setState] = useState({ adopter: null, loading: true, error: null, notFound: false });

  useEffect(() => {
    let active = true;
    getAdopter(id)
      .then((adopter) => {
        if (active) setState({ adopter, loading: false, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            adopter: null,
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