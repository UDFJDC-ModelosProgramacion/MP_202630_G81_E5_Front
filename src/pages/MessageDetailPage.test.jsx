// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getMessage } from '../services/messageService';
import MessageDetailPage from './MessageDetailPage';

vi.mock('../services/messageService', () => ({ getMessage: vi.fn() }));

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adoptantes/7/mensajes/3']}>
      <Routes>
        <Route
          path="/adoptantes/:adopterId/mensajes/:messageId"
          element={<MessageDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('MessageDetailPage', () => {
  it('muestra el detalle del mensaje y permite volver a la lista', async () => {
    getMessage.mockResolvedValue({ id: 3, content: 'Hola, quiero adoptar', sentDate: '2026-11-05' });
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Detalle del mensaje' })).toBeTruthy();
    expect(getMessage).toHaveBeenCalledWith('7', '3');
    expect(screen.getByText('Hola, quiero adoptar')).toBeTruthy();
    expect(screen.getByText('05 nov 2026')).toBeTruthy();
    expect(screen.getByText('Enviado')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Volver a mis mensajes' }).getAttribute('href'),
    ).toBe('/adoptantes/7/mensajes');
    expect(screen.getByRole('link', { name: 'Mis mensajes' }).getAttribute('href')).toBe(
      '/adoptantes/7/mensajes',
    );
  });

  it('informa que el mensaje no fue encontrado', async () => {
    getMessage.mockRejectedValue(apiError(404, 'The message with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Mensaje no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Detalle del mensaje' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Volver a mis mensajes' })).toBeTruthy();
  });

  it('rechaza un mensaje que pertenece a otro adoptante', async () => {
    getMessage.mockRejectedValue(apiError(412, 'The message is not associated to the adopter'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Este mensaje pertenece a otro adoptante.',
    );
    expect(screen.queryByRole('heading', { name: 'Detalle del mensaje' })).toBeNull();
  });

  it('informa que el adoptante no fue encontrado', async () => {
    getMessage.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Adoptante no encontrado.');
  });
});