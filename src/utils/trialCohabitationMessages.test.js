import { describe, expect, it } from 'vitest';
import {
  TRIAL_COHABITATION_ALREADY_EXISTS_MESSAGE,
  TRIAL_COHABITATION_DATE_INVALID_MESSAGE,
  TRIAL_COHABITATION_NOT_FOUND_MESSAGE,
  TRIAL_COHABITATION_START_REQUIRED_MESSAGE,
  getTrialCohabitationErrorMessage,
} from './trialCohabitationMessages';

    const apiError = (status, message) => ({
    response: { status, data: message ? { apierror: { message } } : {} },
    });

    describe('getTrialCohabitationErrorMessage', () => {
    it('404 sin convivencia: usa el mensaje de convivencia no encontrada', () => {
        const error = apiError(404, 'The adoption does not have an associated trial cohabitation');
        expect(getTrialCohabitationErrorMessage(error)).toBe(TRIAL_COHABITATION_NOT_FOUND_MESSAGE);
    });

    it('404 de la adopción: usa el mensaje de adopción no encontrada', () => {
        const error = apiError(404, 'The adoption with the given id was not found');
        expect(getTrialCohabitationErrorMessage(error)).toBe('Adopción no encontrada.');
    });

    it('404 sin mensaje: se asume adopción no encontrada', () => {
        expect(getTrialCohabitationErrorMessage(apiError(404))).toBe('Adopción no encontrada.');
    });

    it('412 por convivencia duplicada', () => {
        const error = apiError(412, 'The adoption already has an associated trial cohabitation');
        expect(getTrialCohabitationErrorMessage(error)).toBe(TRIAL_COHABITATION_ALREADY_EXISTS_MESSAGE);
    });

    it('412 por fecha de fin inválida', () => {
        const error = apiError(412, 'Trial cohabitation end date must be after the start date');
        expect(getTrialCohabitationErrorMessage(error)).toBe(TRIAL_COHABITATION_DATE_INVALID_MESSAGE);
    });

    it('412 por datos no válidos: falta la fecha de inicio', () => {
        const error = apiError(412, 'Trial cohabitation data is not valid');
        expect(getTrialCohabitationErrorMessage(error)).toBe(TRIAL_COHABITATION_START_REQUIRED_MESSAGE);
    });

    it('412 con un mensaje desconocido: lo muestra tal cual', () => {
        expect(getTrialCohabitationErrorMessage(apiError(412, 'Regla nueva'))).toBe('Regla nueva');
    });

    it('error de red', () => {
        expect(getTrialCohabitationErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
    });

    it('error sin respuesta ni petición: mensaje por defecto', () => {
        expect(getTrialCohabitationErrorMessage(new Error('x'))).toBe(
        'Ocurrió un error inesperado. Intenta de nuevo.',
        );
    });
});