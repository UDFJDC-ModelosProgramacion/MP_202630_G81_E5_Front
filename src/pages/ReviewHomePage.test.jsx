// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdopters } from '../services/adoptionLookupService';
import ReviewHomePage from './ReviewHomePage';

vi.mock('../services/adoptionLookupService', () => ({ getAdopters: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mis-resenas']}>
      <Routes>
        <Route path="/mis-resenas" element={<ReviewHomePage />} />
        <Route path="/adoptantes/:adopterId/resenas" element={<p>Reseñas del adoptante</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ReviewHomePage', () => {
  it('lleva a las reseñas del primer adoptante registrado', async () => {
    getAdopters.mockResolvedValue([{ id: 7, name: 'Laura Gómez' }, { id: 8, name: 'Otro' }]);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Reseñas del adoptante')).toBeTruthy();
  });

  it('avisa cuando no hay adoptantes registrados', async () => {
    getAdopters.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/Aún no hay adoptantes registrados/)).toBeTruthy();
  });

  it('muestra el error cuando falla la consulta', async () => {
    getAdopters.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});
