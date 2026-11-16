// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getShelterEvent } from '../services/shelterEventService';
import ShelterEventDetailPage from './ShelterEventDetailPage';

vi.mock('../services/shelterEventService', () => ({ getShelterEvent: vi.fn() }));

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/7/eventos/3']}>
      <Routes>
        <Route path="/refugios/:id/eventos/:eventId" element={<ShelterEventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('ShelterEventDetailPage', () => {
  it('muestra el nombre, la fecha, el tipo y el estado del evento', async () => {
    getShelterEvent.mockResolvedValue({
      id: 3,
      title: 'Jornada de adopción',
      date: '2099-03-10T05:00:00.000+00:00',
      type: 'Jornada',
    });
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Detalle del evento' })).toBeTruthy();
    expect(getShelterEvent).toHaveBeenCalledWith('7', '3');
    expect(screen.getByText('Jornada de adopción')).toBeTruthy();
    expect(screen.getByText('10 mar 2099')).toBeTruthy();
    expect(screen.getByText('Jornada')).toBeTruthy();
    expect(screen.getByText('Próximo')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Volver a los eventos' }).getAttribute('href'),
    ).toBe('/refugios/7/eventos');
  });

  it('informa que el evento no fue encontrado', async () => {
    getShelterEvent.mockRejectedValue(
      apiError(404, 'The shelter event with the given id was not found'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Evento no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Detalle del evento' })).toBeNull();
  });

  it('rechaza un evento que pertenece a otro refugio', async () => {
    getShelterEvent.mockRejectedValue(
      apiError(412, 'The shelter event is not associated to the shelter'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Este evento pertenece a otro refugio.',
    );
  });

  it('muestra el error de conexión', async () => {
    getShelterEvent.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});