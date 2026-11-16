// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getVideo } from '../services/videoService';
import VideoDetailPage from './VideoDetailPage';

vi.mock('../services/videoService', () => ({ getVideo: vi.fn() }));

const video = {
  id: 3,
  url: 'https://videos.adoptaya.co/area-de-cachorros.mp4',
  shelter: { id: 7, name: 'Huellitas' },
};

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refugios/7/videos/3']}>
      <Routes>
        <Route path="/refugios/:id/videos/:videoId" element={<VideoDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  getVideo.mockResolvedValue(video);
});

afterEach(cleanup);

describe('VideoDetailPage', () => {
  it('muestra el detalle del video con enlace para abrirlo', async () => {
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Detalle del video' })).toBeTruthy();
    expect(getVideo).toHaveBeenCalledWith('7', '3');
    expect(screen.getByText(video.url)).toBeTruthy();
    expect(screen.getByText('Huellitas')).toBeTruthy();
    const open = screen.getByRole('link', { name: 'Abrir video' });
    expect(open.getAttribute('href')).toBe(video.url);
    expect(open.getAttribute('target')).toBe('_blank');
    expect(open.getAttribute('rel')).toContain('noopener');
    expect(screen.getByRole('link', { name: 'Volver a los videos' }).getAttribute('href')).toBe(
      '/refugios/7/videos',
    );
  });

  it('no enlaza URLs que no son http(s)', async () => {
    getVideo.mockResolvedValue({ ...video, url: 'javascript:alert(1)' });
    renderPage();
    expect(await screen.findByText('javascript:alert(1)')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Abrir video' })).toBeNull();
  });

  it('informa que el video no fue encontrado', async () => {
    getVideo.mockRejectedValue(apiError(404, 'The video with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Video no encontrado.');
    expect(screen.queryByRole('heading', { name: 'Detalle del video' })).toBeNull();
  });

  it('informa que el refugio no fue encontrado', async () => {
    getVideo.mockRejectedValue(apiError(404, 'The shelter with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
  });

  it('rechaza un video que pertenece a otro refugio', async () => {
    getVideo.mockRejectedValue(apiError(412, 'The video is not associated to the shelter'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Este video pertenece a otro refugio.',
    );
    expect(screen.queryByRole('link', { name: 'Abrir video' })).toBeNull();
  });
  
  it('reproduce el video dentro de la página cuando es un archivo de video', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Detalle del video' });
    expect(document.querySelector('video').getAttribute('src')).toBe(video.url);
  });

  it('no muestra reproductor si la URL no es de un video', async () => {
    getVideo.mockResolvedValue({ ...video, url: 'https://example.com/pagina' });
    renderPage();
    await screen.findByRole('heading', { name: 'Detalle del video' });
    expect(document.querySelector('video')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('link', { name: 'Abrir video' })).toBeTruthy();
  });
});