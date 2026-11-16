// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { createLifeEvent } from '../services/lifeEventService';
import { getPet } from '../services/petService';
import { getVeterinarians } from '../services/veterinarianService';
import LifeEventCreatePage from './LifeEventCreatePage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/veterinarianService', () => ({ getVeterinarians: vi.fn() }));
vi.mock('../services/lifeEventService', () => ({ createLifeEvent: vi.fn() }));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const veterinarians = [{ id: 1, name: 'Laura Martínez', specialty: 'Medicina interna' }];
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

function ListStub() {
  const { state } = useLocation();
  return <p>{`LISTADO ${state?.message ?? ''}`}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/eventos-de-vida/nuevo']}>
      <Routes>
        <Route path="/mascotas/:id/eventos-de-vida/nuevo" element={<LifeEventCreatePage />} />
        <Route path="/mascotas/:id/eventos-de-vida" element={<ListStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar evento' }));

function fillValid() {
  type('Tipo', 'Vacunación');
  type('Fecha', '2026-05-10');
}

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
  getVeterinarians.mockResolvedValue(veterinarians);
});

afterEach(cleanup);

describe('LifeEventCreatePage', () => {
  it('muestra el título, el aviso de campos obligatorios y la mascota', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Registrar evento' })).toBeTruthy();
    expect(
      screen.getByText('Tipo y fecha son obligatorios. El veterinario es opcional.'),
    ).toBeTruthy();
    expect(await screen.findByRole('option', { name: 'Luna · Perro' })).toBeTruthy();
    expect(getPet).toHaveBeenCalledWith('1');
  });

  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando datos/);
  });

  it('registra el evento con veterinario y vuelve al listado con aviso', async () => {
    createLifeEvent.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByLabelText('Tipo');
    fillValid();
    type(/^Descripción/, ' Refuerzo anual ');
    type(/^Veterinario/, '1');
    submit();
    expect(await screen.findByText('LISTADO Evento registrado correctamente.')).toBeTruthy();
    expect(createLifeEvent).toHaveBeenCalledWith(1, {
      type: 'Vacunación',
      date: '2026-05-10',
      description: 'Refuerzo anual',
      veterinarian: { id: 1 },
    });
  });

  it('registra el evento sin descripción ni veterinario', async () => {
    createLifeEvent.mockResolvedValue({ id: 5 });
    renderPage();
    await screen.findByLabelText('Tipo');
    fillValid();
    submit();
    await screen.findByText(/LISTADO/);
    expect(createLifeEvent).toHaveBeenCalledWith(1, {
      type: 'Vacunación',
      date: '2026-05-10',
      description: null,
    });
  });

  it('no llama al servicio si faltan el tipo y la fecha', async () => {
    renderPage();
    await screen.findByLabelText('Tipo');
    submit();
    expect(screen.getByText('El tipo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
    expect(createLifeEvent).not.toHaveBeenCalled();
  });

  it('muestra el error cuando el veterinario no existe', async () => {
    createLifeEvent.mockRejectedValue(
      apiError(404, 'The veterinarian with the given id was not found'),
    );
    renderPage();
    await screen.findByLabelText('Tipo');
    fillValid();
    type(/^Veterinario/, '1');
    submit();
    expect(await screen.findByText('Veterinario no encontrado.')).toBeTruthy();
    expect(screen.queryByText(/LISTADO/)).toBeNull();
  });

  it('informa cuando la mascota deja de existir al guardar', async () => {
    createLifeEvent.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    renderPage();
    await screen.findByLabelText('Tipo');
    fillValid();
    submit();
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
  });

  it('muestra el error de conexión al guardar', async () => {
    createLifeEvent.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByLabelText('Tipo');
    fillValid();
    submit();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });

  it('informa cuando la mascota no existe y no muestra el formulario', async () => {
    getPet.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.queryByLabelText('Tipo')).toBeNull();
  });

  it('muestra el error de conexión al cargar la mascota', async () => {
    getPet.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByLabelText('Tipo')).toBeNull();
  });

  it('avisa si no cargan los veterinarios y deja registrar sin veterinario', async () => {
    getVeterinarians.mockRejectedValue({ request: {} });
    createLifeEvent.mockResolvedValue({ id: 5 });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fillValid();
    submit();
    await waitFor(() => expect(createLifeEvent).toHaveBeenCalledTimes(1));
  });
});