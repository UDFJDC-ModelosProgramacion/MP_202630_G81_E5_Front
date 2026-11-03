import { describePhotoOwner, PHOTO_OWNER } from '../utils/photoOwners';

export const EMPTY_PHOTO_FORM = { target: '', url: '' };

export function toTargetValue(owner, ownerId) {
  return `${owner}:${ownerId}`;
}

export function parseTargetValue(value) {
  const [owner, id] = String(value ?? '').split(':');
  const validOwner = Object.values(PHOTO_OWNER).includes(owner);
  if (!validOwner || !id || Number.isNaN(Number(id))) return null;
  return { owner, ownerId: Number(id) };
}

export function buildPhotoTargets({ pet = null, shelter = null } = {}) {
  const targets = [];
  if (pet) {
    targets.push({
      value: toTargetValue(PHOTO_OWNER.PET, pet.id),
      label: describePhotoOwner(PHOTO_OWNER.PET, pet),
    });
  }
  if (shelter) {
    targets.push({
      value: toTargetValue(PHOTO_OWNER.SHELTER, shelter.id),
      label: describePhotoOwner(PHOTO_OWNER.SHELTER, shelter),
    });
  }
  return targets;
}

export function buildPhotoPayload(form) {
  const url = form.url.trim();
  const target = parseTargetValue(form.target);
  if (!target) return { url };
  const key = target.owner === PHOTO_OWNER.PET ? 'pet' : 'shelter';
  return { url, [key]: { id: target.ownerId } };
}


export function buildPhotoUpdatePayload(form) {
  return { url: form.url.trim() };
}

export function photoToFormValues(photo, target) {
  return { target, url: photo.url ?? '' };
}

export function buildOwnerTargets(owner, entity) {
  return owner === PHOTO_OWNER.PET
    ? buildPhotoTargets({ pet: entity, shelter: entity.shelter })
    : buildPhotoTargets({ shelter: entity });
}