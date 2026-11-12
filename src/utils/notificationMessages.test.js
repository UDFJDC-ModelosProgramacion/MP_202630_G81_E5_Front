import { describe, expect, it } from 'vitest';
import { getNotificationErrorMessage } from './notificationMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

describe('getNotificationErrorMessage', () => {
  it.each([
    ['The shelter with the given id was not found', 'Refugio no encontrado.'],
    ['Shelter is not valid', 'Refugio no encontrado.'],
    ['The notification with the given id was not found', 'Notificación no encontrada.'],
    ['Notification data is not valid', 'El mensaje es obligatorio.'],
    ['Notification channel must be EMAIL, SMS or PUSH', 'El canal debe ser EMAIL, SMS o PUSH.'],
    ['The notification is not associated to the shelter', 'La notificación pertenece a otro refugio.'],
  ])('traduce "%s"', (backMessage, expected) => {
    expect(getNotificationErrorMessage(apiError(412, backMessage))).toBe(expected);
  });

  it('usa el mensaje del back si no hay traducción', () => {
    expect(getNotificationErrorMessage(apiError(500, 'Algo raro'))).toBe('Algo raro');
  });

  it('informa los errores de red', () => {
    expect(getNotificationErrorMessage({ request: {} })).toBe(
      'No se pudo conectar con el servidor. Verifica tu conexión.',
    );
  });
});