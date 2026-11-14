import { describe, expect, it } from 'vitest';
import { FEATURED_PETS_LIMIT, getAvailablePets, getFeaturedPets, getHomeStats } from './homeStats';

const pets = [
  { id: 1, name: 'Luna', available: true },
  { id: 2, name: 'Michi', available: false },
  { id: 3, name: 'Rocky', available: true },
  { id: 4, name: 'Toby', available: true },
  { id: 5, name: 'Mia', available: true },
  { id: 6, name: 'Kira', available: true },
];

describe('homeStats', () => {
  it('filtra solo las mascotas disponibles', () => {
    expect(getAvailablePets(pets).map((pet) => pet.name)).toEqual(['Luna', 'Rocky', 'Toby', 'Mia', 'Kira']);
  });

  it('limita las destacadas al máximo por defecto', () => {
    const featured = getFeaturedPets(pets);
    expect(featured).toHaveLength(FEATURED_PETS_LIMIT);
    expect(featured.map((pet) => pet.name)).toEqual(['Luna', 'Rocky', 'Toby', 'Mia']);
  });

  it('acepta un límite personalizado', () => {
    expect(getFeaturedPets(pets, 2)).toHaveLength(2);
  });

  it('calcula las cifras de la página principal', () => {
    expect(getHomeStats(pets, [{ id: 1 }, { id: 2 }])).toEqual({
      availablePets: 5,
      totalPets: 6,
      shelters: 2,
    });
  });

  it('devuelve ceros sin datos', () => {
    expect(getHomeStats([], [])).toEqual({ availablePets: 0, totalPets: 0, shelters: 0 });
  });
});