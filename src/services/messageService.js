import apiClient from './apiClient';

const messagesUrl = (adopterId) => `/adopters/${adopterId}/messages`;

export async function getMessages(adopterId) {
  const { data } = await apiClient.get(messagesUrl(adopterId));
  return data;
}

export async function getMessage(adopterId, messageId) {
  const { data } = await apiClient.get(`${messagesUrl(adopterId)}/${messageId}`);
  return data;
}

export async function createMessage(adopterId, message) {
  const { data } = await apiClient.post(messagesUrl(adopterId), message);
  return data;
}

export async function updateMessage(adopterId, messageId, message) {
  const { data } = await apiClient.put(`${messagesUrl(adopterId)}/${messageId}`, message);
  return data;
}

export async function deleteMessage(adopterId, messageId) {
  await apiClient.delete(`${messagesUrl(adopterId)}/${messageId}`);
}