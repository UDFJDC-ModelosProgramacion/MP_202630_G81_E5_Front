// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdoption } from '../services/adoptionService';
import {
  deleteReturnRecord,
  getReturnRecord,
  updateReturnRecord,
} from '../services/returnRecordService';
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
  status: 'RETURNED',
  pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo', age: 3, available: true },
  adopter: { id: 1, name: 'Laura Gómez' },
  responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
};
const returnRecord = {
  id: 1,
  date: '2026-10-05T00:00:00.000+00:00',
  reason: 'El adoptante cambió de ciudad.',
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

const click = (name) => fireEvent.click(screen.getByRole('button', { name }));
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

async function openWithRecord() {
  getAdoption.mockResolvedValue(adoption);
  getReturnRecord.mockResolvedValue(returnRecord);
  renderPage();
  await screen.findByRole('heading', { name: 'Devolución registrada' });
}

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('ReturnRecordPage: editar devolución', () => {
  it('carga la devolución en el formulario y guarda los cambios válidos', async () => {
    updateReturnRecord.mockResolvedValue({ id: 1, date: '2026-10-07T12:00:00.000+00:00', reason: 'Alergia' });
    await openWithRecord();
    click('Editar devolución');
    expect(screen.getByRole('heading', { name: 'Editar devolución' })).toBeTruthy();
    expect(screen.getByLabelText('Fecha de devolución').value).toBe('2026-10-05');
    expect(screen.getByLabelText('Motivo').value).toBe('El adoptante cambió de ciudad.');

    fill('Fecha de devolución', '2026-10-07');
    fill('Motivo', '  Alergia  ');
    click('Guardar cambios');

    expect(await screen.findByText('Devolución actualizada correctamente.')).toBeTruthy();
    expect(updateReturnRecord).toHaveBeenCalledWith(1, {
      date: '2026-10-07T12:00:00.000Z',
      reason: 'Alergia',
    });
    expect(screen.getByRole('heading', { name: 'Devolución registrada' })).toBeTruthy();
    expect(screen.getByText('07 oct 2026')).toBeTruthy();
    expect(screen.getByText('Alergia')).toBeTruthy();
    expect(screen.queryByText('El adoptante cambió de ciudad.')).toBeNull();
    expect(getReturnRecord).toHaveBeenCalledTimes(1);
  });

  it('rechaza el cambio si falta la fecha o el motivo', async () => {
    await openWithRecord();
    click('Editar devolución');
    fill('Motivo', '');
    click('Guardar cambios');
    expect(screen.getByText('El motivo es obligatorio.')).toBeTruthy();
    fill('Fecha de devolución', '');
    click('Guardar cambios');
    expect(screen.getByText('La fecha de devolución es obligatoria.')).toBeTruthy();
    expect(updateReturnRecord).not.toHaveBeenCalled();
  });

  it('rechaza los datos que el back considera no válidos y deja la devolución sin cambios', async () => {
    updateReturnRecord.mockRejectedValue(apiError(412, 'Return record data is not valid'));
    await openWithRecord();
    click('Editar devolución');
    fill('Motivo', 'Otro motivo');
    click('Guardar cambios');
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Los datos de la devolución no son válidos.',
    );
    expect(screen.getByRole('heading', { name: 'Editar devolución' })).toBeTruthy();
  });

  it('cancela la edición sin guardar nada', async () => {
    await openWithRecord();
    click('Editar devolución');
    fill('Motivo', 'Cambio descartado');
    click('Cancelar');
    expect(screen.getByText('El adoptante cambió de ciudad.')).toBeTruthy();
    expect(screen.queryByText('Cambio descartado')).toBeNull();
    expect(updateReturnRecord).not.toHaveBeenCalled();
  });

  it('vuelve al formulario de registro si la devolución ya no existe', async () => {
    updateReturnRecord.mockRejectedValue(noRecord);
    await openWithRecord();
    click('Editar devolución');
    fill('Motivo', 'Otro motivo');
    click('Guardar cambios');
    expect((await screen.findByRole('alert')).textContent).toContain('Devolución no encontrada.');
    expect(screen.getByRole('heading', { name: 'Registrar devolución' })).toBeTruthy();
  });

  it('muestra el error en el formulario si la adopción ya no existe', async () => {
    updateReturnRecord.mockRejectedValue(apiError(404, 'The adoption with the given id was not found'));
    await openWithRecord();
    click('Editar devolución');
    fill('Motivo', 'Otro motivo');
    click('Guardar cambios');
    expect((await screen.findByRole('alert')).textContent).toContain('Adopción no encontrada.');
    expect(screen.getByRole('heading', { name: 'Editar devolución' })).toBeTruthy();
  });
});

describe('ReturnRecordPage: eliminar devolución', () => {
  it('elimina la devolución tras confirmar y vuelve a ofrecer el registro', async () => {
    deleteReturnRecord.mockResolvedValue();
    await openWithRecord();
    click('Eliminar devolución');

    expect(await screen.findByText('Devolución eliminada correctamente.')).toBeTruthy();
    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Eliminar la devolución de Firulais? Esta acción no se puede deshacer.',
    );
    expect(deleteReturnRecord).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('heading', { name: 'Devolución registrada' })).toBeNull();
    expect(screen.queryByText('El adoptante cambió de ciudad.')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Registrar devolución' })).toBeTruthy();
    expect(screen.getByText('Esta adopción todavía no tiene una devolución registrada.')).toBeTruthy();
  });

  it('no elimina nada si se cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    await openWithRecord();
    click('Eliminar devolución');
    expect(deleteReturnRecord).not.toHaveBeenCalled();
    expect(screen.getByText('El adoptante cambió de ciudad.')).toBeTruthy();
  });

  it('bloquea los botones mientras se elimina', async () => {
    let finish;
    deleteReturnRecord.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    await openWithRecord();
    click('Eliminar devolución');
    expect((await screen.findByRole('button', { name: 'Eliminando...' })).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Editar devolución' }).disabled).toBe(true);
    finish();
    expect(await screen.findByText('Devolución eliminada correctamente.')).toBeTruthy();
  });

  it('avisa que la devolución no fue encontrada y vuelve al registro', async () => {
    deleteReturnRecord.mockRejectedValue(noRecord);
    await openWithRecord();
    click('Eliminar devolución');
    expect((await screen.findByRole('alert')).textContent).toContain('Devolución no encontrada.');
    expect(screen.getByRole('heading', { name: 'Registrar devolución' })).toBeTruthy();
  });

  it('conserva la devolución cuando falla la conexión', async () => {
    deleteReturnRecord.mockRejectedValue({ request: {} });
    await openWithRecord();
    click('Eliminar devolución');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByText('El adoptante cambió de ciudad.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eliminar devolución' }).disabled).toBe(false);
  });
});
