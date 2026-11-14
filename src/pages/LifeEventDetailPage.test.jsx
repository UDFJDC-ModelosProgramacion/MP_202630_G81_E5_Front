// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getLifeEvent } from '../services/lifeEventService';
import { getPet } from '../services/petService';
import LifeEventDetailPage from './LifeEventDetailPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn() }));
vi.mock('../services/lifeEventService', () => ({ getLifeEvent: vi.fn() }));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const lifeEvent = {
  id: 7,
  type: 'Vacunación',
  date: '2026-05-10T00:00:00.000+00:00',
  description: 'Aplicación de la vacuna antirrábica',
  veterinarian: { id: 1, name: 'Laura Martínez' },
};
const apiError = (status, message) => ({
  response: { status, data: { apierror: { message } } },
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/eventos-de-vida/7']}>
      <Routes>
        <Route path="/mascotas/:id/eventos-de-vida/:eventId" element={<LifeEventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

const valueOf = (label) => screen.getByText(label).nextElementSibling.textContent;

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
});

afterEach(cleanup);

describe('LifeEventDetailPage', () => {
  it('muestra el estado de carga', () => {
    getPet.mockReturnValue(new Promise(() => {}));
    getLifeEvent.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando evento/);
  });

  it('muestra los datos del evento', async () => {
    getLifeEvent.mockResolvedValue(lifeEvent);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Evento de vida' })).toBeTruthy();
    expect(getLifeEvent).toHaveBeenCalledWith('1', '7');
    expect(screen.getByText('Vacunación').className).toContain('life-event-badge--vaccination');
    expect(valueOf('Fecha')).toBe('10 may 2026');
    expect(valueOf('Veterinario')).toBe('Laura Martínez');
    expect(valueOf('Mascota')).toBe('Luna');
    expect(valueOf('Descripción')).toBe('Aplicación de la vacuna antirrábica');
  });

  it('muestra guiones cuando faltan la descripción y el veterinario', async () => {
    getLifeEvent.mockResolvedValue({ ...lifeEvent, description: null, veterinarian: null });
    renderPage();
    await screen.findByRole('heading', { name: 'Evento de vida' });
    expect(valueOf('Veterinario')).toBe('—');
    expect(valueOf('Descripción')).toBe('—');
  });

  it('enlaza a la edición y al listado', async () => {
    getLifeEvent.mockResolvedValue(lifeEvent);
    renderPage();
    await screen.findByRole('heading', { name: 'Evento de vida' });
    expect(screen.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe(
      '/mascotas/1/eventos-de-vida/7/editar',
    );
    expect(screen.getByRole('link', { name: 'Volver al listado' }).getAttribute('href')).toBe(
      '/mascotas/1/eventos-de-vida',
    );
    expect(screen.getByRole('link', { name: 'Eventos de vida' }).getAttribute('href')).toBe(
      '/mascotas/1/eventos-de-vida',
    );
  });

  it('informa cuando el evento no existe', async () => {
    getLifeEvent.mockRejectedValue(
      apiError(404, 'The life event with the given id was not found'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Evento de vida no encontrado.');
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Volver al listado' })).toBeTruthy();
  });

  it('rechaza consultar un evento de otra mascota', async () => {
    getLifeEvent.mockRejectedValue(apiError(412, 'The life event is not associated to the pet'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Este evento no pertenece a la mascota.',
    );
    expect(screen.queryByRole('heading', { name: 'Evento de vida' })).toBeNull();
  });

  it('informa cuando la mascota no existe', async () => {
    getPet.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    getLifeEvent.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Mascota no encontrada.');
    expect(screen.getAllByRole('alert').length).toBe(1);
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
  });

  it('muestra el error de conexión al cargar el evento', async () => {
    getLifeEvent.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });

  it('muestra el error de conexión al cargar la mascota', async () => {
    getPet.mockRejectedValue({ request: {} });
    getLifeEvent.mockResolvedValue(lifeEvent);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByRole('heading', { name: 'Evento de vida' })).toBeNull();
  });
});