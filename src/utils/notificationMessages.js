import { getErrorMessage } from '../services/apiError';

const BACK_MESSAGES = {
  'The shelter with the given id was not found': 'Refugio no encontrado.',
  'Shelter is not valid': 'Refugio no encontrado.',
  'The notification with the given id was not found': 'Notificación no encontrada.',
  'Notification data is not valid': 'El mensaje es obligatorio.',
  'Notification channel must be EMAIL, SMS or PUSH': 'El canal debe ser EMAIL, SMS o PUSH.',
  'The notification is not associated to the shelter': 'La notificación pertenece a otro refugio.',
};

export function getNotificationErrorMessage(error) {
  const backMessage = error?.response?.data?.apierror?.message;
  return BACK_MESSAGES[backMessage] ?? getErrorMessage(error);
}
export const NOTIFICATION_NOT_FOUND_MESSAGE = 'Notificación no encontrada.';

export function isNotFoundNotification(error) {
  return (
    error?.response?.status === 404 &&
    getNotificationErrorMessage(error) === NOTIFICATION_NOT_FOUND_MESSAGE
  );
}