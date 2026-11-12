import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import {
  createNotification,
  deleteNotification,
  getNotification,
  getNotifications,
  updateNotification,
} from './notificationService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notificationService', () => {
  it('lista las notificaciones de un refugio', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getNotifications(3)).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/3/notifications');
  });

  it('consulta una notificación', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7 } });
    expect(await getNotification(3, 7)).toEqual({ id: 7 });
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/3/notifications/7');
  });

  it('crea una notificación', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 8 } });
    expect(await createNotification(3, { message: 'Hola' })).toEqual({ id: 8 });
    expect(apiClient.post).toHaveBeenCalledWith('/shelters/3/notifications', { message: 'Hola' });
  });

  it('edita una notificación', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 7 } });
    expect(await updateNotification(3, 7, { message: 'Nuevo' })).toEqual({ id: 7 });
    expect(apiClient.put).toHaveBeenCalledWith('/shelters/3/notifications/7', { message: 'Nuevo' });
  });

  it('elimina una notificación', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteNotification(3, 7);
    expect(apiClient.delete).toHaveBeenCalledWith('/shelters/3/notifications/7');
  });
});