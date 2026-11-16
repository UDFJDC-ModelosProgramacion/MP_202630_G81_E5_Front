import apiClient from './apiClient';

const notificationsUrl = (shelterId) => `/shelters/${shelterId}/notifications`;

export async function getNotifications(shelterId) {
  const { data } = await apiClient.get(notificationsUrl(shelterId));
  return data;
}

export async function getNotification(shelterId, notificationId) {
  const { data } = await apiClient.get(`${notificationsUrl(shelterId)}/${notificationId}`);
  return data;
}

export async function createNotification(shelterId, notification) {
  const { data } = await apiClient.post(notificationsUrl(shelterId), notification);
  return data;
}

export async function updateNotification(shelterId, notificationId, notification) {
  const { data } = await apiClient.put(`${notificationsUrl(shelterId)}/${notificationId}`, notification);
  return data;
}

export async function deleteNotification(shelterId, notificationId) {
  await apiClient.delete(`${notificationsUrl(shelterId)}/${notificationId}`);
}