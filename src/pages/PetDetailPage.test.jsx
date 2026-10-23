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

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('PetDetailPage', () => {
  it('muestra el detalle de la mascota', async () => {
    getPet.mockResolvedValue({
      id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador', age: 2,
      sex: 'Hembra', available: true, shelter: { name: 'Refugio Adopciones' },
    });
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Luna' })).toBeTruthy();
    expect(screen.getByText('Labrador')).toBeTruthy();
    expect(screen.getByText('Refugio Adopciones')).toBeTruthy();
    expect(getPet).toHaveBeenCalledWith('1');
  });

  it('informa cuando la mascota no existe', async () => {
    getPet.mockRejectedValue({ response: { status: 404, data: { message: 'no existe' } } });
    renderPage();
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
  });

  it('muestra el mensaje del servidor ante otros errores', async () => {
    getPet.mockRejectedValue({ response: { status: 500, data: { message: 'Falla interna' } } });
    renderPage();
    expect(await screen.findByText('Falla interna')).toBeTruthy();
  });
});