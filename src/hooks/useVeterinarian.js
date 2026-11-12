import { useEffect, useState } from 'react';
import { getVeterinarian } from '../services/veterinarianService';
import { getErrorMessage, isNotFound } from '../services/apiError';

export default function useVeterinarian(id) {
  const [state, setState] = useState({
    veterinarian: null,
    loading: true,
    error: null,
    notFound: false,
  });

  useEffect(() => {
    let active = true;
    getVeterinarian(id)
      .then((veterinarian) => {
        if (active) setState({ veterinarian, loading: false, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            veterinarian: null,
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