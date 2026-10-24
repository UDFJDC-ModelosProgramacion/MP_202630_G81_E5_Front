// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getAdoptions } from '../services/adoptionService';
import AdoptionListPage from './AdoptionListPage';

vi.mock('../services/adoptionService', () => ({ getAdoptions: vi.fn() }));

const adoptions = [
  {
    id: 1,
    date: '2026-09-20T00:00:00.000+00:00',
    status: 'IN_PROGRESS',
    pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo' },
    adopter: { id: 1, name: 'Laura Gómez' },
    responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
  },
  {
    id: 2,
    date: '2026-09-14T00:00:00.000+00:00',
    status: 'APPROVED',
    pet: { id: 2, name: 'Michi', species: 'Gato', breed: 'Siamés' },
    adopter: { id: 2, name: 'Carlos Pérez' },
    responsibleVeterinarian: { id: 2, name: 'Dra. Marta Silva' },
  },
  {
    id: 3,
    date: '2026-09-02T00:00:00.000+00:00',
    status: 'RETURNED',
    pet: { id: 3, name: 'Luna', species: 'Perro', breed: 'Labrador' },
    adopter: { id: 3, name: 'Ana Torres' },
    responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
  },
];

const renderPage = (entry = '/adopciones') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AdoptionListPage />
    </MemoryRouter>,
  );

const search = (value) => fireEvent.change(screen.getByLabelText('Buscar'), { target: { value } });
const filterByStatus = (value) =>
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value } });

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('AdoptionListPage', () => {
  it('muestra el listado de adopciones y el botón para registrar', async () => {
    getAdoptions.mockResolvedValue(adoptions);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Firulais')).toBeTruthy();
    expect(screen.getByText('Mostrando 3 adopciones')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '+ Registrar adopción' }).getAttribute('href'),
    ).toBe('/adopciones/nueva');
  });

  it('muestra un mensaje cuando no hay adopciones', async () => {
    getAdoptions.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no hay adopciones registradas.')).toBeTruthy();
    expect(screen.queryByLabelText('Buscar')).toBeNull();
  });

  it('muestra el error y permite reintentar', async () => {
    getAdoptions.mockRejectedValueOnce({ request: {} }).mockResolvedValue(adoptions);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Firulais')).toBeTruthy();
    expect(getAdoptions).toHaveBeenCalledTimes(2);
  });

  it('muestra el mensaje de éxito que llega desde el formulario', async () => {
    getAdoptions.mockResolvedValue(adoptions);
    renderPage({ pathname: '/adopciones', state: { message: 'Adopción registrada correctamente.' } });
    expect(await screen.findByText('Adopción registrada correctamente.')).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('filtra por nombre de la mascota', async () => {
    getAdoptions.mockResolvedValue(adoptions);
    renderPage();
    await screen.findByText('Firulais');
    search('mich');
    expect(screen.getByText('Michi')).toBeTruthy();
    expect(screen.queryByText('Firulais')).toBeNull();
    expect(screen.getByText('Mostrando 1 adopción')).toBeTruthy();
  });

  it('filtra por nombre del adoptante sin importar tildes', async () => {
    getAdoptions.mockResolvedValue(adoptions);
    renderPage();
    await screen.findByText('Firulais');
    search('gomez');
    expect(screen.getByText('Firulais')).toBeTruthy();
    expect(screen.queryByText('Michi')).toBeNull();
  });

  it('filtra por estado y vuelve a mostrar todo con "Todos"', async () => {
    getAdoptions.mockResolvedValue(adoptions);
    renderPage();
    await screen.findByText('Firulais');
    filterByStatus('RETURNED');
    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.queryByText('Firulais')).toBeNull();
    filterByStatus('');
    expect(screen.getByText('Mostrando 3 adopciones')).toBeTruthy();
  });

  it('avisa cuando ninguna adopción coincide y mantiene los filtros', async () => {
    getAdoptions.mockResolvedValue(adoptions);
    renderPage();
    await screen.findByText('Firulais');
    search('zzz');
    expect(screen.getByText('No hay adopciones que coincidan con tu búsqueda.')).toBeTruthy();
    expect(screen.getByLabelText('Buscar')).toBeTruthy();
    search('');
    expect(screen.getByText('Firulais')).toBeTruthy();
  });
});
