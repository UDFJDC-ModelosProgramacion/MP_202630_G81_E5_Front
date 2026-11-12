import { useEffect, useState } from 'react';
import { getAdopters } from '../services/adoptionLookupService';
import { getErrorMessage } from '../services/apiError';

// Aún no hay inicio de sesión: "Mis reseñas" usa al primer adoptante registrado.
export default function useReviewAdopter() {
  const [state, setState] = useState({ adopter: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getAdopters()
      .then((adopters) => {
        if (active) setState({ adopter: adopters[0] ?? null, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ adopter: null, loading: false, error: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
