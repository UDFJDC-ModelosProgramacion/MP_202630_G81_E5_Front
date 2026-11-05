import apiClient from './apiClient';

const PHOTOS_URL = '/photos';
const ownerPhotosUrl = (owner, ownerId) => `/${owner}/${ownerId}/photos`;

export async function getPhotos(owner, ownerId) {
  const { data } = await apiClient.get(ownerPhotosUrl(owner, ownerId));
  return data;
}

export async function getPhoto(owner, ownerId, photoId) {
  const { data } = await apiClient.get(`${ownerPhotosUrl(owner, ownerId)}/${photoId}`);
  return data;
}

export async function createPhoto(photo) {
  const { data } = await apiClient.post(PHOTOS_URL, photo);
  return data;
}

export async function updatePhoto(owner, ownerId, photoId, photo) {
  const { data } = await apiClient.put(`${ownerPhotosUrl(owner, ownerId)}/${photoId}`, photo);
  return data;
}

export async function deletePhoto(owner, ownerId, photoId) {
  await apiClient.delete(`${ownerPhotosUrl(owner, ownerId)}/${photoId}`);
}