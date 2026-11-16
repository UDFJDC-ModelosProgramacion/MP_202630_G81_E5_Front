import { describe, expect, it } from 'vitest';
import { sortLifeEventsByDate } from './lifeEventSort';

describe('sortLifeEventsByDate', () => {
  it('ordena del más reciente al más antiguo', () => {
    const events = [
      { id: 1, date: '2026-01-15T00:00:00.000+00:00' },
      { id: 2, date: '2026-05-10T00:00:00.000+00:00' },
      { id: 3, date: '2026-03-02T00:00:00.000+00:00' },
    ];
    expect(sortLifeEventsByDate(events).map((event) => event.id)).toEqual([2, 3, 1]);
  });

  it('desempata por id, el último registrado primero', () => {
    const events = [
      { id: 1, date: '2026-05-10' },
      { id: 4, date: '2026-05-10' },
    ];
    expect(sortLifeEventsByDate(events).map((event) => event.id)).toEqual([4, 1]);
  });

  it('deja los eventos sin fecha al final', () => {
    const events = [
      { id: 1, date: null },
      { id: 2, date: '2026-05-10' },
    ];
    expect(sortLifeEventsByDate(events).map((event) => event.id)).toEqual([2, 1]);
  });

  it('no modifica la lista original', () => {
    const events = [
      { id: 1, date: '2026-01-15' },
      { id: 2, date: '2026-05-10' },
    ];
    sortLifeEventsByDate(events);
    expect(events.map((event) => event.id)).toEqual([1, 2]);
  });
});