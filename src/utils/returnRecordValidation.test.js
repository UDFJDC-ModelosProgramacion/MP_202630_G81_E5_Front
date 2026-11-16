import { describe, expect, it } from 'vitest';
import { REASON_MAX_LENGTH, validateReturnRecord } from './returnRecordValidation';

describe('validateReturnRecord', () => {
  it('acepta una fecha y un motivo válidos', () => {
    expect(validateReturnRecord({ date: '2026-10-05', reason: 'Cambió de ciudad' })).toEqual({});
  });

  it('exige la fecha', () => {
    expect(validateReturnRecord({ date: '', reason: 'Motivo' }).date).toBe(
      'La fecha de devolución es obligatoria.',
    );
    expect(validateReturnRecord({ reason: 'Motivo' }).date).toBe(
      'La fecha de devolución es obligatoria.',
    );
  });

  it('rechaza una fecha que no existe', () => {
    expect(validateReturnRecord({ date: '2026-02-31', reason: 'Motivo' }).date).toBe(
      'La fecha de devolución no es válida.',
    );
    expect(validateReturnRecord({ date: 'ayer', reason: 'Motivo' }).date).toBe(
      'La fecha de devolución no es válida.',
    );
  });

  it('exige el motivo y no acepta solo espacios', () => {
    expect(validateReturnRecord({ date: '2026-10-05', reason: '' }).reason).toBe(
      'El motivo es obligatorio.',
    );
    expect(validateReturnRecord({ date: '2026-10-05', reason: '   ' }).reason).toBe(
      'El motivo es obligatorio.',
    );
    expect(validateReturnRecord({ date: '2026-10-05' }).reason).toBe('El motivo es obligatorio.');
  });

  it('acepta un motivo del largo máximo y rechaza uno más largo', () => {
    const date = '2026-10-05';
    expect(validateReturnRecord({ date, reason: 'a'.repeat(REASON_MAX_LENGTH) })).toEqual({});
    expect(validateReturnRecord({ date, reason: 'a'.repeat(REASON_MAX_LENGTH + 1) }).reason).toBe(
      'El motivo no puede superar los 255 caracteres.',
    );
  });

  it('lista la fecha antes que el motivo', () => {
    expect(Object.keys(validateReturnRecord({ date: '', reason: '' }))).toEqual(['date', 'reason']);
  });
});
