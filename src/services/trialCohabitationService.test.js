import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import {
  createTrialCohabitation,
  deleteTrialCohabitation,
  getTrialCohabitation,
  updateTrialCohabitation,
} from './trialCohabitationService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const URL = '/adoptions/5/trialCohabitation';
const payload = { startDate: '2026-11-01T12:00:00.000Z', endDate: null };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('trialCohabitationService', () => {
  it('consulta la convivencia de la adopción y devuelve los datos', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1 } });
    expect(await getTrialCohabitation(5)).toEqual({ id: 1 });
    expect(apiClient.get).toHaveBeenCalledWith(URL);
  });

  it('registra la convivencia con POST', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 1, ...payload } });
    expect(await createTrialCohabitation(5, payload)).toEqual({ id: 1, ...payload });
    expect(apiClient.post).toHaveBeenCalledWith(URL, payload);
  });

  it('edita la convivencia con PUT', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 1, ...payload } });
    expect(await updateTrialCohabitation(5, payload)).toEqual({ id: 1, ...payload });
    expect(apiClient.put).toHaveBeenCalledWith(URL, payload);
  });

  it('elimina la convivencia con DELETE', async () => {
    apiClient.delete.mockResolvedValue({});
    expect(await deleteTrialCohabitation(5)).toBeUndefined();
    expect(apiClient.delete).toHaveBeenCalledWith(URL);
  });

  it('no maneja los errores: los deja pasar a la interfaz', async () => {
    const failure = { response: { status: 404 } };
    apiClient.get.mockRejectedValue(failure);
    await expect(getTrialCohabitation(5)).rejects.toBe(failure);
  });
});