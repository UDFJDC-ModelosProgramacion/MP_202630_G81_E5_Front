import { DEFAULT_NOTIFICATION_CHANNEL } from '../utils/notificationOptions';

export const EMPTY_NOTIFICATION_FORM = { channel: DEFAULT_NOTIFICATION_CHANNEL, message: '' };

export function notificationToFormValues(notification) {
  return {
    channel: notification.channel ?? DEFAULT_NOTIFICATION_CHANNEL,
    message: notification.message ?? '',
  };
}

// El back guarda solo la fecha: a mediodía UTC no retrocede un día.
export function todayAtNoonUtc(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T12:00:00.000Z`;
}

export function buildNotificationPayload(form, existingNotification = {}) {
  return {
    ...(existingNotification.id !== undefined && { id: existingNotification.id }),
    channel: form.channel,
    message: form.message.trim(),
    date: existingNotification.date ?? todayAtNoonUtc(),
  };
}