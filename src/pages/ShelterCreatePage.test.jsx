// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { createShelter, getShelters } from '../services/shelterService';
import ShelterCreatePage from './ShelterCreatePage';

vi.mock('../services/shelterService', () => ({ getShelters: vi.fn(), createShelter: vi.fn() }));

function ListStub() {
  const { state } = useLocation();
  return <p>Listado: {state?.message}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/nuevo']}>
      <Routes>
        <Route path="/refugios/nuevo" element={<ShelterCreatePage />} />
        <Route path="/refugios" element={<ListStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
  getShelters.mockResolvedValue([{ id: 1, name: 'Huellitas', city: 'Bogotá' }]);
});

afterEach(cleanup);

describe('ShelterCreatePage', () => {
  it('muestra el título, la ruta de navegación y el formulario', async () => {
    renderPage();
    expect(await screen.findByLabelText('Nombre')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Registrar refugio' })).toBeTruthy();
    expect(screen.getByText('Nombre y ciudad son obligatorios.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Refugios' }).getAttribute('href')).toBe('/refugios');
  });

  it('registra el refugio y vuelve al listado con el aviso de éxito', async () => {
    createShelter.mockResolvedValue({ id: 2 });
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', '  Patitas ');
    type('Ciudad', 'Cali');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));
    expect(await screen.findByText('Listado: Refugio registrado correctamente.')).toBeTruthy();
    expect(createShelter).toHaveBeenCalledWith({ name: 'Patitas', city: 'Cali' });
  });

  it('rechaza un refugio duplicado sin llamar al back', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', 'Huellitas');
    type('Ciudad', 'Bogotá');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));
    expect(await screen.findByText('Ya existe un refugio con este nombre en esta ciudad.')).toBeTruthy();
    expect(createShelter).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del back cuando rechaza el refugio', async () => {
    createShelter.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } },
    });
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', 'Patitas');
    type('Ciudad', 'Cali');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));
    expect(await screen.findByText('Shelter is not valid')).toBeTruthy();
  });

  it('muestra el error cuando no se pueden cargar los refugios', async () => {
    getShelters.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});