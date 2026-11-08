import { useEffect, useState } from 'react';
import { getVideo } from '../services/videoService';
import { getVideoErrorMessage } from '../utils/videoMessages';

export default function useVideo(shelterId, videoId) {
  const [state, setState] = useState({ video: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    getVideo(shelterId, videoId)
      .then((video) => {
        if (active) setState({ video, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ video: null, loading: false, error: getVideoErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [shelterId, videoId]);

  return state;
}