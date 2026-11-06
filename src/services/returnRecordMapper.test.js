import { describe, expect, it } from 'vitest';
import {
  buildEmptyReturnForm,
  buildReturnPayload,
  buildSavedReturnRecord,
  returnToFormValues,
} from './returnRecordMapper';

describe('buildEmptyReturnForm', () => {
  it('empieza con la fecha de hoy y sin motivo', () => {
    expect(buildEmptyReturnForm(new Date(2026, 9, 5))).toEqual({ date: '2026-10-05', reason: '' });
  });
});

describe('buildReturnPayload', () => {
  it('envía la fecha a las 12:00 UTC y el motivo recortado', () => {
    expect(buildReturnPayload({ date: '2026-10-05', reason: '  Cambió de ciudad  ' })).toEqual({
      date: '2026-10-05T12:00:00.000Z',
      reason: 'Cambió de ciudad',
    });
  });

  it('envía fecha nula cuando no hay fecha y motivo vacío cuando falta', () => {
    expect(buildReturnPayload({ date: '', reason: undefined })).toEqual({ date: null, reason: '' });
  });
});

describe('returnToFormValues', () => {
  it('convierte la devolución del back en valores de formulario', () => {
    expect(
      returnToFormValues({ id: 1, date: '2026-10-05T00:00:00.000+00:00', reason: 'Se mudó' }),
    ).toEqual({ date: '2026-10-05', reason: 'Se mudó' });
  });

  it('usa valores vacíos si faltan datos', () => {
    expect(returnToFormValues({ date: null, reason: null })).toEqual({ date: '', reason: '' });
    expect(returnToFormValues(undefined)).toEqual({ date: '', reason: '' });
  });
});

describe('buildSavedReturnRecord', () => {
  it('conserva el día elegido aunque el back devuelva la hora enviada', () => {
    const saved = buildSavedReturnRecord(
      { date: '2026-10-05', reason: '  Se mudó  ' },
      { id: 9, date: '2026-10-05T12:00:00.000+00:00', reason: 'Se mudó' },
    );
    expect(saved).toEqual({ id: 9, date: '2026-10-05T00:00:00.000Z', reason: 'Se mudó' });
    expect(returnToFormValues(saved).date).toBe('2026-10-05');
  });

  it('funciona cuando el back no devuelve nada', () => {
    expect(buildSavedReturnRecord({ date: '2026-10-05', reason: 'Alergia' }, undefined)).toEqual({
      date: '2026-10-05T00:00:00.000Z',
      reason: 'Alergia',
    });
  });

  it('usa un motivo vacío si falta', () => {
    expect(buildSavedReturnRecord({ date: '2026-10-05' }, {}).reason).toBe('');
  });
});
