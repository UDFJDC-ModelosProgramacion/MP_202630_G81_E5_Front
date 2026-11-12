// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdopterTable from './AdopterTable';

const adopters = [
{ id: 1, name: 'Laura Gómez', email: 'laura@correo.com', phone: '300 123 4567' },
{ id: 2, name: 'Carlos Pérez', email: 'carlos@correo.com', phone: null },
];

const renderTable = (props = {}) =>
render(
    <MemoryRouter>
    <AdopterTable adopters={adopters} {...props} />
    </MemoryRouter>,
);

afterEach(cleanup);

describe('AdopterTable', () => {
it('muestra nombre, correo y teléfono de cada adoptante y el total', () => {
    renderTable();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('carlos@correo.com')).toBeTruthy();
    expect(screen.getByText('300 123 4567')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 adoptantes')).toBeTruthy();
});

it('muestra un guion cuando no hay teléfono', () => {
    renderTable({ adopters: [adopters[1]] });
    expect(screen.getByText('—')).toBeTruthy();
});

it('usa el singular cuando hay un solo adoptante', () => {
    renderTable({ adopters: [adopters[0]] });
    expect(screen.getByText('Mostrando 1 adoptante')).toBeTruthy();
});

it('enlaza al perfil y a la edición', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Ver perfil de Laura Gómez' }).getAttribute('href')).toBe('/adoptantes/1');
    expect(screen.getByRole('link', { name: 'Editar Laura Gómez' }).getAttribute('href')).toBe('/adoptantes/1/editar');
});

it('solo muestra Eliminar cuando recibe onDelete', () => {
    renderTable();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
});

it('llama a onDelete con el adoptante seleccionado', () => {
    const onDelete = vi.fn();
    renderTable({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Laura Gómez' }));
    expect(onDelete).toHaveBeenCalledWith(adopters[0]);
});

it('deshabilita Eliminar solo en el adoptante que se está eliminando', () => {
    renderTable({ onDelete: vi.fn(), deletingId: 1 });
    expect(screen.getByRole('button', { name: 'Eliminar Laura Gómez' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar Carlos Pérez' }).disabled).toBe(false);
});
});
