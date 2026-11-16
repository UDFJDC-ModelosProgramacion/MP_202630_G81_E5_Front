import { describe, it, expect } from 'vitest';
import { validateAdopter } from './adopterValidation';

const valid = { name: 'Laura Gómez', email: 'laura@correo.com', phone: '' };

describe('validateAdopter', () => {
it('acepta un adoptante válido, con o sin teléfono', () => {
    expect(validateAdopter(valid)).toEqual({});
    expect(validateAdopter({ ...valid, phone: '300 123 4567' })).toEqual({});
});

it('rechaza nombre vacío, con espacios o nulo', () => {
    const message = 'El nombre es obligatorio.';
    expect(validateAdopter({ ...valid, name: '' }).name).toBe(message);
    expect(validateAdopter({ ...valid, name: '   ' }).name).toBe(message);
    expect(validateAdopter({ ...valid, name: null }).name).toBe(message);
});

it('rechaza correo vacío, con espacios o nulo', () => {
    const message = 'El correo electrónico es obligatorio.';
    expect(validateAdopter({ ...valid, email: '' }).email).toBe(message);
    expect(validateAdopter({ ...valid, email: '  ' }).email).toBe(message);
    expect(validateAdopter({ ...valid, email: undefined }).email).toBe(message);
});


it('devuelve los dos errores a la vez', () => {
    expect(Object.keys(validateAdopter({ name: '', email: '' }))).toEqual(['name', 'email']);
});
});
