// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getShelter } from '../services/shelterService';
import ShelterDetailPage from './ShelterDetailPage';

vi.mock('../services/shelterService', () => ({ getShelter: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ShelterDetailPage: notificaciones', () => {
  it('enlaza a las notificaciones del refugio', async () => {
    getShelter.mockResolvedValue({ id: 7, name: 'Huellitas', city: 'Bogotá', shelterEvents: [] });
    render(
      <MemoryRouter initialEntries={['/refugios/7']}>
        <Routes>
          <Route path="/refugios/:id" element={<ShelterDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const link = await screen.findByRole('link', { name: 'Notificaciones' });
    expect(link.getAttribute('href')).toBe('/refugios/7/notificaciones');
  });
});