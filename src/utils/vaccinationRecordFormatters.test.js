import { describe, expect, it } from 'vitest';
import { formatVaccinationDate, parseVaccines } from './vaccinationRecordFormatters';

describe('parseVaccines', () => {
  it('separa por comas, recorta espacios y descarta vacíos', () => {
    expect(parseVaccines(' Rabia, Parvovirus ,, Moquillo ')).toEqual([
      'Rabia',
      'Parvovirus',
      'Moquillo',
    ]);
  });

  it('devuelve una lista vacía con valores vacíos o solo comas', () => {
    expect(parseVaccines('')).toEqual([]);
    expect(parseVaccines(',,, ')).toEqual([]);
    expect(parseVaccines(null)).toEqual([]);
    expect(parseVaccines(undefined)).toEqual([]);
  });
});

describe('formatVaccinationDate', () => {
  it('formatea la fecha en texto largo', () => {
    expect(formatVaccinationDate('2027-08-01')).toBe('1 de agosto de 2027');
    expect(formatVaccinationDate('2027-12-31')).toBe('31 de diciembre de 2027');
  });

  it('acepta una fecha ISO con hora', () => {
    expect(formatVaccinationDate('2027-08-01T00:00:00.000+00:00')).toBe('1 de agosto de 2027');
  });

  it('devuelve un guion cuando no hay fecha o es inválida', () => {
    expect(formatVaccinationDate(null)).toBe('—');
    expect(formatVaccinationDate('')).toBe('—');
    expect(formatVaccinationDate('no-es-fecha')).toBe('—');
  });
});