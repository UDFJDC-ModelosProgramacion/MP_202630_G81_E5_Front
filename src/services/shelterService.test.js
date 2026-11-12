import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import {
  getShelters,
  getShelter,
  createShelter,
  updateShelter,
  deleteShelter,
} from './shelterService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('shelterService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista los refugios', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getShelters()).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/shelters');
  });

  it('consulta un refugio por id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2, shelterEvents: [] } });
    expect(await getShelter(2)).toEqual({ id: 2, shelterEvents: [] });
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/2');
  });

  it('crea un refugio', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 3 } });
    expect(await createShelter({ name: 'Huellitas', city: 'Bogotá' })).toEqual({ id: 3 });
    expect(apiClient.post).toHaveBeenCalledWith('/shelters', { name: 'Huellitas', city: 'Bogotá' });
  });

  it('actualiza un refugio', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 3 } });
    await updateShelter(3, { name: 'Nuevo', city: 'Cali' });
    expect(apiClient.put).toHaveBeenCalledWith('/shelters/3', { name: 'Nuevo', city: 'Cali' });
  });

  it('elimina un refugio', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteShelter(4);
    expect(apiClient.delete).toHaveBeenCalledWith('/shelters/4');
  });
});