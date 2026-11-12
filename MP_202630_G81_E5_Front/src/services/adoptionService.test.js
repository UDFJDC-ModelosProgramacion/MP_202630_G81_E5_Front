import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import {
  getAdoptions,
  getAdoption,
  createAdoption,
  updateAdoption,
  deleteAdoption,
} from './adoptionService';
import { getAdopters, getVeterinarians } from './adoptionLookupService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('adoptionService y adoptionLookupService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista las adopciones', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getAdoptions()).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/adoptions');
  });

  it('consulta una adopción por id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2 } });
    expect(await getAdoption(2)).toEqual({ id: 2 });
    expect(apiClient.get).toHaveBeenCalledWith('/adoptions/2');
  });

  it('crea una adopción', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 3 } });
    expect(await createAdoption({ status: 'IN_PROGRESS' })).toEqual({ id: 3 });
    expect(apiClient.post).toHaveBeenCalledWith('/adoptions', { status: 'IN_PROGRESS' });
  });

  it('actualiza una adopción', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 3, status: 'APPROVED' } });
    expect(await updateAdoption(3, { status: 'APPROVED' })).toEqual({ id: 3, status: 'APPROVED' });
    expect(apiClient.put).toHaveBeenCalledWith('/adoptions/3', { status: 'APPROVED' });
  });

  it('elimina una adopción', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteAdoption(4);
    expect(apiClient.delete).toHaveBeenCalledWith('/adoptions/4');
  });

  it('lista los adoptantes', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, name: 'Laura Gómez' }] });
    expect(await getAdopters()).toHaveLength(1);
    expect(apiClient.get).toHaveBeenCalledWith('/adopters');
  });

  it('lista los veterinarios', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, name: 'Dr. Andrés Ríos' }] });
    expect(await getVeterinarians()).toHaveLength(1);
    expect(apiClient.get).toHaveBeenCalledWith('/veterinarians');
  });
});
