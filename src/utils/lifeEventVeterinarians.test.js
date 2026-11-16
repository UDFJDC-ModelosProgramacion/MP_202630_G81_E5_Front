import { describe, expect, it } from 'vitest';
import { formatVeterinarianOption, withCurrentVeterinarian } from './lifeEventVeterinarians';

describe('formatVeterinarianOption', () => {
  it('muestra el nombre y la especialidad', () => {
    expect(formatVeterinarianOption({ name: 'Laura Martínez', specialty: 'Medicina interna' })).toBe(
      'Laura Martínez · Medicina interna',
    );
  });

  it('muestra solo el nombre si falta la especialidad', () => {
    expect(formatVeterinarianOption({ name: 'Laura Martínez' })).toBe('Laura Martínez');
  });
});

describe('withCurrentVeterinarian', () => {
  const list = [{ id: 1 }, { id: 2 }];

  it('devuelve la misma lista sin veterinario actual', () => {
    expect(withCurrentVeterinarian(list, null)).toBe(list);
    expect(withCurrentVeterinarian(list, undefined)).toBe(list);
  });

  it('devuelve la misma lista si ya incluye al veterinario actual', () => {
    expect(withCurrentVeterinarian(list, { id: 2 })).toBe(list);
  });

  it('agrega al veterinario actual cuando falta en la lista', () => {
    expect(withCurrentVeterinarian(list, { id: 9 })).toEqual([{ id: 1 }, { id: 2 }, { id: 9 }]);
    expect(withCurrentVeterinarian([], { id: 9 })).toEqual([{ id: 9 }]);
  });
});