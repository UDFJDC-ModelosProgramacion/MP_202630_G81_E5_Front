// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdoption } from '../services/adoptionService';
import {
  createTrialCohabitation,
  getTrialCohabitation,
  updateTrialCohabitation,
} from '../services/trialCohabitationService';
import TrialCohabitationPage from './TrialCohabitationPage';

vi.mock('../services/adoptionService', () => ({
  getAdoption: vi.fn(),
  updateAdoption: vi.fn(),
  deleteAdoption: vi.fn(),
}));
vi.mock('../services/trialCohabitationService', () => ({
  getTrialCohabitation: vi.fn(),
  createTrialCohabitation: vi.fn(),
  updateTrialCohabitation: vi.fn(),
  deleteTrialCohabitation: vi.fn(),
}));

const adoption = {
  id: 1,
  date: '2026-09-20T00:00:00.000+00:00',
  status: 'IN_PROGRESS',
  pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo', age: 3 },
  adopter: { id: 1, name: 'Laura Gómez' },
  responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
};
const trial = {
  id: 7,
  startDate: '2026-11-01T00:00:00.000+00:00',
  endDate: '2026-11-15T00:00:00.000+00:00',
  outcome: 'PENDING',
};
const trialNotFound = {
  response: {
    status: 404,
    data: { apierror: { message: 'The adoption does not have an associated trial cohabitation' } },
  },
};

function DetailStub() {
  const { state } = useLocation();
  return <p>Detalle: {state?.message}</p>;
}

const renderPage = (mode) =>
  render(
    <MemoryRouter
      initialEntries={[
        mode === 'edit'
          ? '/adopciones/1/convivencia-prueba/editar'
          : '/adopciones/1/convivencia-prueba/nueva',
      ]}
    >
      <Routes>
        <Route
          path="/adopciones/:id/convivencia-prueba/nueva"
          element={<TrialCohabitationPage mode="create" />}
        />
        <Route
          path="/adopciones/:id/convivencia-prueba/editar"
          element={<TrialCohabitationPage mode="edit" />}
        />
        <Route path="/adopciones/:id" element={<DetailStub />} />
        <Route path="/adopciones" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

const setDate = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const clickButton = (name) => fireEvent.click(screen.getByRole('button', { name }));
const findCreateForm = () =>
  screen.findByRole('heading', { name: 'Registrar convivencia de prueba' });
const findEditForm = () => screen.findByRole('heading', { name: 'Editar convivencia de prueba' });

beforeEach(() => {
  vi.clearAllMocks();
  getAdoption.mockResolvedValue(adoption);
  getTrialCohabitation.mockRejectedValue(trialNotFound);
});

afterEach(() => {
  cleanup();
});

describe('TrialCohabitationPage: registrar', () => {
  it('muestra el estado de carga', () => {
    getAdoption.mockReturnValue(new Promise(() => {}));
    renderPage('create');
    expect(screen.getByRole('status').textContent).toBe('Cargando convivencia de prueba...');
  });

  it('muestra el resumen de la adopción, la nota y el formulario del mockup', async () => {
    renderPage('create');
    await findCreateForm();
    expect(screen.getByRole('heading', { name: 'Adopción de Firulais' })).toBeTruthy();
    expect(screen.getByText('Perro · Criollo · 3 años')).toBeTruthy();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('Dr. Andrés Ríos')).toBeTruthy();
    expect(screen.getByText('20 sep 2026')).toBeTruthy();
    expect(
      screen.getByText('Esta adopción todavía no tiene una convivencia de prueba registrada.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar convivencia' })).toBeTruthy();
    expect(getAdoption).toHaveBeenCalledWith('1');
  });

  it('registra una convivencia válida y vuelve al detalle con el mensaje de éxito', async () => {
    createTrialCohabitation.mockResolvedValue({ id: 7 });
    renderPage('create');
    await findCreateForm();
    setDate('Fecha de inicio', '2026-10-05');
    setDate(/Fecha de fin/, '2026-10-20');
    clickButton('Registrar convivencia');
    expect(
      await screen.findByText('Detalle: Convivencia de prueba registrada correctamente.'),
    ).toBeTruthy();
    expect(createTrialCohabitation).toHaveBeenCalledWith('1', {
      startDate: '2026-10-05T12:00:00.000Z',
      endDate: '2026-10-20T12:00:00.000Z',
    });
  });

  it('registra la convivencia sin fecha de fin', async () => {
    createTrialCohabitation.mockResolvedValue({ id: 7 });
    renderPage('create');
    await findCreateForm();
    setDate('Fecha de inicio', '2026-10-05');
    clickButton('Registrar convivencia');
    await screen.findByText(/Detalle:/);
    expect(createTrialCohabitation).toHaveBeenCalledWith('1', {
      startDate: '2026-10-05T12:00:00.000Z',
      endDate: null,
    });
  });

  it('rechaza el registro si falta la fecha de inicio', async () => {
    renderPage('create');
    await findCreateForm();
    clickButton('Registrar convivencia');
    expect(screen.getByText('La fecha de inicio es obligatoria.')).toBeTruthy();
    expect(createTrialCohabitation).not.toHaveBeenCalled();
  });

  it('rechaza la fecha de fin anterior a la de inicio (mockup)', async () => {
    renderPage('create');
    await findCreateForm();
    setDate('Fecha de inicio', '2026-10-05');
    setDate(/Fecha de fin/, '2026-10-01');
    clickButton('Registrar convivencia');
    expect(
      screen.getByText('La fecha de fin debe ser posterior a la fecha de inicio.'),
    ).toBeTruthy();
    expect(createTrialCohabitation).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor y conserva el formulario (412)', async () => {
    createTrialCohabitation.mockRejectedValue({
      response: {
        status: 412,
        data: { apierror: { message: 'The adoption already has an associated trial cohabitation' } },
      },
    });
    renderPage('create');
    await findCreateForm();
    setDate('Fecha de inicio', '2026-10-05');
    clickButton('Registrar convivencia');
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Esta adopción ya tiene una convivencia de prueba registrada.',
    );
    expect(screen.getByRole('button', { name: 'Registrar convivencia' })).toBeTruthy();
  });

  it('no muestra el formulario si la adopción ya tiene convivencia', async () => {
    getTrialCohabitation.mockResolvedValue(trial);
    renderPage('create');
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Esta adopción ya tiene una convivencia de prueba registrada.',
    );
    expect(screen.queryByRole('heading', { name: 'Registrar convivencia de prueba' })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Volver a la adopción' }).getAttribute('href'),
    ).toBe('/adopciones/1');
  });

  it('informa que la adopción no fue encontrada (404)', async () => {
    getAdoption.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage('create');
    expect((await screen.findByRole('alert')).textContent).toBe('Adopción no encontrada.');
    expect(screen.queryByRole('button', { name: 'Registrar convivencia' })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Volver a adopciones' }).getAttribute('href'),
    ).toBe('/adopciones');
  });

  it('muestra el mensaje del servidor ante otros errores de la adopción', async () => {
    getAdoption.mockRejectedValue({
      response: { status: 500, data: { apierror: { message: 'Falla interna' } } },
    });
    renderPage('create');
    expect((await screen.findByRole('alert')).textContent).toBe('Falla interna');
  });

  it('muestra el error de conexión al consultar la convivencia y no ofrece el formulario', async () => {
    getTrialCohabitation.mockRejectedValue({ request: {} });
    renderPage('create');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('heading', { name: 'Registrar convivencia de prueba' })).toBeNull();
  });
});

