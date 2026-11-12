// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getShelters } from '../services/shelterService';
import { createVeterinarian } from '../services/veterinarianService';
import VeterinarianCreatePage from './VeterinarianCreatePage';

vi.mock('../services/shelterService', () => ({ getShelters: vi.fn() }));
vi.mock('../services/veterinarianService', () => ({ createVeterinarian: vi.fn() }));

function ListStub() {
  const { state } = useLocation();
  return <p>{`LISTADO ${state?.message ?? ''}`}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/veterinarios/nuevo']}>
      <Routes>
        <Route path="/veterinarios/nuevo" element={<VeterinarianCreatePage />} />
        <Route path="/veterinarios" element={<ListStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Registrar veterinario' }));

function fillValid() {
  type('Nombre', 'Laura Martínez');
  type('Correo', 'laura@refugio.org');
  type('Especialidad', 'Medicina interna');
}

beforeEach(() => {
  vi.clearAllMocks();
  getShelters.mockResolvedValue([{ id: 1, name: 'Refugio Adopciones' }]);
});

afterEach(cleanup);

describe('VeterinarianCreatePage', () => {
  it('muestra el estado de carga de refugios', () => {
    getShelters.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando refugios/);
  });

  it('registra el veterinario con refugio y vuelve al listado con mensaje', async () => {
    createVeterinarian.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByRole('option', { name: 'Refugio Adopciones' });
    fillValid();
    type(/^Refugio/, '1');
    submit();
    expect(
      await screen.findByText('LISTADO Veterinario registrado correctamente.'),
    ).toBeTruthy();
    expect(createVeterinarian).toHaveBeenCalledWith({
      name: 'Laura Martínez',
      email: 'laura@refugio.org',
      phone: null,
      specialty: 'Medicina interna',
      availability: null,
      shelter: { id: 1 },
    });
  });

  it('registra el veterinario sin refugio (es opcional)', async () => {
    createVeterinarian.mockResolvedValue({ id: 6 });
    renderPage();
    await screen.findByRole('option', { name: 'Refugio Adopciones' });
    fillValid();
    submit();
    await screen.findByText(/LISTADO/);
    expect('shelter' in createVeterinarian.mock.calls[0][0]).toBe(false);
  });

  it('no llama al servicio si faltan datos obligatorios', async () => {
    renderPage();
    await screen.findByRole('option', { name: 'Refugio Adopciones' });
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(createVeterinarian).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del back cuando el refugio no existe', async () => {
    createVeterinarian.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } },
    });
    renderPage();
    await screen.findByRole('option', { name: 'Refugio Adopciones' });
    fillValid();
    type(/^Refugio/, '1');
    submit();
    expect(await screen.findByText('Shelter is not valid')).toBeTruthy();
    expect(screen.queryByText(/LISTADO/)).toBeNull();
  });

  it('muestra el error de conexión al guardar', async () => {
    createVeterinarian.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByRole('option', { name: 'Refugio Adopciones' });
    fillValid();
    submit();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });

  it('muestra el error al cargar refugios y deja registrar sin refugio', async () => {
    getShelters.mockRejectedValue({ request: {} });
    createVeterinarian.mockResolvedValue({ id: 7 });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fillValid();
    submit();
    await waitFor(() => expect(createVeterinarian).toHaveBeenCalledTimes(1));
  });
});