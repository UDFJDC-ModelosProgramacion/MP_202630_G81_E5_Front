import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import {
  createVeterinarian,
  deleteVeterinarian,
  getVeterinarian,
  getVeterinarians,
  updateVeterinarian,
} from './veterinarianService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('veterinarianService', () => {
  it('getVeterinarians consulta la lista y devuelve data', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getVeterinarians()).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/veterinarians');
  });

  it('getVeterinarian consulta por id y devuelve data', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 3 } });
    expect(await getVeterinarian(3)).toEqual({ id: 3 });
    expect(apiClient.get).toHaveBeenCalledWith('/veterinarians/3');
  });

  it('createVeterinarian envía el cuerpo y devuelve data', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 9 } });
    expect(await createVeterinarian({ name: 'Laura' })).toEqual({ id: 9 });
    expect(apiClient.post).toHaveBeenCalledWith('/veterinarians', { name: 'Laura' });
  });

  it('updateVeterinarian envía el cuerpo por id y devuelve data', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 2 } });
    expect(await updateVeterinarian(2, { name: 'Carlos' })).toEqual({ id: 2 });
    expect(apiClient.put).toHaveBeenCalledWith('/veterinarians/2', { name: 'Carlos' });
  });

  it('deleteVeterinarian elimina por id', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteVeterinarian(4);
    expect(apiClient.delete).toHaveBeenCalledWith('/veterinarians/4');
  });

  it('propaga el error sin manejarlo', async () => {
    const error = { response: { status: 404 } };
    apiClient.get.mockRejectedValue(error);
    await expect(getVeterinarian(99)).rejects.toBe(error);
  });
});