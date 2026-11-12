import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import {
  getShelterEvents,
  getShelterEvent,
  createShelterEvent,
  updateShelterEvent,
  deleteShelterEvent,
} from './shelterEventService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('shelterEventService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista los eventos de un refugio', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getShelterEvents(5)).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/5/shelterEvents');
  });

  it('consulta un evento de un refugio', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2 } });
    expect(await getShelterEvent(5, 2)).toEqual({ id: 2 });
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/5/shelterEvents/2');
  });

  it('crea un evento en un refugio', async () => {
    const payload = { title: 'Jornada', date: '2026-11-20T12:00:00.000Z', type: null };
    apiClient.post.mockResolvedValue({ data: { id: 3 } });
    expect(await createShelterEvent(5, payload)).toEqual({ id: 3 });
    expect(apiClient.post).toHaveBeenCalledWith('/shelters/5/shelterEvents', payload);
  });

  it('actualiza un evento', async () => {
    const payload = { title: 'Nuevo', date: '2026-11-21T12:00:00.000Z', type: 'Feria' };
    apiClient.put.mockResolvedValue({ data: { id: 3 } });
    await updateShelterEvent(5, 3, payload);
    expect(apiClient.put).toHaveBeenCalledWith('/shelters/5/shelterEvents/3', payload);
  });

  it('elimina un evento', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteShelterEvent(5, 3);
    expect(apiClient.delete).toHaveBeenCalledWith('/shelters/5/shelterEvents/3');
  });
});