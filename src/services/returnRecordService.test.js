import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import {
  createReturnRecord,
  deleteReturnRecord,
  getReturnRecord,
  updateReturnRecord,
} from './returnRecordService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('returnRecordService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta la devolución de una adopción', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1, reason: 'Se mudó' } });
    expect(await getReturnRecord(4)).toEqual({ id: 1, reason: 'Se mudó' });
    expect(apiClient.get).toHaveBeenCalledWith('/adoptions/4/returnRecord');
  });

  it('registra la devolución de una adopción', async () => {
    const body = { date: '2026-10-05T12:00:00.000Z', reason: 'Se mudó' };
    apiClient.post.mockResolvedValue({ data: { id: 1, ...body } });
    expect(await createReturnRecord(4, body)).toEqual({ id: 1, ...body });
    expect(apiClient.post).toHaveBeenCalledWith('/adoptions/4/returnRecord', body);
  });

  it('actualiza la devolución de una adopción', async () => {
    const body = { date: '2026-10-06T12:00:00.000Z', reason: 'Alergia' };
    apiClient.put.mockResolvedValue({ data: { id: 1, ...body } });
    expect(await updateReturnRecord(4, body)).toEqual({ id: 1, ...body });
    expect(apiClient.put).toHaveBeenCalledWith('/adoptions/4/returnRecord', body);
  });

  it('elimina la devolución de una adopción', async () => {
    apiClient.delete.mockResolvedValue({ status: 204 });
    expect(await deleteReturnRecord(4)).toBeUndefined();
    expect(apiClient.delete).toHaveBeenCalledWith('/adoptions/4/returnRecord');
  });
});
