import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import { getPets, getPet, createPet, updatePet, deletePet } from './petService';
import { getShelters } from './shelterService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('petService y shelterService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista las mascotas', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getPets()).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/pets');
  });

  it('consulta una mascota por id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2 } });
    expect(await getPet(2)).toEqual({ id: 2 });
    expect(apiClient.get).toHaveBeenCalledWith('/pets/2');
  });

  it('crea una mascota', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 3 } });
    expect(await createPet({ name: 'Luna' })).toEqual({ id: 3 });
    expect(apiClient.post).toHaveBeenCalledWith('/pets', { name: 'Luna' });
  });

  it('actualiza una mascota', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 3 } });
    await updatePet(3, { name: 'Nube' });
    expect(apiClient.put).toHaveBeenCalledWith('/pets/3', { name: 'Nube' });
  });

  it('elimina una mascota', async () => {
    apiClient.delete.mockResolvedValue({});
    await deletePet(4);
    expect(apiClient.delete).toHaveBeenCalledWith('/pets/4');
  });

  it('lista los refugios', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, name: 'Refugio' }] });
    expect(await getShelters()).toHaveLength(1);
    expect(apiClient.get).toHaveBeenCalledWith('/shelters');
  });
});