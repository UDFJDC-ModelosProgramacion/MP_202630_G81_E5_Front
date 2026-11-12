import { PHOTO_OWNER } from '../utils/photoOwners';
import { getPet } from './petService';
import { getShelter } from './shelterService';

const LOADERS = { [PHOTO_OWNER.PET]: getPet, [PHOTO_OWNER.SHELTER]: getShelter };

export function getPhotoOwner(owner, ownerId) {
  return LOADERS[owner](ownerId);
}