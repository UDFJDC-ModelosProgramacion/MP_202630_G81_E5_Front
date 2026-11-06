// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  createShelterEvent,
  deleteShelterEvent,
  getShelterEvents,
  updateShelterEvent,
} from '../services/shelterEventService';
import { getShelter } from '../services/shelterService';
import ShelterEventsPage from './ShelterEventsPage';

vi.mock('../services/shelterEventService', () => ({
  getShelterEvents: vi.fn(),
  createShelterEvent: vi.fn(),
  updateShelterEvent: vi.fn(),
  deleteShelterEvent: vi.fn(),
}));
vi.mock('../services/shelterService', () => ({ getShelter: vi.fn() }));

const shelter = { id: 7, name: 'Huellitas', city: 'Bogotá', shelterEvents: [] };
const events = [
  { id: 1, title: 'Jornada de adopción', date: '2099-03-10T05:00:00.000+00:00', type: 'Jornada' },
  { id: 2, title: 'Feria pasada', date: '2020-03-10T05:00:00.000+00:00', type: null },
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/7/eventos']}>
      <Routes>
        <Route path="/refugios/:id/eventos" element={<ShelterEventsPage />} />
      </Routes>
    </MemoryRouter>,
  );

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  getShelter.mockResolvedValue(shelter);
  getShelterEvents.mockResolvedValue(events);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('ShelterEventsPage', () => {
  it('lista los eventos del refugio con el formulario lateral', async () => {
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Jornada de adopción')).toBeTruthy();
    expect(getShelterEvents).toHaveBeenCalledWith('7');
    expect(screen.getByRole('heading', { name: 'Eventos del refugio' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Huellitas' }).getAttribute('href')).toBe('/refugios/7');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Próximo')).toBeTruthy();
    expect(screen.getByText('Realizado')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo evento' })).toBeTruthy();
  });

  it('muestra un mensaje cuando el refugio aún no tiene eventos', async () => {
    getShelterEvents.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Este refugio aún no tiene eventos programados.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('informa que el refugio no fue encontrado y oculta el formulario', async () => {
    getShelter.mockRejectedValue(apiError(404, 'The shelter with the given id was not found'));
    getShelterEvents.mockRejectedValue(apiError(404, 'The shelter with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Nuevo evento' })).toBeNull();
  });

  it('permite reintentar cuando falla la conexión', async () => {
    getShelterEvents.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce(events);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Jornada de adopción')).toBeTruthy();
  });

  it('programa un evento nuevo y lo agrega a la lista', async () => {
    createShelterEvent.mockResolvedValue({
      id: 3,
      title: 'Taller de cuidados',
      date: '2099-05-20T05:00:00.000+00:00',
      type: null,
    });
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Taller de cuidados' } });
    fireEvent.change(screen.getByLabelText(/^Fecha/), { target: { value: '2099-05-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Programar evento' }));
    expect(await screen.findByText('Evento programado correctamente.')).toBeTruthy();
    expect(createShelterEvent).toHaveBeenCalledWith('7', {
      title: 'Taller de cuidados',
      date: '2099-05-20T12:00:00.000Z',
      type: null,
    });
    expect(screen.getByRole('heading', { name: 'Taller de cuidados' })).toBeTruthy();
  });

  it('rechaza un evento sin nombre ni fecha', async () => {
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.click(screen.getByRole('button', { name: 'Programar evento' }));
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
    expect(createShelterEvent).not.toHaveBeenCalled();
  });

  it('edita un evento y conserva el refugio', async () => {
    updateShelterEvent.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.click(screen.getByRole('button', { name: 'Editar el evento 1' }));
    expect(screen.getByRole('heading', { name: 'Editar evento' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Jornada renovada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Evento actualizado correctamente.')).toBeTruthy();
    expect(updateShelterEvent).toHaveBeenCalledWith('7', 1, {
      title: 'Jornada renovada',
      date: '2099-03-10T12:00:00.000Z',
      type: 'Jornada',
    });
    expect(screen.getByRole('heading', { name: 'Jornada renovada' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo evento' })).toBeTruthy();
  });

  it('elimina un evento que todavía no ha ocurrido', async () => {
    deleteShelterEvent.mockResolvedValue();
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el evento 1' }));
    expect(await screen.findByText('Evento eliminado correctamente.')).toBeTruthy();
    expect(deleteShelterEvent).toHaveBeenCalledWith('7', 1);
    expect(screen.queryByRole('heading', { name: 'Jornada de adopción' })).toBeNull();
  });

  it('no elimina un evento que ya ocurrió y muestra el aviso', async () => {
    renderPage();
    await screen.findByText('Feria pasada');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el evento 2' }));
    expect((await screen.findByRole('alert')).textContent).toContain(
      'No se puede eliminar un evento que ya ocurrió.',
    );
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(deleteShelterEvent).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Feria pasada' })).toBeTruthy();
  });

  it('no elimina si se cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el evento 1' }));
    expect(deleteShelterEvent).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Jornada de adopción' })).toBeTruthy();
  });

  it('muestra el mensaje del back cuando falla la eliminación', async () => {
    deleteShelterEvent.mockRejectedValue(apiError(412, 'Otra regla'));
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el evento 1' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Otra regla');
    expect(screen.getByRole('heading', { name: 'Jornada de adopción' })).toBeTruthy();
  });

  it('quita de la lista un evento que ya no existe en el back', async () => {
    deleteShelterEvent.mockRejectedValue(
      apiError(404, 'The shelter event with the given id was not found'),
    );
    renderPage();
    await screen.findByText('Jornada de adopción');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el evento 1' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Evento no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Jornada de adopción' })).toBeNull();
  });
});