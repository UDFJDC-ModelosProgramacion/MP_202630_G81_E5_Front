// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getLifeEvent, updateLifeEvent } from '../services/lifeEventService';
import { getPet } from '../services/petService';
import { getVeterinarians } from '../services/veterinarianService';
import LifeEventEditPage from './LifeEventEditPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/veterinarianService', () => ({ getVeterinarians: vi.fn() }));
vi.mock('../services/lifeEventService', () => ({
  getLifeEvent: vi.fn(),
  updateLifeEvent: vi.fn(),
}));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const laura = { id: 1, name: 'Laura Martínez', specialty: 'Medicina interna' };
const lifeEvent = {
  id: 7,
  type: 'Vacunación',
  date: '2026-05-10T00:00:00.000+00:00',
  description: 'Refuerzo anual',
  veterinarian: laura,
};
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

function ListStub() {
  const { state } = useLocation();
  return <p>{`LISTADO ${state?.message ?? ''}`}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/eventos-de-vida/7/editar']}>
      <Routes>
        <Route path="/mascotas/:id/eventos-de-vida/:eventId/editar" element={<LifeEventEditPage />} />
        <Route path="/mascotas/:id/eventos-de-vida" element={<ListStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
  getLifeEvent.mockResolvedValue(lifeEvent);
  getVeterinarians.mockResolvedValue([laura]);
});

afterEach(cleanup);

describe('LifeEventEditPage', () => {
  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando evento/);
  });

  it('precarga el evento y muestra la mascota bloqueada', async () => {
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    expect(getLifeEvent).toHaveBeenCalledWith('1', '7');
    expect(screen.getByLabelText('Tipo').value).toBe('Vacunación');
    expect(screen.getByLabelText('Fecha').value).toBe('2026-05-10');
    expect(screen.getByLabelText(/^Veterinario/).value).toBe('1');
    expect(screen.getByLabelText('Mascota').disabled).toBe(true);
    expect(screen.getByRole('option', { name: 'Luna · Perro' })).toBeTruthy();
  });

  it('guarda los cambios conservando el id y vuelve al listado', async () => {
    updateLifeEvent.mockResolvedValue({ id: 7 });
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    type('Tipo', 'Control');
    submit();
    expect(await screen.findByText('LISTADO Cambios guardados correctamente.')).toBeTruthy();
    expect(updateLifeEvent).toHaveBeenCalledWith(1, 7, {
      id: 7,
      type: 'Control',
      date: '2026-05-10',
      description: 'Refuerzo anual',
      veterinarian: { id: 1 },
    });
  });

  it('permite quitar el veterinario del evento', async () => {
    updateLifeEvent.mockResolvedValue({ id: 7 });
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    type(/^Veterinario/, '');
    submit();
    await screen.findByText(/LISTADO/);
    expect('veterinarian' in updateLifeEvent.mock.calls[0][2]).toBe(false);
  });

  it('rechaza un tipo o una fecha vacíos sin llamar al servicio', async () => {
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    type('Tipo', '');
    type('Fecha', '');
    submit();
    expect(screen.getByText('El tipo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
    expect(updateLifeEvent).not.toHaveBeenCalled();
  });

  it('rechaza guardar un evento de otra mascota', async () => {
    updateLifeEvent.mockRejectedValue(apiError(412, 'The life event is not associated to the pet'));
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    submit();
    expect(await screen.findByText('Este evento no pertenece a la mascota.')).toBeTruthy();
  });

  it('informa cuando el evento ya no existe al guardar', async () => {
    updateLifeEvent.mockRejectedValue(
      apiError(404, 'The life event with the given id was not found'),
    );
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    submit();
    expect(await screen.findByText('Evento de vida no encontrado.')).toBeTruthy();
  });

  it('informa cuando el veterinario no existe al guardar', async () => {
    updateLifeEvent.mockRejectedValue(
      apiError(404, 'The veterinarian with the given id was not found'),
    );
    renderPage();
    await screen.findByDisplayValue('Refuerzo anual');
    submit();
    expect(await screen.findByText('Veterinario no encontrado.')).toBeTruthy();
  });

  it('informa cuando el evento no existe y no muestra el formulario', async () => {
    getLifeEvent.mockRejectedValue(apiError(404, 'The life event with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Evento de vida no encontrado.');
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('rechaza editar un evento de otra mascota al cargarlo', async () => {
    getLifeEvent.mockRejectedValue(apiError(412, 'The life event is not associated to the pet'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Este evento no pertenece a la mascota.',
    );
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('informa cuando la mascota no existe', async () => {
    getPet.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    getLifeEvent.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.getAllByRole('alert').length).toBe(1);
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('muestra el error de conexión al cargar el evento', async () => {
    getLifeEvent.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('conserva al veterinario del evento aunque falle la lista de veterinarios', async () => {
    getVeterinarians.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByRole('option', { name: 'Laura Martínez · Medicina interna' })).toBeTruthy();
    expect(screen.getByLabelText(/^Veterinario/).value).toBe('1');
  });
});