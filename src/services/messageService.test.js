import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
} from './messageService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('messageService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista los mensajes de un adoptante', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getMessages(7)).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/adopters/7/messages');
  });

  it('consulta un mensaje de un adoptante', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 3 } });
    expect(await getMessage(7, 3)).toEqual({ id: 3 });
    expect(apiClient.get).toHaveBeenCalledWith('/adopters/7/messages/3');
  });

  it('crea un mensaje para un adoptante', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 4, content: 'Hola' } });
    const body = { content: 'Hola', sentDate: '2026-11-06T22:00:00.000Z' };
    expect(await createMessage(7, body)).toEqual({ id: 4, content: 'Hola' });
    expect(apiClient.post).toHaveBeenCalledWith('/adopters/7/messages', body);
  });

  it('intenta actualizar un mensaje', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 4, content: 'Nuevo' } });
    const body = { content: 'Nuevo', sentDate: '2026-11-06T22:00:00.000Z' };
    expect(await updateMessage(7, 4, body)).toEqual({ id: 4, content: 'Nuevo' });
    expect(apiClient.put).toHaveBeenCalledWith('/adopters/7/messages/4', body);
  });

  it('elimina un mensaje', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteMessage(7, 4);
    expect(apiClient.delete).toHaveBeenCalledWith('/adopters/7/messages/4');
  });
});