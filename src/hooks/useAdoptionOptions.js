import { useEffect, useState } from 'react';
import { getAdopters, getVeterinarians } from '../services/adoptionLookupService';
import { getErrorMessage } from '../services/apiError';
import { getPets } from '../services/petService';

export default function useAdoptionOptions() {
  const [state, setState] = useState({
    pets: [],
    adopters: [],
    veterinarians: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    Promise.all([getPets(), getAdopters(), getVeterinarians()])
      .then(([pets, adopters, veterinarians]) => {
        if (active) setState({ pets, adopters, veterinarians, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({
            pets: [],
            adopters: [],
            veterinarians: [],
            loading: false,
            error: getErrorMessage(error),
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
