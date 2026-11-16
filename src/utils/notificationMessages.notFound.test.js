import { describe, expect, it } from 'vitest';
import { isNotFoundNotification } from './notificationMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

describe('isNotFoundNotification', () => {
  it('es verdadero cuando el back no encuentra la notificación', () => {
    expect(
      isNotFoundNotification(apiError(404, 'The notification with the given id was not found')),
    ).toBe(true);
  });

  it('es falso cuando lo que no existe es el refugio', () => {
    expect(
      isNotFoundNotification(apiError(404, 'The shelter with the given id was not found')),
    ).toBe(false);
  });

  it('es falso con otros códigos y sin respuesta', () => {
    expect(isNotFoundNotification(apiError(412, 'Notification data is not valid'))).toBe(false);
    expect(isNotFoundNotification({ request: {} })).toBe(false);
  });
});