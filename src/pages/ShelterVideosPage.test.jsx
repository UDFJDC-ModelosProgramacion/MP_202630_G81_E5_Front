// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getShelter, getShelters } from '../services/shelterService';
import { getVideos } from '../services/videoService';
import ShelterVideosPage from './ShelterVideosPage';

vi.mock('../services/videoService', () => ({getVideos: vi.fn(),createVideo: vi.fn(),updateVideo: vi.fn(),}));
vi.mock('../services/shelterService', () => ({ getShelter: vi.fn(), getShelters: vi.fn() }));

const shelter = { id: 7, name: 'Huellitas', city: 'Bogotá', shelterEvents: [] };
const videos = [
  { id: 1, url: 'https://videos.adoptaya.co/recorrido-patio.mp4' },
  { id: 2, url: 'https://videos.adoptaya.co/zona-de-cuidados.mp4' },
];
const SHELTER_404 = {
  response: { status: 404, data: { apierror: { message: 'The shelter with the given id was not found' } } },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/7/videos']}>
      <Routes>
        <Route path="/refugios/:id/videos" element={<ShelterVideosPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  getShelter.mockResolvedValue(shelter);
  getShelters.mockResolvedValue([shelter]);
  getVideos.mockResolvedValue(videos);
});

afterEach(cleanup);

describe('ShelterVideosPage', () => {
  it('lista los videos del refugio', async () => {
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(
      await screen.findByRole('link', { name: 'https://videos.adoptaya.co/recorrido-patio.mp4' }),
    ).toBeTruthy();
    expect(getVideos).toHaveBeenCalledWith('7');
    expect(screen.getByRole('heading', { name: 'Videos del refugio' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Videos publicados' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Huellitas' }).getAttribute('href')).toBe('/refugios/7');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Mostrando 2 videos')).toBeTruthy();
  });

  it('muestra un mensaje cuando el refugio aún no tiene videos', async () => {
    getVideos.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Este refugio aún no tiene videos.')).toBeTruthy();
  });

  it('informa que el refugio no fue encontrado', async () => {
    getShelter.mockRejectedValue(SHELTER_404);
    getVideos.mockRejectedValue(SHELTER_404);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Videos publicados' })).toBeNull();
  });

  it('permite reintentar cuando falla la conexión', async () => {
    getVideos.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce(videos);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(
      await screen.findByRole('link', { name: 'https://videos.adoptaya.co/zona-de-cuidados.mp4' }),
    ).toBeTruthy();
  });
});