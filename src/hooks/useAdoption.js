import { useCallback, useEffect, useState } from 'react';
import { getAdoption } from '../services/adoptionService';
import { getErrorMessage, isNotFound } from '../services/apiError';

export default function useAdoption(id) {
  const [state, setState] = useState({
    adoption: null,
    loading: true,
    error: null,
    notFound: false,
  });

  useEffect(() => {
    let active = true;
    getAdoption(id)
      .then((adoption) => {
        if (active) setState({ adoption, loading: false, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            adoption: null,
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

  const setAdoption = useCallback((adoption) => {
    setState((prev) => ({ ...prev, adoption }));
  }, []);

  return { ...state, setAdoption };
}
