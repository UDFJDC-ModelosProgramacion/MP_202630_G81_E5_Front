
import { describe, expect, it } from 'vitest';
import {
    EMPTY_TRIAL_COHABITATION_FORM,
    buildTrialCohabitationPayload,
    mapTrialCohabitationToForm,
    } from './trialCohabitationMapper';

    describe('trialCohabitationMapper', () => {
    it('define el formulario vacío', () => {
        expect(EMPTY_TRIAL_COHABITATION_FORM).toEqual({
        startDate: '',
        endDate: '',
        });
    });

    it('convierte las fechas del formulario al formato de la API', () => {
        const form = {
        startDate: '2026-11-01',
        endDate: '2026-11-15',
        };

        expect(buildTrialCohabitationPayload(form)).toEqual({
        startDate: '2026-11-01T12:00:00.000Z',
        endDate: '2026-11-15T12:00:00.000Z',
        });
    });

    it('convierte los campos vacíos en null', () => {
        const form = {
        startDate: '',
        endDate: '',
        };

        expect(buildTrialCohabitationPayload(form)).toEqual({
        startDate: null,
        endDate: null,
        });
    });

    it('conserva el id y el resultado al editar', () => {
        const form = {
        startDate: '2026-11-02',
        endDate: '2026-11-20',
        };

        const existing = {
        id: 7,
        outcome: 'PENDING',
        };

        expect(buildTrialCohabitationPayload(form, existing)).toEqual({
        id: 7,
        startDate: '2026-11-02T12:00:00.000Z',
        endDate: '2026-11-20T12:00:00.000Z',
        outcome: 'PENDING',
        });
    });

    it('convierte las fechas de la API al formato del formulario', () => {
        const trialCohabitation = {
            startDate: '2026-11-01T00:00:00.000+00:00',
            endDate: '2026-11-15T00:00:00.000+00:00',
        };

        expect(mapTrialCohabitationToForm(trialCohabitation)).toEqual({
        startDate: '2026-11-01',
        endDate: '2026-11-15',
        });
    });

    it('maneja fechas nulas o un registro inexistente', () => {
        expect(mapTrialCohabitationToForm(null)).toEqual({
        startDate: '',
        endDate: '',
        });

        expect(
        mapTrialCohabitationToForm({
            startDate: null,
            endDate: null,
        }),
        ).toEqual({
        startDate: '',
        endDate: '',
        });
    });
});
