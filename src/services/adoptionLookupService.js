import apiClient from './apiClient';

export async function getAdopters() {
  const { data } = await apiClient.get('/adopters');
  return data;
}

export async function getVeterinarians() {
  const { data } = await apiClient.get('/veterinarians');
  return data;
}
