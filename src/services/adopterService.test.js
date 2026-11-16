import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import {
    getAdopters,
    getAdopter,
    createAdopter,
    updateAdopter,
    deleteAdopter,
} from './adopterService';

vi.mock('./apiClient', () => ({
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('adopterService', () => {
beforeEach(() => vi.clearAllMocks());

it('lista los adoptantes', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getAdopters()).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/adopters');
});

it('consulta un adoptante por id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2, name: 'Laura' } });
    expect(await getAdopter(2)).toEqual({ id: 2, name: 'Laura' });
    expect(apiClient.get).toHaveBeenCalledWith('/adopters/2');
});

    it('crea un adoptante', async () => {
    const adopter = { name: 'Laura', email: 'laura@correo.com', phone: null };
    apiClient.post.mockResolvedValue({ data: { id: 3 } });
    expect(await createAdopter(adopter)).toEqual({ id: 3 });
    expect(apiClient.post).toHaveBeenCalledWith('/adopters', adopter);
    });

    it('actualiza un adoptante', async () => {
    const adopter = { id: 3, name: 'Laura G.', email: 'laura@correo.com' };
    apiClient.put.mockResolvedValue({ data: { id: 3 } });
    await updateAdopter(3, adopter);
    expect(apiClient.put).toHaveBeenCalledWith('/adopters/3', adopter);
});

    it('elimina un adoptante', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteAdopter(4);
    expect(apiClient.delete).toHaveBeenCalledWith('/adopters/4');
    });

    it('deja pasar el error del back para que la UI lo maneje', async () => {
    const error = { response: { status: 404 } };
    apiClient.get.mockRejectedValue(error);
    await expect(getAdopter(99)).rejects.toBe(error);
    });
});