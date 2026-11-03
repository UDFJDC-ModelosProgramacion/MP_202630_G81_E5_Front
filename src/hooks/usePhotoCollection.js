import { useCallback, useEffect, useState } from 'react';
import { isNotFound } from '../services/apiError';
import { getPhotoOwner } from '../services/photoOwnerService';
import { getPhotos } from '../services/photoService';
import { getPhotoErrorMessage } from '../utils/photoMessages';

const LOADING = { entity: null, photos: [], error: null, notFound: false, loading: true };

export default function usePhotoCollection(owner, id) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${owner}:${id}:${reloadCount}`;
  const [state, setState] = useState({
    key: null,
    entity: null,
    photos: [],
    error: null,
    notFound: false,
  });

  useEffect(() => {
    let active = true;
    Promise.all([getPhotoOwner(owner, id), getPhotos(owner, id)])
      .then(([entity, photos]) => {
        if (active) setState({ key: requestKey, entity, photos, error: null, notFound: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            key: requestKey,
            entity: null,
            photos: [],
            error: getPhotoErrorMessage(error, owner),
            notFound: isNotFound(error),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [owner, id, requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const addPhoto = useCallback(
    (photo) => setState((prev) => ({ ...prev, photos: [...prev.photos, photo] })),
    [],
  );
  const replacePhoto = useCallback(
    (photo) =>
      setState((prev) => ({
        ...prev,
        photos: prev.photos.map((item) => (item.id === photo.id ? photo : item)),
      })),
    [],
  );
  const actions = { reload, addPhoto, replacePhoto };

  if (state.key !== requestKey) return { ...LOADING, ...actions };
  return { ...state, loading: false, ...actions };
}