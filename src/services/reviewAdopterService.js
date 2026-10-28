import apiClient from './apiClient';

export async function getReviewAdopter(adopterId) {
  const { data } = await apiClient.get(`/adopters/${adopterId}`);
  return data;
}
