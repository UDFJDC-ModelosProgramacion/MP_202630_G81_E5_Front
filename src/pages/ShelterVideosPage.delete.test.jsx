// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getShelter, getShelters } from '../services/shelterService';
import { deleteVideo, getVideos } from '../services/videoService';
import ShelterVideosPage from './ShelterVideosPage';

vi.mock('../services/videoService', () => ({
  getVideos: vi.fn(),
  createVideo: vi.fn(),
  updateVideo: vi.fn(),
  deleteVideo: vi.fn(),
}));
vi.mock('../services/shelterService', () => ({ getShelter: vi.fn(), getShelters: vi.fn() }));

const shelter = { id: 7, name: 'Huellitas', city: 'Bogotá', shelterEvents: [] };
const videos = [
  { id: 1, url: 'https://videos.adoptaya.co/recorrido-patio.mp4' },
  { id: 2, url: 'https://videos.adoptaya.co/zona-de-cuidados.mp4' },
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const clickDelete = (id) => fireEvent.click(screen.getByRole('button', { name: `Eliminar el video ${id}` }));
const hasVideo = (index) => screen.queryByRole('link', { name: videos[index].url });

let confirmSpy;

beforeEach(async () => {
  vi.clearAllMocks();
  getShelter.mockResolvedValue(shelter);
  getShelters.mockResolvedValue([shelter]);
  getVideos.mockResolvedValue(videos);
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  render(
    <MemoryRouter initialEntries={['/refugios/7/videos']}>
      <Routes>
        <Route path="/refugios/:id/videos" element={<ShelterVideosPage />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText('Mostrando 2 videos');
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('ShelterVideosPage - eliminar', () => {
  it('elimina un video propio y lo quita de la lista', async () => {
    deleteVideo.mockResolvedValue();
    clickDelete(1);
    expect(await screen.findByText('Video eliminado correctamente.')).toBeTruthy();
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(deleteVideo).toHaveBeenCalledWith('7', 1);
    expect(hasVideo(0)).toBeNull();
    expect(hasVideo(1)).toBeTruthy();
    expect(screen.getByText('Mostrando 1 video')).toBeTruthy();
  });

  it('muestra el mensaje de lista vacía al eliminar el último video', async () => {
    getVideos.mockResolvedValue([videos[0]]);
    cleanup();
    render(
      <MemoryRouter initialEntries={['/refugios/7/videos']}>
        <Routes>
          <Route path="/refugios/:id/videos" element={<ShelterVideosPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('Mostrando 1 video');
    deleteVideo.mockResolvedValue();
    clickDelete(1);
    expect(await screen.findByText('Este refugio aún no tiene videos.')).toBeTruthy();
  });

  it('no elimina si se cancela la confirmación', () => {
    confirmSpy.mockReturnValue(false);
    clickDelete(1);
    expect(deleteVideo).not.toHaveBeenCalled();
    expect(hasVideo(0)).toBeTruthy();
  });

  it('rechaza eliminar un video de otro refugio y lo deja en la lista', async () => {
    deleteVideo.mockRejectedValue(apiError(412, 'The video is not associated to the shelter'));
    clickDelete(1);
    expect((await screen.findByRole('alert')).textContent).toContain(
      'No se puede eliminar el video: Este video pertenece a otro refugio.',
    );
    expect(hasVideo(0)).toBeTruthy();
  });

  it('quita de la lista un video que ya no existe en el back', async () => {
    deleteVideo.mockRejectedValue(apiError(404, 'The video with the given id was not found'));
    clickDelete(1);
    expect((await screen.findByRole('alert')).textContent).toContain('Video no encontrado.');
    expect(hasVideo(0)).toBeNull();
  });

  it('informa cuando el refugio no existe y conserva la lista', async () => {
    deleteVideo.mockRejectedValue(apiError(404, 'The shelter with the given id was not found'));
    clickDelete(1);
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
    expect(hasVideo(0)).toBeTruthy();
  });

  it('informa cuando falla la conexión', async () => {
    deleteVideo.mockRejectedValue({ request: {} });
    clickDelete(1);
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(hasVideo(0)).toBeTruthy();
  });

  it('deshabilita las acciones del video mientras se elimina', async () => {
    deleteVideo.mockReturnValue(new Promise(() => {}));
    clickDelete(1);
    const busy = await screen.findByRole('button', { name: 'Eliminar el video 1' });
    expect(busy.textContent).toBe('Eliminando...');
    expect(busy.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Editar el video 1' }).disabled).toBe(true);
  });

  it('vuelve al formulario de carga si se elimina el video que se editaba', async () => {
    deleteVideo.mockResolvedValue();
    fireEvent.click(screen.getByRole('button', { name: 'Editar el video 1' }));
    expect(screen.getByRole('heading', { name: 'Editar video' })).toBeTruthy();
    clickDelete(1);
    expect(await screen.findByText('Video eliminado correctamente.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Cargar video' })).toBeTruthy();
  });
});