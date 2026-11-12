// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getVeterinarian } from '../services/veterinarianService';
import VeterinarianDetailPage from './VeterinarianDetailPage';

vi.mock('../services/veterinarianService', () => ({ getVeterinarian: vi.fn() }));
vi.mock('../utils/eventDates', () => ({ formatEventDate: (value) => `fecha:${value}` }));

const veterinarian = {
  id: 1,
  name: 'Laura Martínez',
  email: 'laura.martinez@refugio.org',
  phone: '3105551234',
  specialty: 'Medicina interna',
  availability: 'Lun–Vie · 8:00–14:00',
  shelter: { id: 1, name: 'Refugio Adopciones' },
  registeredEvents: [
    { id: 10, type: 'Vacunación', description: 'Refuerzo anual', date: '2026-05-01' },
    { id: 11, type: 'Control', description: null, date: null },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/veterinarios/1']}>
      <Routes>
        <Route path="/veterinarios/:id" element={<VeterinarianDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('VeterinarianDetailPage', () => {
  it('muestra el estado de carga', () => {
    getVeterinarian.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando veterinario/);
  });

  it('muestra los datos del veterinario y sus eventos de vida', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Laura Martínez' })).toBeTruthy();
    expect(getVeterinarian).toHaveBeenCalledWith('1');
    expect(screen.getByText('laura.martinez@refugio.org')).toBeTruthy();
    expect(screen.getByText('3105551234')).toBeTruthy();
    expect(screen.getByText('Medicina interna')).toBeTruthy();
    expect(screen.getByText('Refugio Adopciones')).toBeTruthy();
    expect(screen.getByText('Vacunación')).toBeTruthy();
    expect(screen.getByText('fecha:2026-05-01')).toBeTruthy();
    expect(screen.getByText('Refuerzo anual')).toBeTruthy();
    expect(screen.getByText('Control')).toBeTruthy();
  });

  it('muestra el estado vacío cuando no tiene eventos de vida', async () => {
    getVeterinarian.mockResolvedValue({ ...veterinarian, registeredEvents: [] });
    renderPage();
    expect(
      await screen.findByText('Este veterinario no tiene eventos de vida registrados.'),
    ).toBeTruthy();
  });

  it('tolera una respuesta sin la lista de eventos', async () => {
    getVeterinarian.mockResolvedValue({ ...veterinarian, registeredEvents: undefined });
    renderPage();
    expect(
      await screen.findByText('Este veterinario no tiene eventos de vida registrados.'),
    ).toBeTruthy();
  });

  it('enlaza a la edición y al listado', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    renderPage();
    await screen.findByRole('heading', { name: 'Laura Martínez' });
    expect(screen.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe(
      '/veterinarios/1/editar',
    );
    expect(screen.getByRole('link', { name: 'Volver al listado' }).getAttribute('href')).toBe(
      '/veterinarios',
    );
  });

  it('informa cuando el veterinario no fue encontrado', async () => {
    getVeterinarian.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Veterinario no encontrado.');
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
  });

  it('muestra el error de conexión', async () => {
    getVeterinarian.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});