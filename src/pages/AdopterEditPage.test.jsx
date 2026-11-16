// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getAdopter, updateAdopter } from '../services/adopterService';
import AdopterEditPage from './AdopterEditPage';

vi.mock('../services/adopterService', () => ({
    getAdopter: vi.fn(),
    updateAdopter: vi.fn(),
    deleteAdopter: vi.fn(),
}));

function ProfileStub() {
const { state } = useLocation();
return <p>Perfil: {state?.message}</p>;
}

const renderPage = () =>
render(
    <MemoryRouter initialEntries={['/adoptantes/1/editar']}>
    <Routes>
        <Route path="/adoptantes/:id/editar" element={<AdopterEditPage />} />
        <Route path="/adoptantes/:id" element={<ProfileStub />} />
    </Routes>
    </MemoryRouter>,
);

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

const adopter = {
id: 1,
name: 'Laura Gómez',
email: 'laura@correo.com',
phone: '300 123 4567',
address: 'Calle 1 # 2-3',
adoptions: [{ id: 9 }],
};

beforeEach(() => {
vi.clearAllMocks();
getAdopter.mockResolvedValue(adopter);
});

afterEach(cleanup);

describe('AdopterEditPage', () => {
it('muestra la tarjeta con los datos actuales y el formulario cargado', async () => {
    renderPage();
    expect((await screen.findByLabelText('Nombre')).value).toBe('Laura Gómez');
    expect(screen.getByLabelText('Correo electrónico').value).toBe('laura@correo.com');
    expect(screen.getByLabelText(/Teléfono/).value).toBe('300 123 4567');
    expect(screen.getByRole('heading', { name: 'Mis datos' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Datos del adoptante' })).toBeTruthy();
});

it('ofrece eliminar la cuenta pero no el enlace para editar', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    expect(screen.getByRole('button', { name: 'Eliminar mi cuenta' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Editar mis datos' })).toBeNull();
});

it('guarda los cambios conservando la dirección y vuelve al perfil', async () => {
    updateAdopter.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', 'Laura G.');
    save();
    expect(await screen.findByText('Perfil: Cambios guardados correctamente.')).toBeTruthy();
    expect(updateAdopter).toHaveBeenCalledWith(1, {
    id: 1,
    address: 'Calle 1 # 2-3',
    name: 'Laura G.',
    email: 'laura@correo.com',
    phone: '300 123 4567',
    });
});

it('permite guardar conservando el mismo correo', async () => {
    updateAdopter.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByLabelText('Nombre');
    save();
    expect(await screen.findByText(/Perfil:/)).toBeTruthy();
});

it('rechaza el cambio si el nombre o el correo quedan vacíos', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', '');
    type('Correo electrónico', '  ');
    save();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeTruthy();
    expect(updateAdopter).not.toHaveBeenCalled();
});

it('muestra el error cuando el correo ya es de otro adoptante', async () => {
    updateAdopter.mockRejectedValue({
    response: { status: 412, data: { apierror: { message: 'There is already an adopter registered with that email' } } },
    });
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Correo electrónico', 'otro@correo.com');
    save();
    expect(await screen.findByText('Ya existe un adoptante con este correo electrónico.')).toBeTruthy();
});

it('muestra que el adoptante no fue encontrado', async () => {
    getAdopter.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Adoptante no encontrado.')).toBeTruthy();
    expect(screen.queryByLabelText('Nombre')).toBeNull();
});

it('muestra el error de conexión al cargar', async () => {
    getAdopter.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
});
});
