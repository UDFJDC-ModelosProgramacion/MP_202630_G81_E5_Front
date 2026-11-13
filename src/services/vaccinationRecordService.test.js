import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import {
  createVaccinationRecord,
  deleteVaccinationRecord,
  getVaccinationRecord,
  updateVaccinationRecord,
} from './vaccinationRecordService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('vaccinationRecordService', () => {
  it('getVaccinationRecord consulta el carnet de la mascota y devuelve data', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1 } });
    expect(await getVaccinationRecord(3)).toEqual({ id: 1 });
    expect(apiClient.get).toHaveBeenCalledWith('/pets/3/vaccinationRecord');
  });

  it('createVaccinationRecord envía el cuerpo y devuelve data', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 9 } });
    expect(await createVaccinationRecord(3, { vaccinesApplied: 'Rabia' })).toEqual({ id: 9 });
    expect(apiClient.post).toHaveBeenCalledWith('/pets/3/vaccinationRecord', {
      vaccinesApplied: 'Rabia',
    });
  });

  it('updateVaccinationRecord envía el cuerpo y devuelve data', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 2 } });
    expect(await updateVaccinationRecord(3, { vaccinesApplied: 'Moquillo' })).toEqual({ id: 2 });
    expect(apiClient.put).toHaveBeenCalledWith('/pets/3/vaccinationRecord', {
      vaccinesApplied: 'Moquillo',
    });
  });

  it('deleteVaccinationRecord elimina el carnet de la mascota', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteVaccinationRecord(4);
    expect(apiClient.delete).toHaveBeenCalledWith('/pets/4/vaccinationRecord');
  });

  it('propaga el error sin manejarlo', async () => {
    const error = { response: { status: 404 } };
    apiClient.get.mockRejectedValue(error);
    await expect(getVaccinationRecord(99)).rejects.toBe(error);
  });
});