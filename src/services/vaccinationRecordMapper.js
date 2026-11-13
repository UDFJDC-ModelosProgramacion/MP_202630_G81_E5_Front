import { toDateInputValue } from '../utils/adoptionFormatters';
import { parseVaccines } from '../utils/vaccinationRecordFormatters';

export const EMPTY_VACCINATION_RECORD_FORM = { vaccinesApplied: '', nextDueDate: '' };

export function vaccinationRecordToFormValues(record) {
  return {
    vaccinesApplied: record.vaccinesApplied ?? '',
    nextDueDate: toDateInputValue(record.nextDueDate),
  };
}

export function buildVaccinationRecordPayload(form, existingRecord = {}) {
  const payload = {
    vaccinesApplied: parseVaccines(form.vaccinesApplied).join(', '),
    nextDueDate: form.nextDueDate?.trim() || null,
  };

  if (existingRecord.id !== undefined) {
    payload.id = existingRecord.id;
  }

  return payload;
}