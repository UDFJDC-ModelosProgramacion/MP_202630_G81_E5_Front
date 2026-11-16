import { describe, it, expect } from 'vitest';
import { adopterToFormValues, buildAdopterPayload, EMPTY_ADOPTER_FORM } from './adopterMapper';

describe('buildAdopterPayload', () => {
it('quita espacios sobrantes', () => {
    const form = { name: ' Laura ', email: ' laura@correo.com ', phone: ' 300 123 4567 ' };
    expect(buildAdopterPayload(form)).toEqual({
    name: 'Laura',
    email: 'laura@correo.com',
    phone: '300 123 4567',
    });
});

it('manda null si el teléfono está vacío o falta', () => {
    expect(buildAdopterPayload({ name: 'A', email: 'a@a.com', phone: '  ' }).phone).toBeNull();
    expect(buildAdopterPayload({ name: 'A', email: 'a@a.com' }).phone).toBeNull();
});

it('conserva id y dirección del adoptante existente al editar', () => {
    const existing = { id: 7, address: 'Calle 1 # 2-3', name: 'viejo', adoptions: [{ id: 1 }] };
    const payload = buildAdopterPayload({ name: 'Nuevo', email: 'n@n.com', phone: '' }, existing);
    expect(payload).toEqual({
    id: 7,
    address: 'Calle 1 # 2-3',
    name: 'Nuevo',
    email: 'n@n.com',
    phone: null,
    });
});

it('no inventa campos que el adoptante existente no tiene', () => {
    const payload = buildAdopterPayload({ name: 'A', email: 'a@a.com', phone: '' }, { id: 1 });
    expect(payload).not.toHaveProperty('address');
    });
});

describe('adopterToFormValues', () => {
it('convierte un adoptante en valores de formulario', () => {
    const adopter = { id: 1, name: 'Laura', email: 'laura@correo.com', phone: '300' };
    expect(adopterToFormValues(adopter)).toEqual({
    name: 'Laura',
    email: 'laura@correo.com',
    phone: '300',
    });
});

it('usa texto vacío cuando faltan datos', () => {
    expect(adopterToFormValues({})).toEqual({ name: '', email: '', phone: '' });
    expect(adopterToFormValues({ phone: null }).phone).toBe('');
});

it('expone un formulario vacío', () => {
    expect(EMPTY_ADOPTER_FORM).toEqual({ name: '', email: '', phone: '' });
});
});
