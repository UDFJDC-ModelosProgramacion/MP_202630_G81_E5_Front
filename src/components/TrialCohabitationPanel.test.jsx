// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteTrialCohabitation,
  getTrialCohabitation,
} from '../services/trialCohabitationService';
import TrialCohabitationPanel from './TrialCohabitationPanel';

vi.mock('../services/trialCohabitationService', () => ({
  getTrialCohabitation: vi.fn(),
  createTrialCohabitation: vi.fn(),
  updateTrialCohabitation: vi.fn(),
  deleteTrialCohabitation: vi.fn(),
}));

const trial = {
  id: 1,
  startDate: '2026-11-01T00:00:00.000+00:00',
  endDate: '2026-11-15T00:00:00.000+00:00',
};
const notFoundError = {
  response: {
    status: 404,
    data: { apierror: { message: 'The adoption does not have an associated trial cohabitation' } },
  },
};

let confirmSpy;

const renderPanel = (state) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/adopciones/5', state }]}>
      <TrialCohabitationPanel adoptionId="5" />
    </MemoryRouter>,
  );
const findDeleteButton = () => screen.findByRole('button', { name: 'Eliminar convivencia' });

beforeEach(() => {
  vi.clearAllMocks();
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('TrialCohabitationPanel: consulta', () => {
  it('muestra el estado de carga', () => {
    getTrialCohabitation.mockReturnValue(new Promise(() => {}));
    renderPanel();
    expect(screen.getByRole('status').textContent).toBe('Cargando convivencia de prueba...');
  });

  it('muestra las fechas registradas y las acciones', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    renderPanel();
    expect(await screen.findByText('01 nov 2026')).toBeTruthy();
    expect(screen.getByText('15 nov 2026')).toBeTruthy();
    expect(getTrialCohabitation).toHaveBeenCalledWith('5');
    expect(
      screen.getByRole('link', { name: 'Editar convivencia' }).getAttribute('href'),
    ).toBe('/adopciones/5/convivencia-prueba/editar');
  });

  it('indica cuando no hay fecha de fin', async () => {
    getTrialCohabitation.mockResolvedValue({ ...trial, endDate: null });
    renderPanel();
    expect(await screen.findByText('Sin fecha de fin')).toBeTruthy();
  });

  it('informa que no hay convivencia y ofrece registrarla (404)', async () => {
    getTrialCohabitation.mockRejectedValue(notFoundError);
    renderPanel();
    expect(
      await screen.findByText('Esta adopción no tiene una convivencia de prueba registrada.'),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Registrar convivencia' }).getAttribute('href'),
    ).toBe('/adopciones/5/convivencia-prueba/nueva');
  });

  it('muestra el error de conexión sin ofrecer registrar', async () => {
    getTrialCohabitation.mockRejectedValue({ request: {} });
    renderPanel();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('link', { name: 'Registrar convivencia' })).toBeNull();
  });

  it('muestra el mensaje de éxito que llega por navegación', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    renderPanel({ message: 'Convivencia de prueba registrada correctamente.' });
    expect(await screen.findByText('Convivencia de prueba registrada correctamente.')).toBeTruthy();
  });
});

describe('TrialCohabitationPanel: eliminar', () => {
  it('elimina la convivencia, confirma el éxito y ofrece registrar otra', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    deleteTrialCohabitation.mockResolvedValue();
    renderPanel();
    fireEvent.click(await findDeleteButton());
    expect((await screen.findByRole('status')).textContent).toBe(
      'Convivencia de prueba eliminada correctamente.',
    );
    expect(deleteTrialCohabitation).toHaveBeenCalledWith('5');
    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Registrar convivencia' })).toBeTruthy();
    expect(screen.queryByText('01 nov 2026')).toBeNull();
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    confirmSpy.mockReturnValue(false);
    renderPanel();
    fireEvent.click(await findDeleteButton());
    expect(deleteTrialCohabitation).not.toHaveBeenCalled();
    expect(screen.getByText('01 nov 2026')).toBeTruthy();
  });

  it('informa que no fue encontrada (404) y pasa al estado vacío', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    deleteTrialCohabitation.mockRejectedValue(notFoundError);
    renderPanel();
    fireEvent.click(await findDeleteButton());
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Esta adopción no tiene una convivencia de prueba registrada.',
    );
    expect(screen.getByRole('link', { name: 'Registrar convivencia' })).toBeTruthy();
  });

  it('muestra el error de conexión y conserva la convivencia', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    deleteTrialCohabitation.mockRejectedValue({ request: {} });
    renderPanel();
    fireEvent.click(await findDeleteButton());
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByText('01 nov 2026')).toBeTruthy();
  });

  it('deshabilita el botón y muestra "Eliminando..." mientras borra', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    deleteTrialCohabitation.mockReturnValue(new Promise(() => {}));
    renderPanel();
    fireEvent.click(await findDeleteButton());
    const button = await screen.findByRole('button', { name: 'Eliminando...' });
    expect(button.disabled).toBe(true);
  });
});