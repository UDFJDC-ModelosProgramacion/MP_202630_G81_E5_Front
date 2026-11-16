import apiClient from './apiClient';

const eventsUrl = (shelterId) => `/shelters/${shelterId}/shelterEvents`;

export async function getShelterEvents(shelterId) {
  const { data } = await apiClient.get(eventsUrl(shelterId));
  return data;
}

export async function getShelterEvent(shelterId, eventId) {
  const { data } = await apiClient.get(`${eventsUrl(shelterId)}/${eventId}`);
  return data;
}

export async function createShelterEvent(shelterId, event) {
  const { data } = await apiClient.post(eventsUrl(shelterId), event);
  return data;
}

export async function updateShelterEvent(shelterId, eventId, event) {
  const { data } = await apiClient.put(`${eventsUrl(shelterId)}/${eventId}`, event);
  return data;
}

export async function deleteShelterEvent(shelterId, eventId) {
  await apiClient.delete(`${eventsUrl(shelterId)}/${eventId}`);
}