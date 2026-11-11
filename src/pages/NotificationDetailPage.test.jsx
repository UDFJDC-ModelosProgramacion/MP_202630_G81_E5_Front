// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getNotification } from '../services/notificationService';
import NotificationDetailPage from './NotificationDetailPage';

vi.mock('../services/notificationService', () => ({ getNotification: vi.fn() }));

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/7/notificaciones/3']}>
      <Routes>
        <Route
          path="/refugios/:id/notificaciones/:notificationId"
          element={<NotificationDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('NotificationDetailPage', () => {
  it('muestra el canal y el mensaje de la notificación', async () => {
    getNotification.mockResolvedValue({ id: 3, channel: 'PUSH', message: 'Hay una nueva mascota' });
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Hay una nueva mascota')).toBeTruthy();
    expect(getNotification).toHaveBeenCalledWith('7', '3');
    expect(screen.getByText('PUSH')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Volver a las notificaciones' }).getAttribute('href'),
    ).toBe('/refugios/7/notificaciones');
  });

  it('informa que la notificación no fue encontrada', async () => {
    getNotification.mockRejectedValue(
      apiError(404, 'The notification with the given id was not found'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Notificación no encontrada.');
  });

  it('informa que el refugio no fue encontrado', async () => {
    getNotification.mockRejectedValue(apiError(404, 'The shelter with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
  });

  it('rechaza una notificación de otro refugio', async () => {
    getNotification.mockRejectedValue(
      apiError(412, 'The notification is not associated to the shelter'),
    );
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'La notificación pertenece a otro refugio.',
    );
  });

  it('muestra el error de conexión', async () => {
    getNotification.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});