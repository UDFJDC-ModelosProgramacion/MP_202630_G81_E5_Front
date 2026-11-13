import { describe, expect, it } from 'vitest';
import {
  buildVaccinationRecordPayload,
  EMPTY_VACCINATION_RECORD_FORM,
  vaccinationRecordToFormValues,
} from './vaccinationRecordMapper';

describe('vaccinationRecordMapper', () => {
  it('convierte un carnet en valores de formulario', () => {
    expect(
      vaccinationRecordToFormValues({
        id: 1,
        vaccinesApplied: 'Rabia, Moquillo',
        nextDueDate: '2027-08-01',
      }),
    ).toEqual({ vaccinesApplied: 'Rabia, Moquillo', nextDueDate: '2027-08-01' });
  });

  it('usa cadenas vacías cuando faltan datos', () => {
    expect(vaccinationRecordToFormValues({ id: 1, nextDueDate: null })).toEqual(
      EMPTY_VACCINATION_RECORD_FORM,
    );
  });

  it('construye el payload normalizando la lista de vacunas', () => {
    expect(
      buildVaccinationRecordPayload({
        vaccinesApplied: ' Rabia,Parvovirus , ',
        nextDueDate: '2027-08-01',
      }),
    ).toEqual({ vaccinesApplied: 'Rabia, Parvovirus', nextDueDate: '2027-08-01' });
  });

  it('envía null cuando no hay próxima fecha', () => {
    const payload = buildVaccinationRecordPayload({ vaccinesApplied: 'Rabia', nextDueDate: '' });
    expect(payload.nextDueDate).toBeNull();
    expect('id' in payload).toBe(false);
  });

  it('conserva el id del carnet existente al editar', () => {
    const payload = buildVaccinationRecordPayload(
      { vaccinesApplied: 'Rabia', nextDueDate: '' },
      { id: 7 },
    );
    expect(payload.id).toBe(7);
  });
});