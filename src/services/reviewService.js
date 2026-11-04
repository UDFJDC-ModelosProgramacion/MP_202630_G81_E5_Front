import apiClient from './apiClient';

const reviewsUrl = (adopterId) => `/adopters/${adopterId}/reviews`;

export async function getReviews(adopterId) {
  const { data } = await apiClient.get(reviewsUrl(adopterId));
  return data;
}

export async function getReview(adopterId, reviewId) {
  const { data } = await apiClient.get(`${reviewsUrl(adopterId)}/${reviewId}`);
  return data;
}

export async function createReview(adopterId, review) {
  const { data } = await apiClient.post(reviewsUrl(adopterId), review);
  return data;
}

export async function updateReview(adopterId, reviewId, review) {
  const { data } = await apiClient.put(`${reviewsUrl(adopterId)}/${reviewId}`, review);
  return data;
}

export async function deleteReview(adopterId, reviewId) {
  await apiClient.delete(`${reviewsUrl(adopterId)}/${reviewId}`);
}
