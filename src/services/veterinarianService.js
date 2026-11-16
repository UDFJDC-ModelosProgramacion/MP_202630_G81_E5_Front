import apiClient from './apiClient';

const VETERINARIANS_URL = '/veterinarians';

export async function getVeterinarians() {
  const { data } = await apiClient.get(VETERINARIANS_URL);
  return data;
}

export async function getVeterinarian(id) {
  const { data } = await apiClient.get(`${VETERINARIANS_URL}/${id}`);
  return data;
}

export async function createVeterinarian(veterinarian) {
  const { data } = await apiClient.post(VETERINARIANS_URL, veterinarian);
  return data;
}

export async function updateVeterinarian(id, veterinarian) {
  const { data } = await apiClient.put(`${VETERINARIANS_URL}/${id}`, veterinarian);
  return data;
}

export async function deleteVeterinarian(id) {
  await apiClient.delete(`${VETERINARIANS_URL}/${id}`);
}