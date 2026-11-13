// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getPet } from '../services/petService';
import { createVaccinationRecord } from '../services/vaccinationRecordService';
import VaccinationRecordCreatePage from './VaccinationRecordCreatePage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/vaccinationRecordService', () => ({ createVaccinationRecord: vi.fn() }));

const pet = { id: 1, name: 'Michi', species: 'Gato' };

function RecordStub() {
  const { state } = useLocation();
  return <p>{`CARNET ${state?.message ?? ''}`}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/carnet/nuevo']}>
      <Routes>
        <Route path="/mascotas/:id/carnet/nuevo" element={<VaccinationRecordCreatePage />} />
        <Route path="/mascotas/:id/carnet" element={<RecordStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar carnet' }));
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
});

afterEach(cleanup);

describe('VaccinationRecordCreatePage', () => {
  it('muestra el título, el aviso de campos obligatorios y la mascota', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Registrar carnet' })).toBeTruthy();
    expect(
      screen.getByText('Cada mascota tiene un solo carnet. Las vacunas aplicadas son obligatorias.'),
    ).toBeTruthy();
    expect(await screen.findByRole('option', { name: 'Michi · Gato' })).toBeTruthy();
    expect(getPet).toHaveBeenCalledWith('1');
  });

  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando mascota/);
  });

  it('registra el carnet y vuelve a la consulta con el aviso de éxito', async () => {
    createVaccinationRecord.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByLabelText('Vacunas aplicadas');
    type('Vacunas aplicadas', ' Rabia,Parvovirus ');
    type(/Próxima fecha de vacunación/, '2027-08-01');
    submit();
    expect(await screen.findByText('CARNET Carnet registrado correctamente.')).toBeTruthy();
    expect(createVaccinationRecord).toHaveBeenCalledWith(1, {
      vaccinesApplied: 'Rabia, Parvovirus',
      nextDueDate: '2027-08-01',
    });
  });

  it('registra el carnet sin próxima fecha', async () => {
    createVaccinationRecord.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByLabelText('Vacunas aplicadas');
    type('Vacunas aplicadas', 'Rabia');
    submit();
    await screen.findByText(/CARNET/);
    expect(createVaccinationRecord).toHaveBeenCalledWith(1, {
      vaccinesApplied: 'Rabia',
      nextDueDate: null,
    });
  });

  it('no llama al servicio si faltan las vacunas', async () => {
    renderPage();
    await screen.findByLabelText('Vacunas aplicadas');
    submit();
    expect(screen.getByText('Indica al menos una vacuna aplicada.')).toBeTruthy();
    expect(createVaccinationRecord).not.toHaveBeenCalled();
  });

  it('rechaza crear un segundo carnet para la mascota', async () => {
    createVaccinationRecord.mockRejectedValue(
      apiError(412, 'The pet already has an associated vaccination record'),
    );
    renderPage();
    await screen.findByLabelText('Vacunas aplicadas');
    type('Vacunas aplicadas', 'Rabia');
    submit();
    expect(await screen.findByText('Esta mascota ya tiene un carnet de vacunación.')).toBeTruthy();
    expect(screen.queryByText(/CARNET/)).toBeNull();
  });

  it('informa cuando la mascota deja de existir al guardar', async () => {
    createVaccinationRecord.mockRejectedValue(
      apiError(404, 'The pet with the given id was not found'),
    );
    renderPage();
    await screen.findByLabelText('Vacunas aplicadas');
    type('Vacunas aplicadas', 'Rabia');
    submit();
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
  });

  it('muestra el error de conexión al guardar', async () => {
    createVaccinationRecord.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByLabelText('Vacunas aplicadas');
    type('Vacunas aplicadas', 'Rabia');
    submit();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });

  it('informa cuando la mascota no existe y no muestra el formulario', async () => {
    getPet.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.queryByLabelText('Vacunas aplicadas')).toBeNull();
  });

  it('muestra el error de conexión al cargar la mascota', async () => {
    getPet.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByLabelText('Vacunas aplicadas')).toBeNull();
  });
});