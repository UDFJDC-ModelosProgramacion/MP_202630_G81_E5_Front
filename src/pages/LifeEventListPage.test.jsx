// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getLifeEvents } from '../services/lifeEventService';
import { getPet } from '../services/petService';
import LifeEventListPage from './LifeEventListPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/lifeEventService', () => ({
  getLifeEvents: vi.fn(),
  deleteLifeEvent: vi.fn(),
}));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const events = [
  {
    id: 1,
    type: 'Cirugía',
    date: '2026-01-15T00:00:00.000+00:00',
    description: 'Esterilización sin complicaciones',
    veterinarian: { id: 1, name: 'Laura Martínez' },
  },
  {
    id: 2,
    type: 'Vacunación',
    date: '2026-05-10T00:00:00.000+00:00',
    description: 'Aplicación de la vacuna antirrábica',
    veterinarian: { id: 1, name: 'Laura Martínez' },
  },
  {
    id: 3,
    type: 'Control',
    date: '2026-03-02T00:00:00.000+00:00',
    description: 'Chequeo general y desparasitación',
    veterinarian: { id: 2, name: 'Carlos Gómez' },
  },
];
const notFound = (message) => ({
  response: { status: 404, data: { apierror: { message } } },
});

const renderPage = (state) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/mascotas/1/eventos-de-vida', state }]}>
      <Routes>
        <Route path="/mascotas/:id/eventos-de-vida" element={<LifeEventListPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('LifeEventListPage', () => {
  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    getLifeEvents.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando eventos de vida/);
  });

  it('muestra los eventos de la mascota, del más reciente al más antiguo', async () => {
    getPet.mockResolvedValue(pet);
    getLifeEvents.mockResolvedValue(events);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Eventos de vida' })).toBeTruthy();
    expect(getPet).toHaveBeenCalledWith('1');
    expect(getLifeEvents).toHaveBeenCalledWith('1');
    expect(screen.getByText('Historial médico y de cuidado de Luna.')).toBeTruthy();
    const dates = screen
      .getAllByRole('link', { name: /^\d{2} \w{3} 2026$/ })
      .map((link) => link.textContent);
    expect(dates).toEqual(['10 may 2026', '02 mar 2026', '15 ene 2026']);
    expect(screen.getByText('Mostrando 3 eventos')).toBeTruthy();
  });

  it('enlaza para registrar un evento y muestra la ruta de navegación', async () => {
    getPet.mockResolvedValue(pet);
    getLifeEvents.mockResolvedValue(events);
    renderPage();
    const link = await screen.findByRole('link', { name: '+ Registrar evento' });
    expect(link.getAttribute('href')).toBe('/mascotas/1/eventos-de-vida/nuevo');
    expect(screen.getByRole('link', { name: 'Luna' }).getAttribute('href')).toBe('/mascotas/1');
  });

  it('muestra un mensaje cuando la mascota no tiene eventos', async () => {
    getPet.mockResolvedValue(pet);
    getLifeEvents.mockResolvedValue([]);
    renderPage();
    expect(
      await screen.findByText('Esta mascota aún no tiene eventos de vida registrados.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: '+ Registrar evento' })).toBeTruthy();
  });

  it('muestra el aviso de éxito que llega desde el formulario', async () => {
    getPet.mockResolvedValue(pet);
    getLifeEvents.mockResolvedValue(events);
    renderPage({ message: 'Evento registrado correctamente.' });
    expect(await screen.findByText('Evento registrado correctamente.')).toBeTruthy();
  });

  it('muestra el error de conexión y permite reintentar', async () => {
    getPet.mockResolvedValue(pet);
    getLifeEvents.mockRejectedValueOnce({ request: {} }).mockResolvedValue(events);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Mostrando 3 eventos')).toBeTruthy();
    expect(getLifeEvents).toHaveBeenCalledTimes(2);
  });

  it('informa cuando la mascota no existe y no muestra la tabla', async () => {
    getPet.mockRejectedValue(notFound('The pet with the given id was not found'));
    getLifeEvents.mockRejectedValue(notFound('The pet with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.queryByRole('heading', { name: 'Eventos de vida' })).toBeNull();
    expect(screen.queryByRole('link', { name: '+ Registrar evento' })).toBeNull();
  });

  it('muestra el error de conexión al cargar la mascota', async () => {
    getPet.mockRejectedValue({ request: {} });
    getLifeEvents.mockResolvedValue(events);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('heading', { name: 'Eventos de vida' })).toBeNull();
  });
});