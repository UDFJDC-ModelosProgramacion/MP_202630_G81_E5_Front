// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPet } from '../services/petService';
import PetDetailPage from './PetDetailPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1']}>
      <Routes>
        <Route path="/mascotas/:id" element={<PetDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('PetDetailPage: eventos de vida', () => {
  it('enlaza a los eventos de vida de la mascota', async () => {
    getPet.mockResolvedValue({ id: 1, name: 'Luna', species: 'Perro', age: 2, available: true });
    renderPage();
    const link = await screen.findByRole('link', { name: 'Eventos de vida' });
    expect(link.getAttribute('href')).toBe('/mascotas/1/eventos-de-vida');
  });

  it('no muestra el enlace cuando la mascota no existe', async () => {
    getPet.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByRole('alert');
    expect(screen.queryByRole('link', { name: 'Eventos de vida' })).toBeNull();
  });
});