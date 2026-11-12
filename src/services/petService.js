import apiClient from './apiClient';

const PETS_URL = '/pets';

export async function getPets() {
  const { data } = await apiClient.get(PETS_URL);
  return data;
}

export async function getPet(id) {
  const { data } = await apiClient.get(`${PETS_URL}/${id}`);
  return data;
}

export async function createPet(pet) {
  const { data } = await apiClient.post(PETS_URL, pet);
  return data;
}

export async function updatePet(id, pet) {
  const { data } = await apiClient.put(`${PETS_URL}/${id}`, pet);
  return data;
}

export async function deletePet(id) {
  await apiClient.delete(`${PETS_URL}/${id}`);
}