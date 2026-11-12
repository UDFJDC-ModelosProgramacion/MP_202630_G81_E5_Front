import { describe, expect, it } from 'vitest';
import {
  buildVeterinarianPayload,
  EMPTY_VETERINARIAN_FORM,
  veterinarianToFormValues,
} from './veterinarianMapper';

const form = {
  shelterId: '1',
  name: '  Laura Martínez ',
  email: ' laura@refugio.org ',
  phone: ' 3105551234 ',
  specialty: ' Medicina interna ',
  availability: ' Lun–Vie 8:00–14:00 ',
};

describe('veterinarianMapper', () => {
  it('convierte un veterinario en valores de formulario', () => {
    const values = veterinarianToFormValues({
      id: 5,
      name: 'Laura',
      email: 'l@r.org',
      phone: '310',
      specialty: 'Cirugía',
      availability: 'Sáb',
      shelter: { id: 2, name: 'Refugio' },
    });
    expect(values).toEqual({
      shelterId: '2',
      name: 'Laura',
      email: 'l@r.org',
      phone: '310',
      specialty: 'Cirugía',
      availability: 'Sáb',
    });
  });

  it('usa cadenas vacías cuando faltan datos opcionales', () => {
    expect(veterinarianToFormValues({ name: 'Ana', email: 'a@r.org', specialty: 'X' })).toEqual({
      shelterId: '',
      name: 'Ana',
      email: 'a@r.org',
      phone: '',
      specialty: 'X',
      availability: '',
    });
  });

  it('construye el payload recortando espacios y con refugio', () => {
    expect(buildVeterinarianPayload(form)).toEqual({
      name: 'Laura Martínez',
      email: 'laura@refugio.org',
      phone: '3105551234',
      specialty: 'Medicina interna',
      availability: 'Lun–Vie 8:00–14:00',
      shelter: { id: 1 },
    });
  });

  it('omite el refugio cuando no se selecciona y envía null en opcionales vacíos', () => {
    const payload = buildVeterinarianPayload({
      ...EMPTY_VETERINARIAN_FORM,
      name: 'Ana',
      email: 'a@r.org',
      specialty: 'X',
    });
    expect(payload).toEqual({
      name: 'Ana',
      email: 'a@r.org',
      phone: null,
      specialty: 'X',
      availability: null,
    });
    expect('shelter' in payload).toBe(false);
  });

  it('conserva el id del veterinario existente al editar', () => {
    expect(buildVeterinarianPayload(form, { id: 7 }).id).toBe(7);
  });
});