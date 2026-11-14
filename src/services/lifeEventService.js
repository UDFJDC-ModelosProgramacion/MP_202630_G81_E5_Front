import apiClient from './apiClient';

const eventsUrl = (petId) => `/pets/${petId}/lifeEvents`;
const eventUrl = (petId, eventId) => `${eventsUrl(petId)}/${eventId}`;

export async function getLifeEvents(petId) {
  const { data } = await apiClient.get(eventsUrl(petId));
  return data;
}

export async function getLifeEvent(petId, eventId) {
  const { data } = await apiClient.get(eventUrl(petId, eventId));
  return data;
}

export async function createLifeEvent(petId, lifeEvent) {
  const { data } = await apiClient.post(eventsUrl(petId), lifeEvent);
  return data;
}

export async function updateLifeEvent(petId, eventId, lifeEvent) {
  const { data } = await apiClient.put(eventUrl(petId, eventId), lifeEvent);
  return data;
}

export async function deleteLifeEvent(petId, eventId) {
  await apiClient.delete(eventUrl(petId, eventId));
}