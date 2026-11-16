import { describe, expect, it } from 'vitest';
import { validateTrialCohabitation } from './trialCohabitationValidation';

describe('validateTrialCohabitation', () => {
    it('acepta fecha de inicio y fecha de fin posterior', () => {
        expect(validateTrialCohabitation({ startDate: '2026-11-01', endDate: '2026-11-15' })).toEqual({});
    });

    it('acepta la convivencia sin fecha de fin', () => {
        expect(validateTrialCohabitation({ startDate: '2026-11-01', endDate: '' })).toEqual({});
    });

    it('exige la fecha de inicio', () => {
        expect(validateTrialCohabitation({ startDate: '', endDate: '' }).startDate).toBe(
        'La fecha de inicio es obligatoria.',
        );
    });

    it('rechaza una fecha de inicio inexistente', () => {
        expect(validateTrialCohabitation({ startDate: '2026-13-45', endDate: '' }).startDate).toBe(
        'La fecha de inicio no es válida.',
        );
    });

    it('rechaza una fecha de fin inexistente', () => {
        expect(validateTrialCohabitation({ startDate: '2026-11-01', endDate: '2026-02-30' }).endDate).toBe(
        'La fecha de fin no es válida.',
        );
    });

    it('rechaza una fecha de fin anterior a la de inicio', () => {
        expect(validateTrialCohabitation({ startDate: '2026-11-10', endDate: '2026-11-01' }).endDate).toBe(
        'La fecha de fin debe ser posterior a la fecha de inicio.',
        );
    });

    it('rechaza una fecha de fin igual a la de inicio', () => {
        expect(validateTrialCohabitation({ startDate: '2026-11-01', endDate: '2026-11-01' }).endDate).toBe(
        'La fecha de fin debe ser posterior a la fecha de inicio.',
        );
    });

    it('solo marca la fecha de inicio cuando falta y hay fecha de fin', () => {
        const errors = validateTrialCohabitation({ startDate: '', endDate: '2026-11-15' });
        expect(Object.keys(errors)).toEqual(['startDate']);
    });
});