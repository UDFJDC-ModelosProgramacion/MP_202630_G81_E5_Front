// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPet } from '../services/petService';
import {
  deleteVaccinationRecord,
  getVaccinationRecord,
} from '../services/vaccinationRecordService';
import VaccinationRecordPage from './VaccinationRecordPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/vaccinationRecordService', () => ({
  getVaccinationRecord: vi.fn(),
  deleteVaccinationRecord: vi.fn(),
}));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const record = {
  id: 5,
  vaccinesApplied: 'Rabia, Parvovirus, Moquillo',
  nextDueDate: '2027-08-01',
};
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/carnet']}>
      <Routes>
        <Route path="/mascotas/:id/carnet" element={<VaccinationRecordPage />} />
      </Routes>
    </MemoryRouter>,
  );

const clickDelete = () => fireEvent.click(screen.getByRole('button', { name: 'Eliminar carnet' }));
const cardHeading = () => screen.queryByRole('heading', { name: 'Carnet de Luna' });

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
  getVaccinationRecord.mockResolvedValue(record);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('VaccinationRecordPage - eliminar', () => {
  it('elimina el carnet y ofrece registrar uno nuevo', async () => {
    deleteVaccinationRecord.mockResolvedValue();
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect(await screen.findByText('Carnet eliminado correctamente.')).toBeTruthy();
    expect(deleteVaccinationRecord).toHaveBeenCalledWith(1);
    expect(cardHeading()).toBeNull();
    expect(screen.queryByText('Carnet de vacunación no encontrado.')).toBeNull();
    expect(screen.getByRole('link', { name: 'Registrar carnet' }).getAttribute('href')).toBe(
      '/mascotas/1/carnet/nuevo',
    );
    expect(screen.queryByRole('link', { name: 'Editar carnet' })).toBeNull();
  });

  it('pide confirmación antes de eliminar', async () => {
    deleteVaccinationRecord.mockResolvedValue();
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Eliminar el carnet de Luna? Esta acción no se puede deshacer.',
    );
    await screen.findByText('Carnet eliminado correctamente.');
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect(deleteVaccinationRecord).not.toHaveBeenCalled();
    expect(cardHeading()).toBeTruthy();
  });

  it('informa cuando el carnet ya no existe y quita la tarjeta', async () => {
    deleteVaccinationRecord.mockRejectedValue(
      apiError(404, 'The pet does not have an associated vaccination record'),
    );
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect(await screen.findByText('Carnet de vacunación no encontrado.')).toBeTruthy();
    expect(screen.getAllByRole('alert').length).toBe(1);
    expect(cardHeading()).toBeNull();
    expect(screen.getByRole('link', { name: 'Registrar carnet' })).toBeTruthy();
  });

  it('informa cuando la mascota ya no existe y conserva la tarjeta', async () => {
    deleteVaccinationRecord.mockRejectedValue(
      apiError(404, 'The pet with the given id was not found'),
    );
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
    expect(cardHeading()).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Registrar carnet' })).toBeNull();
  });

  it('muestra el error de conexión si falla el borrado y conserva la tarjeta', async () => {
    deleteVaccinationRecord.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(cardHeading()).toBeTruthy();
  });

  it('deshabilita el botón mientras se elimina', async () => {
    deleteVaccinationRecord.mockReturnValue(new Promise(() => {}));
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de Luna' });
    clickDelete();
    expect(screen.getByRole('button', { name: 'Eliminar carnet' }).disabled).toBe(true);
  });
});