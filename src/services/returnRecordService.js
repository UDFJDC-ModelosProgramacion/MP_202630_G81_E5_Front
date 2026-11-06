import apiClient from './apiClient';

const returnRecordUrl = (adoptionId) => `/adoptions/${adoptionId}/returnRecord`;

export async function getReturnRecord(adoptionId) {
  const { data } = await apiClient.get(returnRecordUrl(adoptionId));
  return data;
}

export async function createReturnRecord(adoptionId, returnRecord) {
  const { data } = await apiClient.post(returnRecordUrl(adoptionId), returnRecord);
  return data;
}

export async function updateReturnRecord(adoptionId, returnRecord) {
  const { data } = await apiClient.put(returnRecordUrl(adoptionId), returnRecord);
  return data;
}

export async function deleteReturnRecord(adoptionId) {
  await apiClient.delete(returnRecordUrl(adoptionId));
}
