// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from '../services/notificationService';
import { getShelter } from '../services/shelterService';
import NotificationListPage from './NotificationListPage';

vi.mock('../services/notificationService', () => ({
  getNotifications: vi.fn(),
  createNotification: vi.fn(),
  updateNotification: vi.fn(),
  deleteNotification: vi.fn(),
}));
vi.mock('../services/shelterService', () => ({ getShelter: vi.fn() }));

const shelter = { id: 7, name: 'Huellitas', city: 'Bogotá' };
const notifications = [
  { id: 1, channel: 'EMAIL', message: 'Recordatorio de vacunación', date: '2026-03-10T05:00:00.000+00:00' },
  { id: 2, channel: 'SMS', message: 'Tu cita fue confirmada', date: '2026-03-11T05:00:00.000+00:00' },
];
const SHELTER_NOT_FOUND = 'The shelter with the given id was not found';
const NOTIFICATION_NOT_FOUND = 'The notification with the given id was not found';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/7/notificaciones']}>
      <Routes>
        <Route path="/refugios/:id/notificaciones" element={<NotificationListPage />} />
      </Routes>
    </MemoryRouter>,
  );

const messageBox = () => screen.getByLabelText(/^Mensaje/);
const typeMessage = (value) => fireEvent.change(messageBox(), { target: { value } });
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  getShelter.mockResolvedValue(shelter);
  getNotifications.mockResolvedValue(notifications);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('NotificationListPage: consulta', () => {
  it('lista las notificaciones del refugio con el formulario lateral', async () => {
    const { container } = renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Recordatorio de vacunación')).toBeTruthy();
    expect(await screen.findByText(/Huellitas/)).toBeTruthy();
    expect(getNotifications).toHaveBeenCalledWith('7');
    expect(screen.getByRole('heading', { name: 'Notificaciones' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Refugios' }).getAttribute('href')).toBe('/refugios');
    const badges = [...container.querySelectorAll('.notification-badge')].map((b) => b.textContent);
    expect(badges).toEqual(['EMAIL', 'SMS']);
    expect(screen.getByRole('heading', { name: 'Nueva notificación' })).toBeTruthy();
    expect(screen.getByLabelText('Canal').value).toBe('EMAIL');
    expect(
      screen.getByRole('link', { name: 'Ver detalle de la notificación 1' }).getAttribute('href'),
    ).toBe('/refugios/7/notificaciones/1');
  });

  it('muestra un mensaje cuando el refugio no ha enviado notificaciones', async () => {
    getNotifications.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Este refugio aún no ha enviado notificaciones.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('informa que el refugio no fue encontrado y oculta el formulario', async () => {
    getShelter.mockRejectedValue(apiError(404, SHELTER_NOT_FOUND));
    getNotifications.mockRejectedValue(apiError(404, SHELTER_NOT_FOUND));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Nueva notificación' })).toBeNull();
  });

  it('permite reintentar cuando falla la conexión', async () => {
    getNotifications.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce(notifications);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    click('Reintentar');
    expect(await screen.findByText('Recordatorio de vacunación')).toBeTruthy();
  });
});

describe('NotificationListPage: crear', () => {
  it('envía una notificación válida y la agrega a la lista', async () => {
    createNotification.mockResolvedValue({
      id: 3,
      channel: 'SMS',
      message: 'Hola a todos',
      date: '2026-11-10T05:00:00.000+00:00',
    });
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    fireEvent.change(screen.getByLabelText('Canal'), { target: { value: 'SMS' } });
    typeMessage('  Hola a todos  ');
    click('Enviar notificación');
    expect(await screen.findByText('Notificación enviada correctamente.')).toBeTruthy();
    expect(createNotification).toHaveBeenCalledWith('7', {
      channel: 'SMS',
      message: 'Hola a todos',
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T12:00:00\.000Z$/),
    });
    expect(screen.getByText('Hola a todos')).toBeTruthy();
    expect(messageBox().value).toBe('');
  });

  it('rechaza un mensaje vacío', async () => {
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    click('Enviar notificación');
    expect(screen.getByText('El mensaje es obligatorio.')).toBeTruthy();
    expect(createNotification).not.toHaveBeenCalled();
  });

  it('rechaza un mensaje con solo espacios', async () => {
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    typeMessage('     ');
    click('Enviar notificación');
    expect(screen.getByText('El mensaje es obligatorio.')).toBeTruthy();
    expect(createNotification).not.toHaveBeenCalled();
  });

  it('muestra el error del back cuando el canal es rechazado', async () => {
    createNotification.mockRejectedValue(
      apiError(412, 'Notification channel must be EMAIL, SMS or PUSH'),
    );
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    typeMessage('Hola');
    click('Enviar notificación');
    expect((await screen.findByRole('alert')).textContent).toContain(
      'El canal debe ser EMAIL, SMS o PUSH.',
    );
  });

  it('informa que el refugio no existe al crear', async () => {
    createNotification.mockRejectedValue(apiError(412, 'Shelter is not valid'));
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    typeMessage('Hola');
    click('Enviar notificación');
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
  });

  it('limpia el formulario al cancelar mientras se crea', async () => {
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    typeMessage('Borrador');
    click('Cancelar');
    expect(messageBox().value).toBe('');
  });
});

describe('NotificationListPage: editar', () => {
  const startEdit = async () => {
    const view = renderPage();
    await screen.findByText('Recordatorio de vacunación');
    click('Editar la notificación 1');
    return view;
  };

  it('carga la notificación en el formulario y conserva el id y la fecha', async () => {
    updateNotification.mockResolvedValue({ id: 1 });
    const { container } = await startEdit();
    expect(screen.getByRole('heading', { name: 'Editar notificación' })).toBeTruthy();
    expect(container.querySelector('.notification-card--editing')).toBeTruthy();
    expect(messageBox().value).toBe('Recordatorio de vacunación');
    typeMessage('Recordatorio actualizado');
    click('Guardar cambios');
    expect(await screen.findByText('Notificación actualizada correctamente.')).toBeTruthy();
    expect(updateNotification).toHaveBeenCalledWith('7', 1, {
      id: 1,
      channel: 'EMAIL',
      message: 'Recordatorio actualizado',
      date: '2026-03-10T05:00:00.000+00:00',
    });
    expect(screen.getByText('Recordatorio actualizado')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nueva notificación' })).toBeTruthy();
  });

  it('rechaza un mensaje vacío al editar', async () => {
    await startEdit();
    typeMessage('');
    click('Guardar cambios');
    expect(screen.getByText('El mensaje es obligatorio.')).toBeTruthy();
    expect(updateNotification).not.toHaveBeenCalled();
  });

  it('muestra el error del back cuando el cambio es rechazado', async () => {
    updateNotification.mockRejectedValue(
      apiError(412, 'Notification channel must be EMAIL, SMS or PUSH'),
    );
    await startEdit();
    click('Guardar cambios');
    expect((await screen.findByRole('alert')).textContent).toContain(
      'El canal debe ser EMAIL, SMS o PUSH.',
    );
    expect(screen.getByRole('heading', { name: 'Editar notificación' })).toBeTruthy();
  });

  it('cancela la edición y vuelve al formulario nuevo', async () => {
    const { container } = await startEdit();
    click('Cancelar');
    expect(screen.getByRole('heading', { name: 'Nueva notificación' })).toBeTruthy();
    expect(container.querySelector('.notification-card--editing')).toBeNull();
  });
});

describe('NotificationListPage: eliminar', () => {
  it('elimina una notificación y la quita de la lista', async () => {
    deleteNotification.mockResolvedValue();
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    click('Eliminar la notificación 1');
    expect(await screen.findByText('Notificación eliminada correctamente.')).toBeTruthy();
    expect(deleteNotification).toHaveBeenCalledWith('7', 1);
    expect(screen.queryByText('Recordatorio de vacunación')).toBeNull();
  });

  it('no elimina si se cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    click('Eliminar la notificación 1');
    expect(deleteNotification).not.toHaveBeenCalled();
    expect(screen.getByText('Recordatorio de vacunación')).toBeTruthy();
  });

  it('rechaza eliminar una notificación de otro refugio', async () => {
    deleteNotification.mockRejectedValue(
      apiError(412, 'The notification is not associated to the shelter'),
    );
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    click('Eliminar la notificación 1');
    expect((await screen.findByRole('alert')).textContent).toContain(
      'La notificación pertenece a otro refugio.',
    );
    expect(screen.getByText('Recordatorio de vacunación')).toBeTruthy();
  });

  it('quita de la lista una notificación que ya no existe', async () => {
    deleteNotification.mockRejectedValue(apiError(404, NOTIFICATION_NOT_FOUND));
    renderPage();
    await screen.findByText('Recordatorio de vacunación');
    click('Eliminar la notificación 1');
    expect((await screen.findByRole('alert')).textContent).toContain('Notificación no encontrada.');
    expect(screen.queryByText('Recordatorio de vacunación')).toBeNull();
  });
});