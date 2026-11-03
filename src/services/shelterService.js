import apiClient from './apiClient';

const SHELTERS_URL = '/shelters';

export async function getShelters() {
  const { data } = await apiClient.get(SHELTERS_URL);
  return data;
}

export async function getShelter(id) {
  const { data } = await apiClient.get(`${SHELTERS_URL}/${id}`);
  return data;
}

export async function createShelter(shelter) {
  const { data } = await apiClient.post(SHELTERS_URL, shelter);
  return data;
}

export async function updateShelter(id, shelter) {
  const { data } = await apiClient.put(`${SHELTERS_URL}/${id}`, shelter);
  return data;
}

export async function deleteShelter(id) {
  await apiClient.delete(`${SHELTERS_URL}/${id}`);
}