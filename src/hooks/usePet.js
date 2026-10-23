import { useEffect, useState } from 'react';
import { getPet } from '../services/petService';
import { getErrorMessage, isNotFound } from '../services/apiError';

export default function usePet(id) {
  const [state, setState] = useState({ pet: null, loading: true, error: null, notFound: false });

  useEffect(() => {
    let active = true;
    getPet(id)
      .then((pet) => {
        if (active) setState({ pet, loading: false, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            pet: null,
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