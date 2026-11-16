// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { deleteVeterinarian, getVeterinarians } from '../services/veterinarianService';
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

const precondition = (message) => ({
  response: { status: 412, data: { apierror: { message } } },
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/veterinarios']}>
      <VeterinarianListPage />
    </MemoryRouter>,
  );

const clickDelete = (name) =>
  fireEvent.click(screen.getByRole('button', { name: `Eliminar ${name}` }));

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  getVeterinarians.mockResolvedValue(veterinarians);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('VeterinarianListPage - eliminar', () => {
  it('elimina un veterinario sin asociaciones y lo quita del listado', async () => {
    deleteVeterinarian.mockResolvedValue();
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect(
      await screen.findByText('Veterinario Laura Martínez eliminado correctamente.'),
    ).toBeTruthy();
    expect(deleteVeterinarian).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('link', { name: 'Laura Martínez' })).toBeNull();
    expect(screen.getByText('Mostrando 1 veterinario')).toBeTruthy();
  });

  it('pide confirmación antes de eliminar', async () => {
    deleteVeterinarian.mockResolvedValue();
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Eliminar a Laura Martínez? Esta acción no se puede deshacer.',
    );
    await screen.findByText(/eliminado correctamente/);
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect(deleteVeterinarian).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Laura Martínez' })).toBeTruthy();
  });

  it('rechaza el borrado cuando tiene eventos de vida asociados', async () => {
    deleteVeterinarian.mockRejectedValue(
      precondition('Unable to delete the veterinarian because it has associated life events'),
    );
    renderPage();
    await screen.findByText('Carlos Gómez');
    clickDelete('Carlos Gómez');
    expect(
      await screen.findByText(
        'No se puede eliminar a Carlos Gómez: tiene eventos de vida asociados.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Carlos Gómez' })).toBeTruthy();
  });

  it('rechaza el borrado cuando tiene adopciones asociadas', async () => {
    deleteVeterinarian.mockRejectedValue(
      precondition('Unable to delete the veterinarian because it has associated adoptions'),
    );
    renderPage();
    await screen.findByText('Carlos Gómez');
    clickDelete('Carlos Gómez');
    expect(
      await screen.findByText('No se puede eliminar a Carlos Gómez: tiene adopciones asociadas.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Carlos Gómez' })).toBeTruthy();
  });

  it('informa cuando el veterinario ya no existe y lo quita del listado', async () => {
    deleteVeterinarian.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect(await screen.findByText('Veterinario no encontrado.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Laura Martínez' })).toBeNull();
  });

  it('muestra el error de conexión si falla el borrado', async () => {
    deleteVeterinarian.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByRole('link', { name: 'Laura Martínez' })).toBeTruthy();
  });

  it('deshabilita el botón del veterinario mientras se elimina', async () => {
    deleteVeterinarian.mockReturnValue(new Promise(() => {}));
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect(screen.getByRole('button', { name: 'Eliminar Laura Martínez' }).disabled).toBe(true);
  });

  it('muestra el estado vacío al eliminar al último veterinario', async () => {
    getVeterinarians.mockResolvedValue([veterinarians[0]]);
    deleteVeterinarian.mockResolvedValue();
    renderPage();
    await screen.findByText('Laura Martínez');
    clickDelete('Laura Martínez');
    expect(await screen.findByText('Aún no hay veterinarios registrados.')).toBeTruthy();
  });
});