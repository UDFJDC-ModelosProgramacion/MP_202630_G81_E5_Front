// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { deleteAdopter, getAdopters } from '../services/adopterService';
import AdopterListPage from './AdopterListPage';

vi.mock('../services/adopterService', () => ({ getAdopters: vi.fn(), deleteAdopter: vi.fn() }));

const adopters = [
{ id: 1, name: 'Laura Gómez', email: 'laura@correo.com', phone: '300 123 4567' },
{ id: 2, name: 'Carlos Pérez', email: 'carlos@correo.com', phone: null },
];

const renderPage = (entry = '/adoptantes') =>
render(
    <MemoryRouter initialEntries={[entry]}>
    <AdopterListPage />
    </MemoryRouter>,
);

const clickDelete = (name) =>
fireEvent.click(screen.getByRole('button', { name: `Eliminar ${name}` }));

let confirmSpy;

beforeEach(() => {
vi.clearAllMocks();
confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
confirmSpy.mockRestore();
cleanup();
});

describe('AdopterListPage', () => {
it('muestra el listado con el botón para registrar', async () => {
    getAdopters.mockResolvedValue(adopters);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 adoptantes')).toBeTruthy();
    expect(screen.getByRole('link', { name: '+ Registrar adoptante' }).getAttribute('href')).toBe('/adoptantes/nuevo');
});

it('muestra un mensaje cuando no hay adoptantes', async () => {
    getAdopters.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no hay adoptantes registrados.')).toBeTruthy();
});

it('muestra el error y permite reintentar', async () => {
    getAdopters.mockRejectedValueOnce({ request: {} }).mockResolvedValue(adopters);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Laura Gómez')).toBeTruthy();
    expect(getAdopters).toHaveBeenCalledTimes(2);
});

it('muestra el mensaje de éxito que llega desde el formulario', async () => {
    getAdopters.mockResolvedValue(adopters);
    renderPage({ pathname: '/adoptantes', state: { message: 'Adoptante registrado correctamente.' } });
    expect(await screen.findByText('Adoptante registrado correctamente.')).toBeTruthy();
});

it('elimina un adoptante y lo quita del listado', async () => {
    getAdopters.mockResolvedValue(adopters);
    deleteAdopter.mockResolvedValue();
    renderPage();
    await screen.findByText('Carlos Pérez');
    clickDelete('Carlos Pérez');
    expect(await screen.findByText('Adoptante Carlos Pérez eliminado correctamente.')).toBeTruthy();
    expect(deleteAdopter).toHaveBeenCalledWith(2);
    expect(screen.getByText('Mostrando 1 adoptante')).toBeTruthy();
});

it('no elimina si el usuario cancela la confirmación', async () => {
    getAdopters.mockResolvedValue(adopters);
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete('Laura Gómez');
    expect(deleteAdopter).not.toHaveBeenCalled();
});

it('rechaza el borrado cuando tiene adopciones, mensajes o reseñas (412)', async () => {
    getAdopters.mockResolvedValue(adopters);
    deleteAdopter.mockRejectedValue({
    response: { status: 412, data: { apierror: { message: 'has adoptions' } } },
    });
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete('Laura Gómez');
    expect(
    await screen.findByText('No se puede eliminar a Laura Gómez: tiene adopciones, mensajes o reseñas asociadas.'),
    ).toBeTruthy();
    expect(screen.getByText('Mostrando 2 adoptantes')).toBeTruthy();
});

it('informa cuando el adoptante ya no existe y lo quita del listado (404)', async () => {
    getAdopters.mockResolvedValue(adopters);
    deleteAdopter.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete('Laura Gómez');
    expect(await screen.findByText('Adoptante no encontrado.')).toBeTruthy();
    expect(screen.getByText('Mostrando 1 adoptante')).toBeTruthy();
});

it('muestra el error de conexión si falla el borrado', async () => {
    getAdopters.mockResolvedValue(adopters);
    deleteAdopter.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete('Laura Gómez');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByText('Mostrando 2 adoptantes')).toBeTruthy();
});
it('lleva el aviso a la vista cuando el borrado falla', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    getAdopters.mockResolvedValue(adopters);
    deleteAdopter.mockRejectedValue({ response: { status: 412, data: {} } });
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete('Laura Gómez');
    await screen.findByRole('alert');
    expect(scrollIntoView).toHaveBeenCalled();
    delete Element.prototype.scrollIntoView;
});
});
