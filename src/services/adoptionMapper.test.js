import { describe, it, expect } from 'vitest';
import { buildAdoptionPayload, buildStatusPayload, EMPTY_ADOPTION_FORM } from './adoptionMapper';

const form = {
  petId: '3',
  adopterId: '5',
  veterinarianId: '2',
  date: '2026-09-20',
  status: 'IN_PROGRESS',
};

describe('EMPTY_ADOPTION_FORM', () => {
  it('empieza vacío y con el estado "En curso"', () => {
    expect(EMPTY_ADOPTION_FORM).toEqual({
      petId: '',
      adopterId: '',
      veterinarianId: '',
      date: '',
      status: 'IN_PROGRESS',
    });
  });
});

describe('buildAdoptionPayload', () => {
  it('construye la adopción con referencias por id y la fecha a mediodía UTC', () => {
    expect(buildAdoptionPayload(form)).toEqual({
      date: '2026-09-20T12:00:00.000Z',
      status: 'IN_PROGRESS',
      pet: { id: 3 },
      adopter: { id: 5 },
      responsibleVeterinarian: { id: 2 },
    });
  });

  it('omite el estado cuando no se elige para que el back use "IN_PROGRESS"', () => {
    const payload = buildAdoptionPayload({ ...form, status: '' });
    expect('status' in payload).toBe(false);
  });
});

describe('buildStatusPayload', () => {
  it('reenvía la fecha existente junto con el nuevo estado', () => {
    const adoption = { id: 9, date: '2026-09-14T00:00:00.000+00:00', status: 'IN_PROGRESS' };
    expect(buildStatusPayload(adoption, 'APPROVED')).toEqual({
      date: '2026-09-14T12:00:00.000Z',
      status: 'APPROVED',
    });
  });

  it('conserva la fecha aunque el servidor esté en otra zona horaria', () => {
    const adoption = { date: '2026-09-13T22:00:00.000+00:00' };
    expect(buildStatusPayload(adoption, 'RETURNED').date).toBe('2026-09-14T12:00:00.000Z');
  });

  it('envía fecha nula si la adopción no tiene fecha', () => {
    expect(buildStatusPayload({ date: null }, 'APPROVED')).toEqual({
      date: null,
      status: 'APPROVED',
    });
  });
});
