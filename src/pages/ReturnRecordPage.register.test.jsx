// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdoption } from '../services/adoptionService';
import { createReturnRecord, getReturnRecord } from '../services/returnRecordService';
import ReturnRecordPage from './ReturnRecordPage';

vi.mock('../services/adoptionService', () => ({ getAdoption: vi.fn() }));
vi.mock('../services/returnRecordService', () => ({
  getReturnRecord: vi.fn(),
  createReturnRecord: vi.fn(),
  updateReturnRecord: vi.fn(),
  deleteReturnRecord: vi.fn(),
}));

const adoption = {
  id: 1,
  date: '2026-09-20T00:00:00.000+00:00',
  status: 'APPROVED',
  pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo', age: 3, available: false },
  adopter: { id: 1, name: 'Laura Gómez' },
  responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
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

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar devolución' }));

async function openWithoutRecord() {
  getAdoption.mockResolvedValue(adoption);
  getReturnRecord.mockRejectedValueOnce(noRecord);
  renderPage();
  await screen.findByRole('heading', { name: 'Registrar devolución' });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ReturnRecordPage: registrar devolución', () => {
  it('ofrece el formulario cuando la adopción no tiene devolución', async () => {
    await openWithoutRecord();
    expect(screen.getByLabelText('Fecha de devolución')).toBeTruthy();
    expect(screen.getByLabelText('Motivo')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Devolución registrada' })).toBeNull();
  });

  it('no ofrece el formulario cuando ya existe una devolución', async () => {
    getAdoption.mockResolvedValue(adoption);
    getReturnRecord.mockResolvedValue({ id: 1, date: '2026-10-05T00:00:00.000+00:00', reason: 'Ya' });
    renderPage();
    await screen.findByRole('heading', { name: 'Devolución registrada' });
    expect(screen.queryByRole('heading', { name: 'Registrar devolución' })).toBeNull();
  });

  it('registra la devolución, pasa la adopción a Devuelta y libera la mascota', async () => {
    createReturnRecord.mockResolvedValue({
      id: 9,
      date: '2026-10-05T12:00:00.000+00:00',
      reason: 'El adoptante cambió de ciudad.',
    });
    await openWithoutRecord();
    fill('Fecha de devolución', '2026-10-05');
    fill('Motivo', '  El adoptante cambió de ciudad.  ');
    submit();

    expect(await screen.findByRole('heading', { name: 'Devolución registrada' })).toBeTruthy();
    expect(createReturnRecord).toHaveBeenCalledWith(1, {
      date: '2026-10-05T12:00:00.000Z',
      reason: 'El adoptante cambió de ciudad.',
    });
    expect(
      screen.getByText('Devolución registrada. Firulais vuelve a estar disponible para adopción.'),
    ).toBeTruthy();
    expect(screen.getByText('05 oct 2026')).toBeTruthy();
    expect(screen.getByText('El adoptante cambió de ciudad.')).toBeTruthy();
    expect(screen.getByText('Devuelta')).toBeTruthy();
    expect(screen.getByText('Disponible')).toBeTruthy();
    expect(screen.queryByText(/todavía no tiene una devolución/)).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Registrar devolución' })).toBeNull();
  });

  it('usa los datos enviados si el back no devuelve la devolución creada', async () => {
    createReturnRecord.mockResolvedValue(undefined);
    await openWithoutRecord();
    fill('Fecha de devolución', '2026-10-05');
    fill('Motivo', 'Alergia');
    submit();
    expect(await screen.findByText('Alergia')).toBeTruthy();
    expect(screen.getByText('05 oct 2026')).toBeTruthy();
  });

  it('rechaza el envío sin motivo o sin fecha', async () => {
    await openWithoutRecord();
    submit();
    expect(screen.getByText('El motivo es obligatorio.')).toBeTruthy();
    fill('Fecha de devolución', '');
    submit();
    expect(screen.getByText('La fecha de devolución es obligatoria.')).toBeTruthy();
    expect(createReturnRecord).not.toHaveBeenCalled();
  });

  it('rechaza una segunda devolución y muestra la que ya existe', async () => {
    createReturnRecord.mockRejectedValue(
      apiError(412, 'The adoption already has an associated return record'),
    );
    await openWithoutRecord();
    getReturnRecord.mockResolvedValueOnce({
      id: 3,
      date: '2026-10-01T00:00:00.000+00:00',
      reason: 'Registrada antes',
    });
    fill('Motivo', 'Otro intento');
    submit();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Esta adopción ya tiene una devolución registrada.',
    );
    expect(screen.getByText('Registrada antes')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Registrar devolución' })).toBeNull();
  });

  it('muestra el rechazo en el formulario si no puede consultar la devolución existente', async () => {
    createReturnRecord.mockRejectedValue(
      apiError(412, 'The adoption already has an associated return record'),
    );
    await openWithoutRecord();
    getReturnRecord.mockRejectedValueOnce(noRecord);
    fill('Motivo', 'Otro intento');
    submit();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Esta adopción ya tiene una devolución registrada.',
    );
    expect(screen.getByRole('heading', { name: 'Registrar devolución' })).toBeTruthy();
  });

  it('muestra el error cuando la adopción ya no existe', async () => {
    createReturnRecord.mockRejectedValue(
      apiError(404, 'The adoption with the given id was not found'),
    );
    await openWithoutRecord();
    fill('Motivo', 'Cambió de ciudad');
    submit();
    expect((await screen.findByRole('alert')).textContent).toContain('Adopción no encontrada.');
    expect(screen.getByRole('heading', { name: 'Registrar devolución' })).toBeTruthy();
  });

  it('permite cancelar volviendo al detalle de la adopción', async () => {
    await openWithoutRecord();
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/adopciones/1');
  });
});
