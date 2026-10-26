import { describe, it, expect } from 'vitest';
import {
  ADOPTION_STATUS_OPTIONS,
  DEFAULT_ADOPTION_STATUS,
  getAdoptionStatusLabel,
  isValidAdoptionStatus,
} from './adoptionOptions';

describe('adoptionOptions', () => {
  it('define los tres estados del mockup', () => {
    expect(ADOPTION_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'IN_PROGRESS',
      'APPROVED',
      'RETURNED',
    ]);
    expect(DEFAULT_ADOPTION_STATUS).toBe('IN_PROGRESS');
  });

  it('valida los estados permitidos', () => {
    expect(isValidAdoptionStatus('APPROVED')).toBe(true);
    expect(isValidAdoptionStatus('CANCELLED')).toBe(false);
    expect(isValidAdoptionStatus('')).toBe(false);
  });

  it('traduce cada estado a su etiqueta', () => {
    expect(getAdoptionStatusLabel('IN_PROGRESS')).toBe('En curso');
    expect(getAdoptionStatusLabel('APPROVED')).toBe('Aprobada');
    expect(getAdoptionStatusLabel('RETURNED')).toBe('Devuelta');
  });

  it('muestra el valor original si el estado es desconocido y un guion si no hay', () => {
    expect(getAdoptionStatusLabel('OTRO')).toBe('OTRO');
    expect(getAdoptionStatusLabel(null)).toBe('—');
  });
});
