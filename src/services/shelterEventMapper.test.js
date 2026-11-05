import { describe, it, expect } from 'vitest';
import { buildEventPayload, EMPTY_EVENT_FORM, eventToFormValues } from './shelterEventMapper';

describe('buildEventPayload', () => {
  it('limpia espacios y envía la fecha al mediodía UTC', () => {
    expect(buildEventPayload({ title: '  Jornada ', date: '2026-11-20', type: ' Feria ' })).toEqual({
      title: 'Jornada',
      date: '2026-11-20T12:00:00.000Z',
      type: 'Feria',
    });
  });

  it('envía el tipo como null cuando está vacío', () => {
    expect(buildEventPayload({ title: 'Jornada', date: '2026-11-20', type: '  ' }).type).toBeNull();
  });

  it('envía la fecha como null cuando no hay fecha', () => {
    expect(buildEventPayload({ title: 'Jornada', date: '', type: '' }).date).toBeNull();
  });
});

describe('eventToFormValues', () => {
  it('convierte un evento del back en valores de formulario sin cambiar el día', () => {
    expect(
      eventToFormValues({ id: 1, title: 'Jornada', date: '2026-11-05T05:00:00.000+00:00', type: 'Feria' }),
    ).toEqual({ title: 'Jornada', date: '2026-11-05', type: 'Feria' });
  });

  it('usa texto vacío cuando faltan datos', () => {
    expect(eventToFormValues({})).toEqual({ title: '', date: '', type: '' });
  });

  it('expone un formulario vacío', () => {
    expect(EMPTY_EVENT_FORM).toEqual({ title: '', date: '', type: '' });
  });
});