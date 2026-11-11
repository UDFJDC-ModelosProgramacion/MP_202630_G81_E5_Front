// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createTrialCohabitation,
    deleteTrialCohabitation,
    getTrialCohabitation,
    updateTrialCohabitation,
} from '../services/trialCohabitationService';
import { TRIAL_COHABITATION_NOT_FOUND_MESSAGE } from '../utils/trialCohabitationMessages';
import useTrialCohabitation from './useTrialCohabitation';

    vi.mock('../services/trialCohabitationService', () => ({
    getTrialCohabitation: vi.fn(),
    createTrialCohabitation: vi.fn(),
    updateTrialCohabitation: vi.fn(),
    deleteTrialCohabitation: vi.fn(),
    }));

    const trial = { id: 1, startDate: '2026-11-01T12:00:00.000Z', endDate: null };
    const payload = { startDate: '2026-11-01T12:00:00.000Z', endDate: null };
    const notFoundError = {
    response: {
        status: 404,
        data: { apierror: { message: 'The adoption does not have an associated trial cohabitation' } },
    },
    };

    async function renderLoaded() {
    const hook = renderHook(() => useTrialCohabitation('5'));
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
    }

    beforeEach(() => {
    vi.clearAllMocks();
    });

    afterEach(() => {
    cleanup();
    });

    describe('useTrialCohabitation: carga', () => {
    it('carga la convivencia de la adopción', async () => {
        getTrialCohabitation.mockResolvedValue(trial);
        const { result } = renderHook(() => useTrialCohabitation('5'));
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.trialCohabitation).toEqual(trial);
        expect(result.current.notFound).toBe(false);
        expect(getTrialCohabitation).toHaveBeenCalledWith('5');
    });

    it('marca notFound cuando la adopción no tiene convivencia (404)', async () => {
        getTrialCohabitation.mockRejectedValue(notFoundError);
        const { result } = await renderLoaded();
        expect(result.current.trialCohabitation).toBeNull();
        expect(result.current.notFound).toBe(true);
        expect(result.current.error).toBe(TRIAL_COHABITATION_NOT_FOUND_MESSAGE);
    });

    it('informa el error de red sin marcar notFound', async () => {
        getTrialCohabitation.mockRejectedValue({ request: {} });
        const { result } = await renderLoaded();
        expect(result.current.notFound).toBe(false);
        expect(result.current.error).toMatch(/conectar con el servidor/);
    });
    });

    describe('useTrialCohabitation: acciones', () => {
    it('registra la convivencia y devuelve la convivencia guardada', async () => {
        getTrialCohabitation.mockRejectedValue(notFoundError);
        createTrialCohabitation.mockResolvedValue(trial);
        const { result } = await renderLoaded();
        let saved;
        await act(async () => {
        saved = await result.current.registerTrialCohabitation(payload);
        });
        expect(createTrialCohabitation).toHaveBeenCalledWith('5', payload);
        expect(saved).toEqual(trial);
    });

    it('edita la convivencia y devuelve la convivencia actualizada', async () => {
        getTrialCohabitation.mockResolvedValue(trial);
        const updated = { ...trial, endDate: '2026-11-20T12:00:00.000Z' };
        updateTrialCohabitation.mockResolvedValue(updated);
        const { result } = await renderLoaded();
        let saved;
        await act(async () => {
        saved = await result.current.editTrialCohabitation(payload);
        });
        expect(updateTrialCohabitation).toHaveBeenCalledWith('5', payload);
        expect(saved).toEqual(updated);
    });

    it('al eliminar deja la convivencia en null y notFound en true', async () => {
        getTrialCohabitation.mockResolvedValue(trial);
        deleteTrialCohabitation.mockResolvedValue();
        const { result } = await renderLoaded();
        await act(async () => {
        await result.current.removeTrialCohabitation();
        });
        expect(deleteTrialCohabitation).toHaveBeenCalledWith('5');
        expect(result.current.trialCohabitation).toBeNull();
        expect(result.current.notFound).toBe(true);
    });

    it('propaga el error al registrar y libera el estado de guardado', async () => {
        const failure = { response: { status: 412, data: {} } };
        getTrialCohabitation.mockRejectedValue(notFoundError);
        createTrialCohabitation.mockRejectedValue(failure);
        const { result } = await renderLoaded();
        await act(async () => {
        await expect(result.current.registerTrialCohabitation(payload)).rejects.toBe(failure);
        });
        expect(result.current.saving).toBe(false);
        expect(result.current.trialCohabitation).toBeNull();
    });

    it('propaga el error al eliminar y conserva la convivencia', async () => {
        const failure = { response: { status: 500, data: {} } };
        getTrialCohabitation.mockResolvedValue(trial);
        deleteTrialCohabitation.mockRejectedValue(failure);
        const { result } = await renderLoaded();
        await act(async () => {
        await expect(result.current.removeTrialCohabitation()).rejects.toBe(failure);
        });
        expect(result.current.deleting).toBe(false);
        expect(result.current.trialCohabitation).toEqual(trial);
    });

    it('si la convivencia ya no existe al eliminar (404), la deja en null y propaga el error', async () => {
        getTrialCohabitation.mockResolvedValue(trial);
        deleteTrialCohabitation.mockRejectedValue(notFoundError);
        const { result } = await renderLoaded();
        await act(async () => {
        await expect(result.current.removeTrialCohabitation()).rejects.toBe(notFoundError);
        });
        expect(result.current.trialCohabitation).toBeNull();
        expect(result.current.notFound).toBe(true);
    });
    it('marca saving mientras se guarda', async () => {
        getTrialCohabitation.mockRejectedValue(notFoundError);
        let resolveCreate;
        createTrialCohabitation.mockReturnValue(
        new Promise((resolve) => {
            resolveCreate = resolve;
        }),
        );
        const { result } = await renderLoaded();
        let pending;
        act(() => {
        pending = result.current.registerTrialCohabitation(payload);
        });
        expect(result.current.saving).toBe(true);
        await act(async () => {
        resolveCreate(trial);
        await pending;
        });
        expect(result.current.saving).toBe(false);
    });
});
