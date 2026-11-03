export function buildShelterRows(shelters, pets) {
  return shelters.map((shelter) => ({
    ...shelter,
    petsCount: pets.filter((pet) => pet.shelter?.id === shelter.id).length,
    eventsCount: shelter.shelterEvents?.length ?? 0,
  }));
}