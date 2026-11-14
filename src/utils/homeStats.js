export const FEATURED_PETS_LIMIT = 4;

export function getAvailablePets(pets) {
  return pets.filter((pet) => pet.available);
}

export function getFeaturedPets(pets, limit = FEATURED_PETS_LIMIT) {
  return getAvailablePets(pets).slice(0, limit);
}

export function getHomeStats(pets, shelters) {
  return {
    availablePets: getAvailablePets(pets).length,
    totalPets: pets.length,
    shelters: shelters.length,
  };
}