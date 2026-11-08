import { useEffect, useState } from 'react';
import { getShelters } from '../services/shelterService';

// Refugios para el select. Si falla la carga, el select usa solo el refugio actual.
export default function useVideoShelters() {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    let active = true;
    getShelters()
      .then((list) => {
        if (active) setShelters(list);
      })
      .catch(() => {
        if (active) setShelters([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return shelters;
}