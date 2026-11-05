// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdoption } from '../services/adoptionService';
import AdoptionDetailPage from './AdoptionDetailPage';

vi.mock('../services/adoptionService', () => ({
  getAdoption: vi.fn(),
  updateAdoption: vi.fn(),
  deleteAdoption: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adopciones/3']}>
      <Routes>
        <Route path="/adopciones/:id" element={<AdoptionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('AdoptionDetailPage: enlace a la devolución', () => {
  it('lleva a la pantalla de devolución de la adopción', async () => {
    getAdoption.mockResolvedValue({
      id: 3,
      date: '2026-09-20T00:00:00.000+00:00',
      status: 'APPROVED',
      pet: { id: 1, name: 'Firulais' },
    });
    renderPage();
    const link = await screen.findByRole('link', { name: 'Devolución' });
    expect(link.getAttribute('href')).toBe('/adopciones/3/devolucion');
  });

  it('no ofrece la devolución si la adopción no existe', async () => {
    getAdoption.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByRole('alert');
    expect(screen.queryByRole('link', { name: 'Devolución' })).toBeNull();
  });
});
