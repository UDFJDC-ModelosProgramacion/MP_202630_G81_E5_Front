// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { createAdopter } from '../services/adopterService';
import AdopterCreatePage from './AdopterCreatePage';

vi.mock('../services/adopterService', () => ({ createAdopter: vi.fn() }));

function ListStub() {
const { state } = useLocation();
return <p>Listado: {state?.message}</p>;
}

const renderPage = () =>
render(
    <MemoryRouter initialEntries={['/adoptantes/nuevo']}>
    <Routes>
        <Route path="/adoptantes/nuevo" element={<AdopterCreatePage />} />
        <Route path="/adoptantes" element={<ListStub />} />
    </Routes>
    </MemoryRouter>,
);

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar adoptante' }));

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('AdopterCreatePage', () => {
it('muestra el título, la ruta de navegación y el formulario', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Registrar adoptante' })).toBeTruthy();
    expect(screen.getByText('Nombre y correo electrónico son obligatorios.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Adoptantes' }).getAttribute('href')).toBe('/adoptantes');
    expect(screen.getByLabelText('Nombre')).toBeTruthy();
});

it('registra al adoptante y vuelve al listado con el aviso de éxito', async () => {
    createAdopter.mockResolvedValue({ id: 2 });
    renderPage();
    type('Nombre', '  Laura Gómez ');
    type('Correo electrónico', ' laura@correo.com ');
    submit();
    expect(await screen.findByText('Listado: Adoptante registrado correctamente.')).toBeTruthy();
    expect(createAdopter).toHaveBeenCalledWith({
    name: 'Laura Gómez',
    email: 'laura@correo.com',
    phone: null,
    });
});

it('no llama al back si faltan datos obligatorios', () => {
    renderPage();
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(createAdopter).not.toHaveBeenCalled();
});

it('muestra el correo repetido que rechaza el back', async () => {
    createAdopter.mockRejectedValue({
    response: { status: 412, data: { apierror: { message: 'There is already an adopter registered with that email' } } },
    });
    renderPage();
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    expect(await screen.findByText('Ya existe un adoptante con este correo electrónico.')).toBeTruthy();
});

it('muestra el mensaje del back cuando rechaza los datos', async () => {
    createAdopter.mockRejectedValue({
    response: { status: 412, data: { apierror: { message: 'Adopter data is not valid' } } },
    });
    renderPage();
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    expect(await screen.findByText('Adopter data is not valid')).toBeTruthy();
});
});
