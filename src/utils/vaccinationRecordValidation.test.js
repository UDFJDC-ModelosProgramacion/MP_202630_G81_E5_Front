import { describe, expect, it } from 'vitest';
import { validateVaccinationRecord } from './vaccinationRecordValidation';

describe('validateVaccinationRecord', () => {
  it('no devuelve errores con al menos una vacuna', () => {
    expect(validateVaccinationRecord({ vaccinesApplied: 'Rabia', nextDueDate: '' })).toEqual({});
  });

  it('acepta la fecha vacía (es opcional)', () => {
    expect(
      validateVaccinationRecord({ vaccinesApplied: 'Rabia, Moquillo', nextDueDate: '' }),
    ).toEqual({});
  });

  it.each([['', 'vacío'], ['   ', 'solo espacios'], [',,,', 'solo comas'], [undefined, 'indefinido']])(
    'rechaza vacunas %j (%s)',
    (vaccinesApplied) => {
      expect(validateVaccinationRecord({ vaccinesApplied }).vaccinesApplied).toBe(
        'Indica al menos una vacuna aplicada.',
      );
    },
  );
});