
import { toDateInputValue } from '../utils/adoptionFormatters';

export const EMPTY_TRIAL_COHABITATION_FORM = {
startDate: '',
endDate: '',
};

const toApiDate = (day) => (day ? `${day}T12:00:00.000Z` : null);

export function buildTrialCohabitationPayload(form, existing = null) {
    return {
    ...(existing?.id !== undefined ? { id: existing.id } : {}),
    startDate: toApiDate(form.startDate),
    endDate: toApiDate(form.endDate),
    ...(existing?.outcome !== undefined ? { outcome: existing.outcome } : {}),
};
}

export function mapTrialCohabitationToForm(trialCohabitation) {
return {
    startDate: toDateInputValue(trialCohabitation?.startDate),
    endDate: toDateInputValue(trialCohabitation?.endDate),
};
}
