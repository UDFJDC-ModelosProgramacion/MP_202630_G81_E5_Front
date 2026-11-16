import { describe, expect, it } from 'vitest';
import { validateNotification } from './notificationValidation';

describe('validateNotification', () => {
  it('acepta EMAIL, SMS y PUSH con mensaje', () => {
    ['EMAIL', 'SMS', 'PUSH'].forEach((channel) => {
      expect(validateNotification({ channel, message: 'Hola' })).toEqual({});
    });
  });

  it('rechaza un canal inválido', () => {
    expect(validateNotification({ channel: 'FAX', message: 'Hola' }).channel).toBeTruthy();
  });

  it('rechaza un canal vacío', () => {
    expect(validateNotification({ channel: '', message: 'Hola' }).channel).toBeTruthy();
  });

  it('rechaza un mensaje vacío, nulo o solo con espacios', () => {
    ['', '   ', undefined, null].forEach((message) => {
      expect(validateNotification({ channel: 'EMAIL', message }).message).toBe(
        'El mensaje es obligatorio.',
      );
    });
  });
});