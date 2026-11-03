// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getShelter } from '../services/shelterService';
import ShelterDetailPage from './ShelterDetailPage';

vi.mock('../services/shelterService', () => ({ getShelter: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/1']}>
      <Routes>
        <Route path="/refugios/:id" element={<ShelterDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('ShelterDetailPage', () => {
  it('muestra el nombre, la ciudad y los eventos del refugio', async () => {
    getShelter.mockResolvedValue({
      id: 1,
      name: 'Huellitas',
      city: 'Bogotá',
      shelterEvents: [{ id: 1 }, { id: 2 }],
    });
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Huellitas' })).toBeTruthy();
    expect(screen.getByText('Bogotá')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe('/refugios/1/editar');
  });

  it('muestra 0 eventos cuando el refugio no tiene', async () => {
    getShelter.mockResolvedValue({ id: 1, name: 'Huellitas', city: 'Bogotá' });
    renderPage();
    await screen.findByRole('heading', { name: 'Huellitas' });
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('muestra que el refugio no fue encontrado', async () => {
    getShelter.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Refugio no encontrado.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
  });

  it('muestra el error de conexión', async () => {
    getShelter.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});