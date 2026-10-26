import apiClient from './apiClient';

export async function getShelters() {
  const { data } = await apiClient.get('/shelters');
  return data;
}