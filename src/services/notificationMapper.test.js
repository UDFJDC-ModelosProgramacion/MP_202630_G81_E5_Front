import { describe, expect, it } from 'vitest';
import {
  buildNotificationPayload,
  EMPTY_NOTIFICATION_FORM,
  notificationToFormValues,
  todayAtNoonUtc,
} from './notificationMapper';

describe('notificationMapper', () => {
  it('el formulario vacío empieza en EMAIL', () => {
    expect(EMPTY_NOTIFICATION_FORM).toEqual({ channel: 'EMAIL', message: '' });
  });

  it('convierte una notificación a valores del formulario', () => {
    expect(notificationToFormValues({ channel: 'SMS', message: 'Hola' })).toEqual({
      channel: 'SMS',
      message: 'Hola',
    });
  });

  it('usa valores por defecto si faltan campos', () => {
    expect(notificationToFormValues({})).toEqual({ channel: 'EMAIL', message: '' });
  });

  it('formatea hoy a mediodía UTC', () => {
    expect(todayAtNoonUtc(new Date(2026, 10, 5))).toBe('2026-11-05T12:00:00.000Z');
  });

  it('al crear arma el payload con fecha de hoy y mensaje recortado', () => {
    const payload = buildNotificationPayload({ channel: 'PUSH', message: '  Hola  ' });
    expect(payload.channel).toBe('PUSH');
    expect(payload.message).toBe('Hola');
    expect(payload.date).toMatch(/^\d{4}-\d{2}-\d{2}T12:00:00\.000Z$/);
    expect('id' in payload).toBe(false);
  });

  it('al editar conserva el id y la fecha existentes', () => {
    const existing = { id: 4, date: '2026-01-02T12:00:00.000Z' };
    expect(buildNotificationPayload({ channel: 'SMS', message: 'Nuevo' }, existing)).toEqual({
      id: 4,
      channel: 'SMS',
      message: 'Nuevo',
      date: '2026-01-02T12:00:00.000Z',
    });
  });
});