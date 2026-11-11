// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import AdopterDataCard from './AdopterDataCard';

afterEach(cleanup);

const adopter = { id: 1, name: 'Laura Gómez', email: 'laura@correo.com', phone: '300 123 4567' };

describe('AdopterDataCard', () => {
it('muestra nombre, correo y teléfono', () => {
    render(<AdopterDataCard adopter={adopter} />);
    expect(screen.getByRole('heading', { name: 'Mis datos' })).toBeTruthy();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('laura@correo.com')).toBeTruthy();
    expect(screen.getByText('300 123 4567')).toBeTruthy();
});

it('muestra un guion cuando falta el teléfono', () => {
    render(<AdopterDataCard adopter={{ ...adopter, phone: null }} />);
    expect(screen.getByText('—')).toBeTruthy();
});

it('pinta los botones que recibe', () => {
    render(
    <AdopterDataCard adopter={adopter}>
        <button type="button">Acción</button>
    </AdopterDataCard>,
    );
    expect(screen.getByRole('button', { name: 'Acción' })).toBeTruthy();
});
it('muestra el aviso de error debajo de los botones', () => {
    render(<AdopterDataCard adopter={adopter} error="No se pudo eliminar." />);
    expect(screen.getByRole('alert').textContent).toBe('No se pudo eliminar.');
});

it('no muestra ningún aviso cuando no hay error', () => {
    render(<AdopterDataCard adopter={adopter} />);
    expect(screen.queryByRole('alert')).toBeNull();
});
});