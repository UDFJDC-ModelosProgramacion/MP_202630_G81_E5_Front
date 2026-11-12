import { useEffect, useState } from 'react';
import { getReview } from '../services/reviewService';
import { getReviewErrorMessage } from '../utils/reviewMessages';

export default function useReview(adopterId, reviewId) {
  const [state, setState] = useState({ review: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getReview(adopterId, reviewId)
      .then((review) => {
        if (active) setState({ review, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ review: null, loading: false, error: getReviewErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [adopterId, reviewId]);

  return state;
}
