// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getShelter, getShelters, updateShelter } from '../services/shelterService';
import ShelterEditPage from './ShelterEditPage';

vi.mock('../services/shelterService', () => ({
  getShelter: vi.fn(),
  getShelters: vi.fn(),
  updateShelter: vi.fn(),
}));

function ListStub() {
  const { state } = useLocation();
  return <p>Listado: {state?.message}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/1/editar']}>
      <Routes>
        <Route path="/refugios/:id/editar" element={<ShelterEditPage />} />
        <Route path="/refugios" element={<ListStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const all = [
  { id: 1, name: 'Huellitas', city: 'Bogotá' },
  { id: 2, name: 'Patitas', city: 'Cali' },
];

beforeEach(() => {
  vi.clearAllMocks();
  getShelter.mockResolvedValue({ id: 1, name: 'Huellitas', city: 'Bogotá', shelterEvents: [] });
  getShelters.mockResolvedValue(all);
});

afterEach(cleanup);

describe('ShelterEditPage', () => {
  it('carga los datos del refugio en el formulario', async () => {
    renderPage();
    expect((await screen.findByLabelText('Nombre')).value).toBe('Huellitas');
    expect(screen.getByLabelText('Ciudad').value).toBe('Bogotá');
  });

  it('guarda los cambios y vuelve al listado', async () => {
    updateShelter.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Ciudad', 'Medellín');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Listado: Cambios guardados correctamente.')).toBeTruthy();
    expect(updateShelter).toHaveBeenCalledWith(1, { name: 'Huellitas', city: 'Medellín' });
  });

  it('permite guardar conservando el mismo nombre y ciudad', async () => {
    updateShelter.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByLabelText('Nombre');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText(/Listado:/)).toBeTruthy();
  });

  it('rechaza una combinación que ya tiene otro refugio', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', 'Patitas');
    type('Ciudad', 'Cali');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Ya existe un refugio con este nombre en esta ciudad.')).toBeTruthy();
    expect(updateShelter).not.toHaveBeenCalled();
  });

  it('rechaza el cambio si el nombre queda vacío', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', '');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(updateShelter).not.toHaveBeenCalled();
  });

  it('muestra que el refugio no fue encontrado', async () => {
    getShelter.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Refugio no encontrado.')).toBeTruthy();
    expect(screen.queryByLabelText('Nombre')).toBeNull();
  });
});