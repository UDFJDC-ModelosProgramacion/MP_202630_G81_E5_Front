import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import {
  createLifeEvent,
  deleteLifeEvent,
  getLifeEvent,
  getLifeEvents,
  updateLifeEvent,
} from './lifeEventService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('lifeEventService', () => {
  it('getLifeEvents consulta la lista de la mascota y devuelve data', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getLifeEvents(3)).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/pets/3/lifeEvents');
  });

  it('getLifeEvent consulta un evento de la mascota y devuelve data', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7 } });
    expect(await getLifeEvent(3, 7)).toEqual({ id: 7 });
    expect(apiClient.get).toHaveBeenCalledWith('/pets/3/lifeEvents/7');
  });

  it('createLifeEvent envía el cuerpo y devuelve data', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 9 } });
    expect(await createLifeEvent(3, { type: 'Control' })).toEqual({ id: 9 });
    expect(apiClient.post).toHaveBeenCalledWith('/pets/3/lifeEvents', { type: 'Control' });
  });

  it('updateLifeEvent envía el cuerpo y devuelve data', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 7 } });
    expect(await updateLifeEvent(3, 7, { type: 'Cirugía' })).toEqual({ id: 7 });
    expect(apiClient.put).toHaveBeenCalledWith('/pets/3/lifeEvents/7', { type: 'Cirugía' });
  });

  it('deleteLifeEvent elimina el evento de la mascota', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteLifeEvent(3, 7);
    expect(apiClient.delete).toHaveBeenCalledWith('/pets/3/lifeEvents/7');
  });

  it('propaga el error sin manejarlo', async () => {
    const error = { response: { status: 404 } };
    apiClient.get.mockRejectedValue(error);
    await expect(getLifeEvent(3, 99)).rejects.toBe(error);
  });
});