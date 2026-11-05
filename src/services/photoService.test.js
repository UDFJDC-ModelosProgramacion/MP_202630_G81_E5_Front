import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import { createPhoto, deletePhoto, getPhoto, getPhotos, updatePhoto } from './photoService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('photoService', () => {
  it('lista las fotos de una mascota', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getPhotos('pets', 7)).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/pets/7/photos');
  });

  it('lista las fotos de un refugio', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    expect(await getPhotos('shelters', 2)).toEqual([]);
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/2/photos');
  });

  it('consulta una foto por su destino', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 3 } });
    expect(await getPhoto('pets', 7, 3)).toEqual({ id: 3 });
    expect(apiClient.get).toHaveBeenCalledWith('/pets/7/photos/3');
  });

  it('crea una foto en /photos', async () => {
    const photo = { url: 'https://x.co/a.jpg', pet: { id: 7 } };
    apiClient.post.mockResolvedValue({ data: { id: 9, ...photo } });
    expect(await createPhoto(photo)).toEqual({ id: 9, ...photo });
    expect(apiClient.post).toHaveBeenCalledWith('/photos', photo);
  });

  it('edita una foto de un refugio', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 3, url: 'https://x.co/b.jpg' } });
    const result = await updatePhoto('shelters', 2, 3, { url: 'https://x.co/b.jpg' });
    expect(result.url).toBe('https://x.co/b.jpg');
    expect(apiClient.put).toHaveBeenCalledWith('/shelters/2/photos/3', { url: 'https://x.co/b.jpg' });
  });

  it('elimina una foto de una mascota', async () => {
    apiClient.delete.mockResolvedValue({});
    await deletePhoto('pets', 7, 3);
    expect(apiClient.delete).toHaveBeenCalledWith('/pets/7/photos/3');
  });

  it('propaga los errores sin manejarlos', async () => {
    const error = { response: { status: 404 } };
    apiClient.get.mockRejectedValue(error);
    await expect(getPhotos('pets', 1)).rejects.toBe(error);
  });
});