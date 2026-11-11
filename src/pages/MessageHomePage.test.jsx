// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdopters } from '../services/adoptionLookupService';
import MessageHomePage from './MessageHomePage';

vi.mock('../services/adoptionLookupService', () => ({ getAdopters: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mis-mensajes']}>
      <Routes>
        <Route path="/mis-mensajes" element={<MessageHomePage />} />
        <Route path="/adoptantes/:adopterId/mensajes" element={<p>Mensajes del adoptante</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('MessageHomePage', () => {
  it('lleva a los mensajes del primer adoptante registrado', async () => {
    getAdopters.mockResolvedValue([{ id: 7, name: 'Laura Gómez' }, { id: 8, name: 'Otro' }]);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Mensajes del adoptante')).toBeTruthy();
  });

  it('avisa cuando no hay adoptantes registrados', async () => {
    getAdopters.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/Aún no hay adoptantes registrados/)).toBeTruthy();
  });

  it('muestra el error cuando falla la consulta', async () => {
    getAdopters.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});