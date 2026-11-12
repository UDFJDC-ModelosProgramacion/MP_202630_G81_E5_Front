import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPhotoOwner } from './photoOwnerService';
import { getPet } from './petService';
import { getShelter } from './shelterService';

vi.mock('./petService', () => ({ getPet: vi.fn() }));
vi.mock('./shelterService', () => ({ getShelter: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('photoOwnerService', () => {
  it('consulta la mascota dueña de las fotos', async () => {
    getPet.mockResolvedValue({ id: 1 });
    expect(await getPhotoOwner('pets', 1)).toEqual({ id: 1 });
    expect(getPet).toHaveBeenCalledWith(1);
  });

  it('consulta el refugio dueño de las fotos', async () => {
    getShelter.mockResolvedValue({ id: 2 });
    expect(await getPhotoOwner('shelters', 2)).toEqual({ id: 2 });
    expect(getShelter).toHaveBeenCalledWith(2);
  });
});