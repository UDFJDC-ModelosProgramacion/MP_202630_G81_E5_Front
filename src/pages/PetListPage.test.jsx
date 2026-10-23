// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getPets } from '../services/petService';
import PetListPage from './PetListPage';

vi.mock('../services/petService', () => ({ getPets: vi.fn() }));

const pets = [
  { id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador', age: 2, available: true, shelter: { name: 'Refugio Adopciones' } },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <PetListPage />
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

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
});