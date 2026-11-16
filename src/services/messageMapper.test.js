import { describe, it, expect } from 'vitest';
import { buildMessagePayload, EMPTY_MESSAGE_FORM, messageToFormValues } from './messageMapper';

describe('EMPTY_MESSAGE_FORM', () => {
  it('empieza con el contenido vacío', () => {
    expect(EMPTY_MESSAGE_FORM).toEqual({ content: '' });
  });
});

describe('buildMessagePayload', () => {
  const now = new Date('2026-11-06T22:00:00.000Z');

  it('recorta el contenido y envía la fecha un minuto antes de ahora', () => {
    expect(buildMessagePayload({ content: '  Hola, quiero adoptar  ' }, now)).toEqual({
      content: 'Hola, quiero adoptar',
      sentDate: '2026-11-06T21:59:00.000Z',
    });
  });

  it('envía contenido vacío si el formulario no trae contenido', () => {
    expect(buildMessagePayload({}, now).content).toBe('');
  });

  it('usa la hora actual cuando no se le pasa una fecha', () => {
    const before = Date.now();
    const payload = buildMessagePayload({ content: 'Hola' });
    const sent = new Date(payload.sentDate).getTime();
    expect(sent).toBeLessThan(before);
    expect(sent).toBeGreaterThan(before - 120000);
  });
});

describe('messageToFormValues', () => {
  it('convierte un mensaje en valores de formulario', () => {
    expect(messageToFormValues({ id: 1, content: 'Hola', sentDate: '2026-11-06' })).toEqual({
      content: 'Hola',
    });
  });

  it('usa contenido vacío si faltan datos', () => {
    expect(messageToFormValues({ content: null })).toEqual({ content: '' });
    expect(messageToFormValues(undefined)).toEqual({ content: '' });
  });
});