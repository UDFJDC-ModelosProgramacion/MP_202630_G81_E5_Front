import { describe, expect, it } from 'vitest';
import {
  getLifeEventTypeOptions,
  getLifeEventTypeVariant,
  LIFE_EVENT_TYPES,
} from './lifeEventOptions';

describe('getLifeEventTypeOptions', () => {
  it('devuelve los tipos base sin tipo actual o con un tipo conocido', () => {
    expect(getLifeEventTypeOptions('')).toEqual(LIFE_EVENT_TYPES);
    expect(getLifeEventTypeOptions(undefined)).toEqual(LIFE_EVENT_TYPES);
    expect(getLifeEventTypeOptions('Control')).toEqual(LIFE_EVENT_TYPES);
  });

  it('agrega el tipo actual cuando no está entre los conocidos', () => {
    expect(getLifeEventTypeOptions('Adopción')).toEqual([...LIFE_EVENT_TYPES, 'Adopción']);
  });
});

describe('getLifeEventTypeVariant', () => {
  it('asigna una variante a cada tipo conocido', () => {
    expect(getLifeEventTypeVariant('Vacunación')).toBe('vaccination');
    expect(getLifeEventTypeVariant('Control')).toBe('checkup');
    expect(getLifeEventTypeVariant('Cirugía')).toBe('surgery');
  });

  it('usa la variante genérica para otros tipos', () => {
    expect(getLifeEventTypeVariant('Adopción')).toBe('other');
    expect(getLifeEventTypeVariant(undefined)).toBe('other');
  });
});