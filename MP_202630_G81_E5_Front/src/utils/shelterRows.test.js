import { describe, it, expect } from 'vitest';
import { buildShelterRows } from './shelterRows';

describe('buildShelterRows', () => {
  const shelters = [
    { id: 1, name: 'Huellitas', city: 'Bogotá', shelterEvents: [{ id: 10 }, { id: 11 }] },
    { id: 2, name: 'Patitas', city: 'Cali', shelterEvents: [] },
    { id: 3, name: 'Sin datos', city: 'Cúcuta' },
  ];
  const pets = [
    { id: 1, shelter: { id: 1 } },
    { id: 2, shelter: { id: 1 } },
    { id: 3, shelter: { id: 2 } },
    { id: 4 },
  ];

  it('cuenta las mascotas de cada refugio', () => {
    const rows = buildShelterRows(shelters, pets);
    expect(rows.map((row) => row.petsCount)).toEqual([2, 1, 0]);
  });

  it('cuenta los eventos de cada refugio', () => {
    const rows = buildShelterRows(shelters, pets);
    expect(rows.map((row) => row.eventsCount)).toEqual([2, 0, 0]);
  });

  it('conserva los datos originales del refugio', () => {
    const [first] = buildShelterRows(shelters, pets);
    expect(first).toMatchObject({ id: 1, name: 'Huellitas', city: 'Bogotá' });
  });

  it('devuelve una lista vacía si no hay refugios', () => {
    expect(buildShelterRows([], pets)).toEqual([]);
  });
});