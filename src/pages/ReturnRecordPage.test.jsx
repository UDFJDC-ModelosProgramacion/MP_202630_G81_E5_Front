// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdoption } from '../services/adoptionService';
import { getReturnRecord } from '../services/returnRecordService';
import ReturnRecordPage from './ReturnRecordPage';

vi.mock('../services/adoptionService', () => ({ getAdoption: vi.fn() }));
vi.mock('../services/returnRecordService', () => ({ getReturnRecord: vi.fn() }));

const adoption = {
  id: 1,
  date: '2026-09-20T00:00:00.000+00:00',
  status: 'APPROVED',
  pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo', age: 3, available: false },
  adopter: { id: 1, name: 'Laura Gómez' },
  responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
};
const returnRecord = {
  id: 1,
  date: '2026-10-05T00:00:00.000+00:00',
  reason: 'El adoptante cambió de ciudad y no puede llevar a la mascota consigo.',
};

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const noRecord = apiError(404, 'The adoption does not have an associated return record');

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adopciones/1/devolucion']}>
      <Routes>
        <Route path="/adopciones/:id/devolucion" element={<ReturnRecordPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ReturnRecordPage: consulta', () => {
  it('muestra la adopción y la devolución registrada con su fecha y motivo', async () => {
    getAdoption.mockResolvedValue({
      ...adoption,
      status: 'RETURNED',
      pet: { ...adoption.pet, available: true },
    });
    getReturnRecord.mockResolvedValue(returnRecord);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Adopción de Firulais' })).toBeTruthy();
    expect(getAdoption).toHaveBeenCalledWith('1');
    expect(getReturnRecord).toHaveBeenCalledWith('1');
    expect(screen.getByText('Devuelta')).toBeTruthy();
    expect(screen.getByText('Disponible')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Devolución registrada' })).toBeTruthy();
    expect(screen.getByText('05 oct 2026')).toBeTruthy();
    expect(screen.getByText(returnRecord.reason)).toBeTruthy();
    expect(screen.queryByText(/todavía no tiene una devolución/)).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Ruta de navegación' }).textContent).toBe(
      'Adopciones / Firulais',
    );
  });

  it('avisa que la adopción todavía no tiene devolución, sin mostrarlo como error', async () => {
    getAdoption.mockResolvedValue(adoption);
    getReturnRecord.mockRejectedValue(noRecord);
    renderPage();
    expect(await screen.findByText('Esta adopción todavía no tiene una devolución registrada.')).toBeTruthy();
    expect(screen.getByText('Aprobada')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Devolución registrada' })).toBeNull();
  });

  it('informa que la adopción no fue encontrada y no muestra datos', async () => {
    getAdoption.mockRejectedValue(apiError(404, 'The adoption with the given id was not found'));
    getReturnRecord.mockRejectedValue(apiError(404, 'The adoption with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Adopción no encontrada.');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: /Adopción de/ })).toBeNull();
  });

  it('muestra el error de la devolución sin ocultar el resumen de la adopción', async () => {
    getAdoption.mockResolvedValue(adoption);
    getReturnRecord.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByRole('heading', { name: 'Resumen de la adopción' })).toBeTruthy();
  });

  it('muestra el error de la adopción cuando falla la conexión', async () => {
    getAdoption.mockRejectedValue({ request: {} });
    getReturnRecord.mockResolvedValue(returnRecord);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });

  it('permite volver al detalle de la adopción', async () => {
    getAdoption.mockResolvedValue(adoption);
    getReturnRecord.mockResolvedValue(returnRecord);
    renderPage();
    const link = await screen.findByRole('link', { name: 'Volver a la adopción' });
    expect(link.getAttribute('href')).toBe('/adopciones/1');
  });
});