describe('TrialCohabitationPage: editar', () => {
  beforeEach(() => {
    getTrialCohabitation.mockResolvedValue(trial);
  });

  it('carga las fechas registradas en el formulario', async () => {
    renderPage('edit');
    await findEditForm();
    expect(screen.getByLabelText('Fecha de inicio').value).toBe('2026-11-01');
    expect(screen.getByLabelText(/Fecha de fin/).value).toBe('2026-11-15');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
    expect(screen.queryByText(/todavía no tiene una convivencia/)).toBeNull();
  });

  it('guarda fechas válidas reenviando el id y el resultado', async () => {
    updateTrialCohabitation.mockResolvedValue(trial);
    renderPage('edit');
    await findEditForm();
    setDate(/Fecha de fin/, '2026-11-20');
    clickButton('Guardar cambios');
    expect(
      await screen.findByText('Detalle: Convivencia de prueba actualizada correctamente.'),
    ).toBeTruthy();
    expect(updateTrialCohabitation).toHaveBeenCalledWith('1', {
      id: 7,
      startDate: '2026-11-01T12:00:00.000Z',
      endDate: '2026-11-20T12:00:00.000Z',
      outcome: 'PENDING',
    });
  });

  it('rechaza el cambio si las fechas no son válidas', async () => {
    renderPage('edit');
    await findEditForm();
    setDate(/Fecha de fin/, '2026-10-01');
    clickButton('Guardar cambios');
    expect(
      screen.getByText('La fecha de fin debe ser posterior a la fecha de inicio.'),
    ).toBeTruthy();
    expect(updateTrialCohabitation).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor si rechaza el cambio (412)', async () => {
    updateTrialCohabitation.mockRejectedValue({
      response: {
        status: 412,
        data: {
          apierror: { message: 'Trial cohabitation end date must be after the start date' },
        },
      },
    });
    renderPage('edit');
    await findEditForm();
    clickButton('Guardar cambios');
    expect((await screen.findByRole('alert')).textContent).toBe(
      'La fecha de fin debe ser posterior a la fecha de inicio.',
    );
  });

  it('informa que no hay convivencia que editar y no muestra el formulario', async () => {
    getTrialCohabitation.mockRejectedValue(trialNotFound);
    renderPage('edit');
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Esta adopción no tiene una convivencia de prueba registrada.',
    );
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });
});