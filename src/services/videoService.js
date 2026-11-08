import apiClient from './apiClient';

const videosUrl = (shelterId) => `/shelters/${shelterId}/videos`;

export async function getVideos(shelterId) {
  const { data } = await apiClient.get(videosUrl(shelterId));
  return data;
}

export async function getVideo(shelterId, videoId) {
  const { data } = await apiClient.get(`${videosUrl(shelterId)}/${videoId}`);
  return data;
}

export async function createVideo(shelterId, video) {
  const { data } = await apiClient.post(videosUrl(shelterId), video);
  return data;
}

export async function updateVideo(shelterId, videoId, video) {
  const { data } = await apiClient.put(`${videosUrl(shelterId)}/${videoId}`, video);
  return data;
}

export async function deleteVideo(shelterId, videoId) {
  await apiClient.delete(`${videosUrl(shelterId)}/${videoId}`);
}