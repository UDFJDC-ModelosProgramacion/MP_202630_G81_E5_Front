import { describe, expect, it } from 'vitest';
import {
  buildLifeEventPayload,
  EMPTY_LIFE_EVENT_FORM,
  lifeEventToFormValues,
} from './lifeEventMapper';

describe('lifeEventMapper', () => {
  it('convierte un evento en valores de formulario', () => {
    expect(
      lifeEventToFormValues({
        id: 4,
        type: 'Vacunación',
        date: '2026-05-10T00:00:00.000+00:00',
        description: 'Refuerzo anual',
        veterinarian: { id: 2, name: 'Laura Martínez' },
      }),
    ).toEqual({
      type: 'Vacunación',
      date: '2026-05-10',
      description: 'Refuerzo anual',
      veterinarianId: '2',
    });
  });

  it('usa cadenas vacías cuando faltan datos opcionales', () => {
    expect(lifeEventToFormValues({ id: 4, type: 'Control', date: null })).toEqual({
      type: 'Control',
      date: '',
      description: '',
      veterinarianId: '',
    });
  });

  it('construye el payload recortando espacios y con veterinario', () => {
    expect(
      buildLifeEventPayload({
        type: ' Control ',
        date: '2026-03-02',
        description: ' Chequeo general ',
        veterinarianId: '3',
      }),
    ).toEqual({
      type: 'Control',
      date: '2026-03-02',
      description: 'Chequeo general',
      veterinarian: { id: 3 },
    });
  });

  it('omite el veterinario y envía null en la descripción vacía', () => {
    const payload = buildLifeEventPayload({
      ...EMPTY_LIFE_EVENT_FORM,
      type: 'Cirugía',
      date: '2026-01-15',
    });
    expect(payload).toEqual({ type: 'Cirugía', date: '2026-01-15', description: null });
    expect('veterinarian' in payload).toBe(false);
    expect('id' in payload).toBe(false);
  });

  it('conserva el id del evento existente al editar', () => {
    const payload = buildLifeEventPayload(
      { type: 'Control', date: '2026-03-02', description: '', veterinarianId: '' },
      { id: 7 },
    );
    expect(payload.id).toBe(7);
  });
});