import apiClient from './apiClient';

const ADOPTIONS_URL = '/adoptions';

export async function getAdoptions() {
  const { data } = await apiClient.get(ADOPTIONS_URL);
  return data;
}

export async function getAdoption(id) {
  const { data } = await apiClient.get(`${ADOPTIONS_URL}/${id}`);
  return data;
}

export async function createAdoption(adoption) {
  const { data } = await apiClient.post(ADOPTIONS_URL, adoption);
  return data;
}

export async function updateAdoption(id, adoption) {
  const { data } = await apiClient.put(`${ADOPTIONS_URL}/${id}`, adoption);
  return data;
}

export async function deleteAdoption(id) {
  await apiClient.delete(`${ADOPTIONS_URL}/${id}`);
}
