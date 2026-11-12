// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getVeterinarians } from '../services/veterinarianService';
import VeterinarianListPage from './VeterinarianListPage';

vi.mock('../services/veterinarianService', () => ({
  getVeterinarians: vi.fn(),
  deleteVeterinarian: vi.fn(),
}));

const veterinarians = [
  {
    id: 1,
    name: 'Laura Martínez',
    email: 'laura.martinez@refugio.org',
    specialty: 'Medicina interna',
    availability: 'Lun–Vie',
    shelter: { id: 1, name: 'Refugio Adopciones' },
  },
  {
    id: 2,
    name: 'Carlos Gómez',
    email: 'carlos.gomez@refugio.org',
    specialty: 'Cirugía',
    availability: null,
    shelter: null,
  },
];

const renderPage = (entry = '/veterinarios') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <VeterinarianListPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('VeterinarianListPage', () => {
  it('muestra el estado de carga', () => {
    getVeterinarians.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando veterinarios/);
  });

  it('muestra el listado y el enlace para registrar', async () => {
    getVeterinarians.mockResolvedValue(veterinarians);
    renderPage();
    expect(await screen.findByText('Laura Martínez')).toBeTruthy();
    expect(screen.getByText('Carlos Gómez')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 veterinarios')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '+ Registrar veterinario' }).getAttribute('href'),
    ).toBe('/veterinarios/nuevo');
  });

  it('muestra un mensaje cuando no hay veterinarios', async () => {
    getVeterinarians.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no hay veterinarios registrados.')).toBeTruthy();
  });

  it('muestra el error y permite reintentar', async () => {
    getVeterinarians.mockRejectedValueOnce({ request: {} }).mockResolvedValue(veterinarians);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Laura Martínez')).toBeTruthy();
    expect(getVeterinarians).toHaveBeenCalledTimes(2);
  });

  it('muestra el error que devuelve el back', async () => {
    getVeterinarians.mockRejectedValue({
      response: { status: 500, data: { apierror: { message: 'Fallo del servidor' } } },
    });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/Fallo del servidor/);
  });

  it('muestra el mensaje de éxito que llega desde el formulario', async () => {
    getVeterinarians.mockResolvedValue(veterinarians);
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/veterinarios', state: { message: 'Veterinario registrado correctamente.' } },
        ]}
      >
        <VeterinarianListPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Veterinario registrado correctamente.')).toBeTruthy();
  });
});