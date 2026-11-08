import { describe, it, expect } from 'vitest';
import {
  EVENT_STATUS,
  formatEventDate,
  getEventStatus,
  isPastEvent,
  todayInputValue,
} from './eventDates';

const now = new Date(2026, 10, 4, 15, 0);

describe('todayInputValue', () => {
  it('devuelve el día local con ceros a la izquierda', () => {
    expect(todayInputValue(now)).toBe('2026-11-04');
    expect(todayInputValue(new Date(2026, 0, 5, 9, 0))).toBe('2026-01-05');
  });
});

describe('isPastEvent', () => {
  it('es verdadero cuando el evento fue antes de hoy', () => {
    expect(isPastEvent({ date: '2026-11-03T05:00:00.000+00:00' }, now)).toBe(true);
  });

  it('es falso cuando el evento es hoy', () => {
    expect(isPastEvent({ date: '2026-11-04T05:00:00.000+00:00' }, now)).toBe(false);
  });

  it('es falso cuando el evento es futuro', () => {
    expect(isPastEvent({ date: '2026-11-05T05:00:00.000+00:00' }, now)).toBe(false);
  });

  it('es falso cuando no hay fecha', () => {
    expect(isPastEvent({}, now)).toBe(false);
  });
});

describe('getEventStatus', () => {
  it('marca como Realizado un evento pasado', () => {
    expect(getEventStatus({ date: '2026-10-01T05:00:00.000+00:00' }, now)).toBe(EVENT_STATUS.DONE);
  });

  it('marca como Próximo un evento futuro', () => {
    expect(getEventStatus({ date: '2026-12-01T05:00:00.000+00:00' }, now)).toBe(EVENT_STATUS.UPCOMING);
  });
});

describe('formatEventDate', () => {
  it('muestra la fecha sin cambiar de día', () => {
    expect(formatEventDate('2026-11-05T05:00:00.000+00:00')).toBe('05 nov 2026');
  });

  it('muestra una raya cuando no hay fecha', () => {
    expect(formatEventDate('')).toBe('—');
  });
});