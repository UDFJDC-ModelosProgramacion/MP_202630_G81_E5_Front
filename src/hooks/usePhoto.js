import { useEffect, useState } from 'react';
import { isNotFound } from '../services/apiError';
import { getPhotoOwner } from '../services/photoOwnerService';
import { getPhoto } from '../services/photoService';
import { getPhotoErrorMessage } from '../utils/photoMessages';

const LOADING = { entity: null, photo: null, error: null, notFound: false, loading: true };

export default function usePhoto(owner, id, photoId) {
  const requestKey = `${owner}:${id}:${photoId}`;
  const [state, setState] = useState({
    key: null,
    entity: null,
    photo: null,
    error: null,
    notFound: false,
  });

  useEffect(() => {
    let active = true;
    Promise.all([getPhotoOwner(owner, id), getPhoto(owner, id, photoId)])
      .then(([entity, photo]) => {
        if (active) setState({ key: requestKey, entity, photo, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            key: requestKey,
            entity: null,
            photo: null,
            error: getPhotoErrorMessage(error, owner),
            notFound: isNotFound(error),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [owner, id, photoId, requestKey]);

  if (state.key !== requestKey) return LOADING;
  return { ...state, loading: false };
}