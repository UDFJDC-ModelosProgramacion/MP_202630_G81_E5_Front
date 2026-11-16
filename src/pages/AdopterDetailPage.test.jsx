// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { deleteAdopter, getAdopter } from '../services/adopterService';
import AdopterDetailPage from './AdopterDetailPage';

vi.mock('../services/adopterService', () => ({ getAdopter: vi.fn(), deleteAdopter: vi.fn() }));

function ListStub() {
const { state } = useLocation();
return <p>Listado: {state?.message}</p>;
}

const renderPage = (entry = '/adoptantes/1') =>
render(
    <MemoryRouter initialEntries={[entry]}>
    <Routes>
        <Route path="/adoptantes/:id" element={<AdopterDetailPage />} />
        <Route path="/adoptantes" element={<ListStub />} />
    </Routes>
    </MemoryRouter>,
);

const adopter = { id: 1, name: 'Laura Gómez', email: 'laura@correo.com', phone: '300 123 4567' };
const clickDelete = () => fireEvent.click(screen.getByRole('button', { name: 'Eliminar mi cuenta' }));
const apiError = (status, message = '') => ({ response: { status, data: { apierror: { message } } } });

let confirmSpy;

beforeEach(() => {
vi.clearAllMocks();
confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
confirmSpy.mockRestore();
cleanup();
});

describe('AdopterDetailPage', () => {
it('muestra nombre, correo y teléfono del adoptante', async () => {
    getAdopter.mockResolvedValue(adopter);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeTruthy();
    expect(screen.getByText('laura@correo.com')).toBeTruthy();
    expect(screen.getByText('300 123 4567')).toBeTruthy();
    expect(getAdopter).toHaveBeenCalledWith('1');
    expect(screen.getByRole('link', { name: 'Editar mis datos' }).getAttribute('href')).toBe('/adoptantes/1/editar');
});

it('muestra el aviso de éxito que llega desde la edición', async () => {
    getAdopter.mockResolvedValue(adopter);
    renderPage({ pathname: '/adoptantes/1', state: { message: 'Cambios guardados correctamente.' } });
    expect(await screen.findByText('Cambios guardados correctamente.')).toBeTruthy();
});

it('muestra un guion cuando no tiene teléfono', async () => {
    getAdopter.mockResolvedValue({ ...adopter, name: 'Laura', phone: null });
    renderPage();
    await screen.findByText('Laura');
    expect(screen.getByText('—')).toBeTruthy();
});

it('muestra que el adoptante no fue encontrado', async () => {
    getAdopter.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Adoptante no encontrado.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Editar mis datos' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Eliminar mi cuenta' })).toBeNull();
});

it('muestra el error de conexión', async () => {
    getAdopter.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
});

it('elimina el adoptante y vuelve al listado con el aviso de éxito', async () => {
    getAdopter.mockResolvedValue(adopter);
    deleteAdopter.mockResolvedValue();
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete();
    expect(await screen.findByText('Listado: Adoptante Laura Gómez eliminado correctamente.')).toBeTruthy();
    expect(deleteAdopter).toHaveBeenCalledWith(1);
});

it('no elimina si se cancela la confirmación', async () => {
    getAdopter.mockResolvedValue(adopter);
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete();
    expect(deleteAdopter).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
});

it('rechaza el borrado si tiene adopciones, mensajes o reseñas (412)', async () => {
    getAdopter.mockResolvedValue(adopter);
    deleteAdopter.mockRejectedValue(apiError(412, 'Unable to delete the adopter'));
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete();
    expect(
    await screen.findByText('No se puede eliminar tu cuenta porque tienes adopciones, mensajes o reseñas asociadas.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eliminar mi cuenta' }).disabled).toBe(false);
});

it('informa que el adoptante ya no existe (404)', async () => {
    getAdopter.mockResolvedValue(adopter);
    deleteAdopter.mockRejectedValue(apiError(404));
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete();
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe('Adoptante no encontrado.');
});

it('muestra el error de conexión si falla el borrado', async () => {
    getAdopter.mockResolvedValue(adopter);
    deleteAdopter.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
});

it('deshabilita el botón mientras elimina', async () => {
    getAdopter.mockResolvedValue(adopter);
    let finish;
    deleteAdopter.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderPage();
    await screen.findByText('Laura Gómez');
    clickDelete();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Eliminar mi cuenta' }).disabled).toBe(true));
    finish();
});
});