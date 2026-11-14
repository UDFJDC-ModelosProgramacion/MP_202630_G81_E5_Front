// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { deleteLifeEvent, getLifeEvents } from '../services/lifeEventService';
import { getPet } from '../services/petService';
import LifeEventListPage from './LifeEventListPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/lifeEventService', () => ({
  getLifeEvents: vi.fn(),
  deleteLifeEvent: vi.fn(),
}));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const events = [
  {
    id: 1,
    type: 'Cirugía',
    date: '2026-01-15T00:00:00.000+00:00',
    description: 'Esterilización sin complicaciones',
    veterinarian: { id: 1, name: 'Laura Martínez' },
  },
  {
    id: 2,
    type: 'Vacunación',
    date: '2026-05-10T00:00:00.000+00:00',
    description: 'Aplicación de la vacuna antirrábica',
    veterinarian: { id: 1, name: 'Laura Martínez' },
  },
];
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/eventos-de-vida']}>
      <Routes>
        <Route path="/mascotas/:id/eventos-de-vida" element={<LifeEventListPage />} />
      </Routes>
    </MemoryRouter>,
  );

const clickDelete = (label) =>
  fireEvent.click(screen.getByRole('button', { name: `Eliminar ${label}` }));
const rowLink = (date) => screen.queryByRole('link', { name: date });

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
  getLifeEvents.mockResolvedValue(events);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('LifeEventListPage - eliminar', () => {
  it('elimina un evento propio y lo quita de la lista', async () => {
    deleteLifeEvent.mockResolvedValue();
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect(await screen.findByText('Evento eliminado correctamente.')).toBeTruthy();
    expect(deleteLifeEvent).toHaveBeenCalledWith('1', 2);
    expect(rowLink('10 may 2026')).toBeNull();
    expect(screen.getByText('Mostrando 1 evento')).toBeTruthy();
  });

  it('pide confirmación antes de eliminar', async () => {
    deleteLifeEvent.mockResolvedValue();
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Eliminar el evento de Vacunación del 10 may 2026? Esta acción no se puede deshacer.',
    );
    await screen.findByText('Evento eliminado correctamente.');
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect(deleteLifeEvent).not.toHaveBeenCalled();
    expect(rowLink('10 may 2026')).toBeTruthy();
  });

  it('informa cuando el evento ya no existe y lo quita de la lista', async () => {
    deleteLifeEvent.mockRejectedValue(
      apiError(404, 'The life event with the given id was not found'),
    );
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect(await screen.findByText('Evento de vida no encontrado.')).toBeTruthy();
    expect(rowLink('10 may 2026')).toBeNull();
  });

  it('informa cuando la mascota ya no existe y conserva el evento', async () => {
    deleteLifeEvent.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
    expect(rowLink('10 may 2026')).toBeTruthy();
  });

  it('rechaza eliminar un evento de otra mascota y lo conserva', async () => {
    deleteLifeEvent.mockRejectedValue(apiError(412, 'The life event is not associated to the pet'));
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Cirugía del 15 ene 2026');
    expect(await screen.findByText('Este evento no pertenece a la mascota.')).toBeTruthy();
    expect(rowLink('15 ene 2026')).toBeTruthy();
  });

  it('muestra el error de conexión si falla el borrado y conserva el evento', async () => {
    deleteLifeEvent.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(rowLink('10 may 2026')).toBeTruthy();
  });

  it('deshabilita el botón del evento mientras se elimina', async () => {
    deleteLifeEvent.mockReturnValue(new Promise(() => {}));
    renderPage();
    await screen.findByText('Mostrando 2 eventos');
    clickDelete('Vacunación del 10 may 2026');
    expect(
      screen.getByRole('button', { name: 'Eliminar Vacunación del 10 may 2026' }).disabled,
    ).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar Cirugía del 15 ene 2026' }).disabled).toBe(
      false,
    );
  });

  it('muestra el estado vacío al eliminar el último evento', async () => {
    getLifeEvents.mockResolvedValue([events[1]]);
    deleteLifeEvent.mockResolvedValue();
    renderPage();
    await screen.findByText('Mostrando 1 evento');
    clickDelete('Vacunación del 10 may 2026');
    expect(
      await screen.findByText('Esta mascota aún no tiene eventos de vida registrados.'),
    ).toBeTruthy();
  });
});