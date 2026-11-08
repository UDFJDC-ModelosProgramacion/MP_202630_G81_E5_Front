import { useCallback, useEffect, useState } from 'react';
import { getVideos } from '../services/videoService';
import { getVideoErrorMessage } from '../utils/videoMessages';

const LOADING = { videos: [], loading: true, error: null };

export default function useVideos(shelterId) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${shelterId}:${reloadKey}`;
  const [state, setState] = useState({ key: null, videos: [], error: null });

  useEffect(() => {
    let active = true;
    getVideos(shelterId)
      .then((videos) => {
        if (active) setState({ key: requestKey, videos, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({ key: requestKey, videos: [], error: getVideoErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [shelterId, requestKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const setVideos = useCallback((update) => {
    setState((prev) => ({ ...prev, videos: update(prev.videos) }));
  }, []);
  const actions = { reload, setVideos };

  if (state.key !== requestKey) return { ...LOADING, ...actions };
  return { videos: state.videos, loading: false, error: state.error, ...actions };
}