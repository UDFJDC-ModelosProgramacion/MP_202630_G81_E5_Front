// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdoption } from '../services/adoptionService';
import AdoptionDetailPage from './AdoptionDetailPage';

vi.mock('../services/adoptionService', () => ({ getAdoption: vi.fn() }));

const adoption = {
  id: 1,
  date: '2026-09-20T00:00:00.000+00:00',
  status: 'IN_PROGRESS',
  pet: { id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador' },
  adopter: {
    id: 1,
    name: 'Laura Gómez',
    email: 'laura@example.com',
    phone: '3001234567',
    address: 'Calle 45 # 12-30',
  },
  responsibleVeterinarian: {
    id: 1,
    name: 'Dr. Andrés Ríos',
    specialty: 'Medicina general',
    email: 'andres@example.com',
  },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adopciones/1']}>
      <Routes>
        <Route path="/adopciones/:id" element={<AdoptionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('AdoptionDetailPage', () => {
  it('muestra la mascota, el adoptante y el veterinario de la adopción', async () => {
    getAdoption.mockResolvedValue(adoption);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Adopción de Luna' })).toBeTruthy();
    expect(screen.getByText('Perro · Labrador')).toBeTruthy();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('laura@example.com')).toBeTruthy();
    expect(screen.getByText('Dr. Andrés Ríos')).toBeTruthy();
    expect(screen.getByText('Medicina general')).toBeTruthy();
    expect(screen.getByText('20 sep 2026')).toBeTruthy();
    expect(screen.getByText('En curso')).toBeTruthy();
    expect(getAdoption).toHaveBeenCalledWith('1');
  });

  it('muestra un guion en los datos que no existen', async () => {
    getAdoption.mockResolvedValue({ ...adoption, adopter: { id: 1, name: 'Laura Gómez' } });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
  });

  it('permite volver al listado', async () => {
    getAdoption.mockResolvedValue(adoption);
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    expect(
      screen.getByRole('link', { name: 'Volver al listado' }).getAttribute('href'),
    ).toBe('/adopciones');
  });

  it('informa cuando la adopción no existe', async () => {
    getAdoption.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Adopción no encontrada.')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /Adopción de/ })).toBeNull();
  });

  it('muestra el mensaje del servidor ante otros errores', async () => {
    getAdoption.mockRejectedValue({
      response: { status: 500, data: { apierror: { message: 'Falla interna' } } },
    });
    renderPage();
    expect(await screen.findByText('Falla interna')).toBeTruthy();
  });
});
