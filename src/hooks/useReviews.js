import { useCallback, useEffect, useState } from 'react';
import { getReviews } from '../services/reviewService';
import { getReviewErrorMessage } from '../utils/reviewMessages';

export default function useReviews(adopterId) {
  const [state, setState] = useState({ reviews: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getReviews(adopterId)
      .then((reviews) => {
        if (active) setState({ reviews, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ reviews: [], loading: false, error: getReviewErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [adopterId, reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const setReviews = useCallback((update) => {
    setState((prev) => ({ ...prev, reviews: update(prev.reviews) }));
  }, []);

  return { ...state, reload, setReviews };
}
