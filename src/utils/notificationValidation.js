import { NOTIFICATION_CHANNELS } from './notificationOptions';

export function validateNotification(values) {
  const errors = {};

  if (!NOTIFICATION_CHANNELS.includes(values.channel)) {
    errors.channel = 'Selecciona un canal válido: EMAIL, SMS o PUSH.';
  }
  if (!values.message?.trim()) {
    errors.message = 'El mensaje es obligatorio.';
  }

  return errors;
}