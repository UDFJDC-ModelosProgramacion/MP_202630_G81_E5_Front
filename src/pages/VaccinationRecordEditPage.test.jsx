// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getPet } from '../services/petService';
import {
  getVaccinationRecord,
  updateVaccinationRecord,
} from '../services/vaccinationRecordService';
import VaccinationRecordEditPage from './VaccinationRecordEditPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/vaccinationRecordService', () => ({
  getVaccinationRecord: vi.fn(),
  updateVaccinationRecord: vi.fn(),
}));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const record = { id: 5, vaccinesApplied: 'Rabia, Moquillo', nextDueDate: '2027-08-01' };

function RecordStub() {
  const { state } = useLocation();
  return <p>{`CARNET ${state?.message ?? ''}`}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/carnet/editar']}>
      <Routes>
        <Route path="/mascotas/:id/carnet/editar" element={<VaccinationRecordEditPage />} />
        <Route path="/mascotas/:id/carnet" element={<RecordStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
  getVaccinationRecord.mockResolvedValue(record);
});

afterEach(cleanup);

describe('VaccinationRecordEditPage', () => {
  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    getVaccinationRecord.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando carnet/);
  });

  it('precarga el carnet y muestra la mascota bloqueada', async () => {
    renderPage();
    await screen.findByDisplayValue('Rabia, Moquillo');
    expect(getVaccinationRecord).toHaveBeenCalledWith('1');
    expect(screen.getByLabelText(/Próxima fecha de vacunación/).value).toBe('2027-08-01');
    expect(screen.getByLabelText('Mascota').disabled).toBe(true);
    expect(screen.getByRole('option', { name: 'Luna · Perro' })).toBeTruthy();
  });

  it('guarda los cambios conservando el id y vuelve a la consulta', async () => {
    updateVaccinationRecord.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByDisplayValue('Rabia, Moquillo');
    type('Vacunas aplicadas', 'Rabia, Parvovirus');
    type(/Próxima fecha de vacunación/, '2027-09-01');
    submit();
    expect(await screen.findByText('CARNET Cambios guardados correctamente.')).toBeTruthy();
    expect(updateVaccinationRecord).toHaveBeenCalledWith(1, {
      id: 5,
      vaccinesApplied: 'Rabia, Parvovirus',
      nextDueDate: '2027-09-01',
    });
  });

  it('envía null cuando se borra la próxima fecha', async () => {
    updateVaccinationRecord.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByDisplayValue('Rabia, Moquillo');
    type(/Próxima fecha de vacunación/, '');
    submit();
    await screen.findByText(/CARNET/);
    expect(updateVaccinationRecord.mock.calls[0][1].nextDueDate).toBeNull();
  });

  it('rechaza vacunas vacías sin llamar al servicio', async () => {
    renderPage();
    await screen.findByDisplayValue('Rabia, Moquillo');
    type('Vacunas aplicadas', '');
    submit();
    expect(screen.getByText('Indica al menos una vacuna aplicada.')).toBeTruthy();
    expect(updateVaccinationRecord).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del back cuando guardar es rechazado', async () => {
    updateVaccinationRecord.mockRejectedValue(
      apiError(412, 'Vaccination record data is not valid'),
    );
    renderPage();
    await screen.findByDisplayValue('Rabia, Moquillo');
    submit();
    expect(await screen.findByText('Vaccination record data is not valid')).toBeTruthy();
  });

  it('informa cuando el carnet ya no existe al guardar', async () => {
    updateVaccinationRecord.mockRejectedValue(
      apiError(404, 'The pet does not have an associated vaccination record'),
    );
    renderPage();
    await screen.findByDisplayValue('Rabia, Moquillo');
    submit();
    expect(await screen.findByText('Carnet de vacunación no encontrado.')).toBeTruthy();
  });

  it('informa cuando la mascota no tiene carnet y ofrece registrarlo', async () => {
    getVaccinationRecord.mockRejectedValue(
      apiError(404, 'The pet does not have an associated vaccination record'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Carnet de vacunación no encontrado.',
    );
    expect(screen.getByRole('link', { name: 'Registrar carnet' }).getAttribute('href')).toBe(
      '/mascotas/1/carnet/nuevo',
    );
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('informa cuando la mascota no existe', async () => {
    getPet.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    getVaccinationRecord.mockRejectedValue(
      apiError(404, 'The pet with the given id was not found'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.queryByRole('link', { name: 'Registrar carnet' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('muestra el error de conexión al cargar el carnet', async () => {
    getVaccinationRecord.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });
});