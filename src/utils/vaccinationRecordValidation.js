import { parseVaccines } from './vaccinationRecordFormatters';

export function validateVaccinationRecord(values) {
  const errors = {};

  if (parseVaccines(values.vaccinesApplied).length === 0) {
    errors.vaccinesApplied = 'Indica al menos una vacuna aplicada.';
  }

  return errors;
}