// @vitest-environment jsdom
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { deletePet, getPets } from '../services/petService';
import PetListPage from './PetListPage';

vi.mock('../services/petService', () => ({ getPets: vi.fn(), deletePet: vi.fn() }));

const pets = [
  { id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador', age: 2, available: true, shelter: { name: 'Refugio Adopciones' } },
  { id: 2, name: 'Rocky', species: 'Perro', breed: 'Pitbull', age: 5, available: false, shelter: { name: 'Refugio Adopciones' } },
];

const renderPage = (entry = '/mascotas') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <PetListPage />
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

describe('PetListPage', () => {
  it('muestra el listado de mascotas', async () => {
    getPets.mockResolvedValue(pets);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Luna')).toBeTruthy();
    expect(screen.getByRole('link', { name: '+ Registrar mascota' }).getAttribute('href')).toBe('/mascotas/nueva');
  });

  it('muestra un mensaje cuando no hay mascotas', async () => {
    getPets.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no hay mascotas registradas.')).toBeTruthy();
  });

  it('muestra el error y permite reintentar', async () => {
    getPets.mockRejectedValueOnce({ request: {} }).mockResolvedValue(pets);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Luna')).toBeTruthy();
    expect(getPets).toHaveBeenCalledTimes(2);
  });

  it('muestra el mensaje de éxito que llega desde el formulario', async () => {
    getPets.mockResolvedValue(pets);
    render(
      <MemoryRouter initialEntries={[{ pathname: '/mascotas', state: { message: 'Mascota registrada correctamente.' } }]}>
        <PetListPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Mascota registrada correctamente.')).toBeTruthy();
  });

  it('elimina una mascota sin asociaciones y la quita del listado', async () => {
    getPets.mockResolvedValue(pets);
    deletePet.mockResolvedValue();
    renderPage();
    await screen.findByText('Luna');
    clickDelete('Luna');
    expect(await screen.findByText('Mascota Luna eliminada correctamente.')).toBeTruthy();
    expect(deletePet).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('link', { name: 'Luna' })).toBeNull();
    expect(screen.getByText('Mostrando 1 mascota')).toBeTruthy();
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    getPets.mockResolvedValue(pets);
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Luna');
    clickDelete('Luna');
    expect(deletePet).not.toHaveBeenCalled();
  });

  it('rechaza el borrado cuando tiene adopciones o fotos asociadas', async () => {
    getPets.mockResolvedValue(pets);
    deletePet.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Pet has adoptions' } } },
    });
    renderPage();
    await screen.findByText('Rocky');
    clickDelete('Rocky');
    expect(
      await screen.findByText('No se puede eliminar a Rocky: tiene adopciones o fotos asociadas.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Rocky' })).toBeTruthy();
  });

  it('informa cuando la mascota ya no existe y la quita del listado', async () => {
    getPets.mockResolvedValue(pets);
    deletePet.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByText('Luna');
    clickDelete('Luna');
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Luna' })).toBeNull();
  });

  it('muestra el error de conexión si falla el borrado', async () => {
    getPets.mockResolvedValue(pets);
    deletePet.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByText('Luna');
    clickDelete('Luna');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByRole('link', { name: 'Luna' })).toBeTruthy();
  });
});