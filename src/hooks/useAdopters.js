import { useCallback, useEffect, useState } from 'react';
import { getAdopters } from '../services/adopterService';
import { getErrorMessage } from '../services/apiError';

export default function useAdopters() {
const [state, setState] = useState({ adopters: [], loading: true, error: null });
const [reloadKey, setReloadKey] = useState(0);

useEffect(() => {
    let active = true;
    getAdopters()
    .then((adopters) => {
        if (active) setState({ adopters, loading: false, error: null });
    })
    .catch((error) => {
        if (active) setState({ adopters: [], loading: false, error: getErrorMessage(error) });
    });
    return () => {
    active = false;
    };
}, [reloadKey]);

const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
}, []);

const removeAdopter = useCallback((id) => {
    setState((prev) => ({
    ...prev,
    adopters: prev.adopters.filter((adopter) => adopter.id !== id),
    }));
}, []);

return { ...state, reload, removeAdopter };
}
