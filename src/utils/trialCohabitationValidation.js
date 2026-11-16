import {
  TRIAL_COHABITATION_DATE_INVALID_MESSAGE,
  TRIAL_COHABITATION_START_REQUIRED_MESSAGE,
} from './trialCohabitationMessages';

    const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

    const isBlank = (value) => !String(value ?? '').trim();

    function isValidDay(value) {
    if (!DAY_PATTERN.test(value)) return false;
    const date = new Date(`${value}T12:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function validateStartDate(startDate) {
    if (isBlank(startDate)) return TRIAL_COHABITATION_START_REQUIRED_MESSAGE;
    if (!isValidDay(startDate)) return 'La fecha de inicio no es válida.';
    return null;
    }

    function validateEndDate(endDate, startDate) {
    if (isBlank(endDate)) return null;
    if (!isValidDay(endDate)) return 'La fecha de fin no es válida.';
    if (isValidDay(startDate) && endDate <= startDate) {
        return TRIAL_COHABITATION_DATE_INVALID_MESSAGE;
    }
    return null;
    }

    export function validateTrialCohabitation(values) {
    const errors = {};
    const startError = validateStartDate(values.startDate);
    const endError = validateEndDate(values.endDate, values.startDate);

    if (startError) errors.startDate = startError;
    if (endError) errors.endDate = endError;
    return errors;
}
