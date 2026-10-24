import { describe, it, expect } from 'vitest';
import { filterAdoptions } from './adoptionFilters';

const adoptions = [
  { id: 1, status: 'IN_PROGRESS', pet: { name: 'Firulais' }, adopter: { name: 'Laura Gómez' } },
  { id: 2, status: 'APPROVED', pet: { name: 'Michi' }, adopter: { name: 'Carlos Pérez' } },
  { id: 3, status: 'RETURNED', pet: { name: 'Luna' }, adopter: { name: 'Ana Torres' } },
  { id: 4, status: 'APPROVED', pet: { name: 'Rocky' }, adopter: { name: 'Diego Ramírez' } },
];

const ids = (list) => list.map((adoption) => adoption.id);

describe('filterAdoptions', () => {
  it('devuelve todas las adopciones sin filtros', () => {
    expect(ids(filterAdoptions(adoptions))).toEqual([1, 2, 3, 4]);
    expect(ids(filterAdoptions(adoptions, '   ', ''))).toEqual([1, 2, 3, 4]);
  });

  it('filtra por estado', () => {
    expect(ids(filterAdoptions(adoptions, '', 'APPROVED'))).toEqual([2, 4]);
  });

  it('busca por el nombre de la mascota', () => {
    expect(ids(filterAdoptions(adoptions, 'lun'))).toEqual([3]);
  });

  it('busca por el nombre del adoptante', () => {
    expect(ids(filterAdoptions(adoptions, 'torres'))).toEqual([3]);
  });

  it('ignora mayúsculas y tildes', () => {
    expect(ids(filterAdoptions(adoptions, 'GOMEZ'))).toEqual([1]);
    expect(ids(filterAdoptions(adoptions, 'ramirez'))).toEqual([4]);
  });

  it('combina búsqueda y estado', () => {
    expect(ids(filterAdoptions(adoptions, 'rocky', 'APPROVED'))).toEqual([4]);
    expect(filterAdoptions(adoptions, 'rocky', 'RETURNED')).toEqual([]);
  });

  it('devuelve una lista vacía cuando nada coincide', () => {
    expect(filterAdoptions(adoptions, 'zzz')).toEqual([]);
  });

  it('tolera adopciones sin mascota o sin adoptante', () => {
    const incomplete = [{ id: 9, status: 'IN_PROGRESS', pet: null, adopter: null }];
    expect(filterAdoptions(incomplete, 'luna')).toEqual([]);
    expect(ids(filterAdoptions(incomplete, ''))).toEqual([9]);
  });
});
