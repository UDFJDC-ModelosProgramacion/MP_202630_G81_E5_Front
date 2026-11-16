// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPet } from '../services/petService';
import { getVaccinationRecord } from '../services/vaccinationRecordService';
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
const notFound = (message) => ({
  response: { status: 404, data: { apierror: { message } } },
});

const renderPage = (state) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/mascotas/1/carnet', state }]}>
      <Routes>
        <Route path="/mascotas/:id/carnet" element={<VaccinationRecordPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('VaccinationRecordPage', () => {
  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    getVaccinationRecord.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando carnet/);
  });

  it('muestra el carnet de la mascota con sus vacunas y la próxima fecha', async () => {
    getPet.mockResolvedValue(pet);
    getVaccinationRecord.mockResolvedValue(record);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Carnet de vacunación' })).toBeTruthy();
    expect(getPet).toHaveBeenCalledWith('1');
    expect(getVaccinationRecord).toHaveBeenCalledWith('1');
    expect(
      screen.getByText('Consulta las vacunas aplicadas a Luna y su próxima fecha de refuerzo.'),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Carnet de Luna' })).toBeTruthy();
    const chips = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(chips).toEqual(['Rabia', 'Parvovirus', 'Moquillo']);
    expect(screen.getByText('1 de agosto de 2027')).toBeTruthy();
    expect(screen.getByText('Luna · Perro')).toBeTruthy();
  });

  it('enlaza a la edición del carnet y a la mascota', async () => {
    getPet.mockResolvedValue(pet);
    getVaccinationRecord.mockResolvedValue(record);
    renderPage();
    await screen.findByRole('heading', { name: 'Carnet de vacunación' });
    expect(screen.getByRole('link', { name: 'Editar carnet' }).getAttribute('href')).toBe(
      '/mascotas/1/carnet/editar',
    );
    expect(screen.getByRole('link', { name: 'Luna' }).getAttribute('href')).toBe('/mascotas/1');
    expect(screen.getByRole('link', { name: 'Mascotas' }).getAttribute('href')).toBe('/mascotas');
  });

  it('muestra el aviso de éxito que llega desde el formulario', async () => {
    getPet.mockResolvedValue(pet);
    getVaccinationRecord.mockResolvedValue(record);
    renderPage({ message: 'Carnet registrado correctamente.' });
    expect(await screen.findByText('Carnet registrado correctamente.')).toBeTruthy();
  });

  it('informa cuando la mascota no tiene carnet y ofrece registrarlo', async () => {
    getPet.mockResolvedValue(pet);
    getVaccinationRecord.mockRejectedValue(
      notFound('The pet does not have an associated vaccination record'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Carnet de vacunación no encontrado.',
    );
    expect(screen.getByRole('link', { name: 'Registrar carnet' }).getAttribute('href')).toBe(
      '/mascotas/1/carnet/nuevo',
    );
    expect(screen.queryByRole('link', { name: 'Editar carnet' })).toBeNull();
  });

  it('informa cuando la mascota no existe', async () => {
    getPet.mockRejectedValue(notFound('The pet with the given id was not found'));
    getVaccinationRecord.mockRejectedValue(notFound('The pet with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.queryByRole('link', { name: 'Registrar carnet' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Carnet de vacunación' })).toBeNull();
  });

  it('muestra el error de conexión al cargar el carnet', async () => {
    getPet.mockResolvedValue(pet);
    getVaccinationRecord.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('link', { name: 'Registrar carnet' })).toBeNull();
  });

  it('muestra el error de conexión al cargar la mascota', async () => {
    getPet.mockRejectedValue({ request: {} });
    getVaccinationRecord.mockResolvedValue(record);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('heading', { name: 'Carnet de vacunación' })).toBeNull();
  });
});