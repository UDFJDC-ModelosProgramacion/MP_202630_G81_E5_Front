import apiClient from './apiClient';

const recordUrl = (petId) => `/pets/${petId}/vaccinationRecord`;

export async function getVaccinationRecord(petId) {
  const { data } = await apiClient.get(recordUrl(petId));
  return data;
}

export async function createVaccinationRecord(petId, record) {
  const { data } = await apiClient.post(recordUrl(petId), record);
  return data;
}

export async function updateVaccinationRecord(petId, record) {
  const { data } = await apiClient.put(recordUrl(petId), record);
  return data;
}

export async function deleteVaccinationRecord(petId) {
  await apiClient.delete(recordUrl(petId));
}