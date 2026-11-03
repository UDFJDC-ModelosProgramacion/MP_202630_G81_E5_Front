// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getPets } from '../services/petService';
import { deleteShelter, getShelters } from '../services/shelterService';
import ShelterListPage from './ShelterListPage';

vi.mock('../services/petService', () => ({ getPets: vi.fn() }));
vi.mock('../services/shelterService', () => ({ getShelters: vi.fn(), deleteShelter: vi.fn() }));

const shelters = [
  { id: 1, name: 'Huellitas', city: 'Bogotá', shelterEvents: [{ id: 5 }] },
  { id: 2, name: 'Patitas', city: 'Cali', shelterEvents: [] },
];
const pets = [{ id: 1, shelter: { id: 1 } }];

const renderPage = (entry = '/refugios') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ShelterListPage />
    </MemoryRouter>,
  );

const clickDelete = (name) =>
  fireEvent.click(screen.getByRole('button', { name: `Eliminar ${name}` }));

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  getPets.mockResolvedValue(pets);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('ShelterListPage', () => {
  it('muestra el listado de refugios con el botón para registrar', async () => {
    getShelters.mockResolvedValue(shelters);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Huellitas')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 refugios')).toBeTruthy();
    expect(screen.getByRole('link', { name: '+ Registrar refugio' }).getAttribute('href')).toBe('/refugios/nuevo');
  });

  it('muestra un mensaje cuando no hay refugios', async () => {
    getShelters.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no hay refugios registrados.')).toBeTruthy();
  });

  it('muestra el error y permite reintentar', async () => {
    getShelters.mockRejectedValueOnce({ request: {} }).mockResolvedValue(shelters);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Huellitas')).toBeTruthy();
    expect(getShelters).toHaveBeenCalledTimes(2);
  });

  it('muestra el mensaje de éxito que llega desde el formulario', async () => {
    getShelters.mockResolvedValue(shelters);
    render(
      <MemoryRouter initialEntries={[{ pathname: '/refugios', state: { message: 'Refugio registrado correctamente.' } }]}>
        <ShelterListPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Refugio registrado correctamente.')).toBeTruthy();
  });

  it('elimina un refugio y lo quita del listado', async () => {
    getShelters.mockResolvedValue(shelters);
    deleteShelter.mockResolvedValue();
    renderPage();
    await screen.findByText('Patitas');
    clickDelete('Patitas');
    expect(await screen.findByText('Refugio Patitas eliminado correctamente.')).toBeTruthy();
    expect(deleteShelter).toHaveBeenCalledWith(2);
    expect(screen.getByText('Mostrando 1 refugio')).toBeTruthy();
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    getShelters.mockResolvedValue(shelters);
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Huellitas');
    clickDelete('Huellitas');
    expect(deleteShelter).not.toHaveBeenCalled();
  });

  it('rechaza el borrado cuando el refugio tiene mascotas asociadas', async () => {
    getShelters.mockResolvedValue(shelters);
    deleteShelter.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'has pets' } } },
    });
    renderPage();
    await screen.findByText('Huellitas');
    clickDelete('Huellitas');
    expect(
      await screen.findByText(
        'No se puede eliminar Huellitas: tiene mascotas, eventos u otros datos asociados.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Mostrando 2 refugios')).toBeTruthy();
  });

  it('informa cuando el refugio ya no existe y lo quita del listado', async () => {
    getShelters.mockResolvedValue(shelters);
    deleteShelter.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByText('Huellitas');
    clickDelete('Huellitas');
    expect(await screen.findByText('Refugio no encontrado.')).toBeTruthy();
    expect(screen.getByText('Mostrando 1 refugio')).toBeTruthy();
  });

  it('muestra el error de conexión si falla el borrado', async () => {
    getShelters.mockResolvedValue(shelters);
    deleteShelter.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByText('Huellitas');
    clickDelete('Huellitas');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByText('Mostrando 2 refugios')).toBeTruthy();
  });
});