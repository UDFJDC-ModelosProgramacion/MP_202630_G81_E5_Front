export const PHOTO_OWNER = { PET: 'pets', SHELTER: 'shelters' };

export const PHOTO_OWNER_INFO = {
  [PHOTO_OWNER.PET]: {
    section: 'Mascotas',
    basePath: '/mascotas',
    tabLabel: 'Fotos de la mascota',
  },
  [PHOTO_OWNER.SHELTER]: {
    section: 'Refugios',
    basePath: '/refugios',
    tabLabel: 'Fotos del refugio',
  },
};

export function photosPath(owner, ownerId) {
  return `${PHOTO_OWNER_INFO[owner].basePath}/${ownerId}/fotos`;
}

export function describePhotoOwner(owner, entity) {
  return owner === PHOTO_OWNER.PET
    ? `${entity.name} · ${entity.species}`
    : `${entity.name} · Refugio`;
}

export function buildPhotoTabs(owner, entity) {
  const tabs = [
    { label: PHOTO_OWNER_INFO[owner].tabLabel, to: photosPath(owner, entity.id), active: true },
  ];
  if (owner === PHOTO_OWNER.PET && entity.shelter) {
    tabs.push({
      label: PHOTO_OWNER_INFO[PHOTO_OWNER.SHELTER].tabLabel,
      to: photosPath(PHOTO_OWNER.SHELTER, entity.shelter.id),
      active: false,
    });
  }
  return tabs;
}