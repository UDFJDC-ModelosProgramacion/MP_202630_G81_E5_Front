// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getShelter, getShelters } from '../services/shelterService';
import { createVideo, getVideos, updateVideo } from '../services/videoService';
import ShelterVideosPage from './ShelterVideosPage';

vi.mock('../services/videoService', () => ({
  getVideos: vi.fn(),
  createVideo: vi.fn(),
  updateVideo: vi.fn(),
}));
vi.mock('../services/shelterService', () => ({ getShelter: vi.fn(), getShelters: vi.fn() }));

const shelter = { id: 7, name: 'Huellitas', city: 'Bogotá', shelterEvents: [] };
const shelters = [shelter, { id: 8, name: 'Patitas', city: 'Cali' }];
const videos = [
  { id: 1, url: 'https://videos.adoptaya.co/recorrido-patio.mp4' },
  { id: 2, url: 'https://videos.adoptaya.co/zona-de-cuidados.mp4' },
];
const NEW_URL = 'https://videos.adoptaya.co/area-de-cachorros.mp4';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const typeUrl = (value) =>
  fireEvent.change(screen.getByLabelText(/^URL del video/), { target: { value } });
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));

const renderPage = async () => {
  render(
    <MemoryRouter initialEntries={['/refugios/7/videos']}>
      <Routes>
        <Route path="/refugios/:id/videos" element={<ShelterVideosPage />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText('Mostrando 2 videos');
};

beforeEach(() => {
  vi.clearAllMocks();
  getShelter.mockResolvedValue(shelter);
  getShelters.mockResolvedValue(shelters);
  getVideos.mockResolvedValue(videos);
});

afterEach(cleanup);

describe('ShelterVideosPage - crear y editar', () => {
  it('muestra el panel Cargar video con el refugio preseleccionado', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { name: 'Cargar video' })).toBeTruthy();
    expect(screen.getByLabelText('Refugio').value).toBe('7');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('carga un video válido y lo agrega a la lista', async () => {
    createVideo.mockResolvedValue({ id: 3, url: NEW_URL, shelter });
    await renderPage();
    typeUrl(`  ${NEW_URL}  `);
    click('Cargar video');
    expect(await screen.findByText('Video cargado correctamente.')).toBeTruthy();
    expect(createVideo).toHaveBeenCalledWith('7', { url: NEW_URL });
    expect(screen.getByRole('link', { name: NEW_URL })).toBeTruthy();
    expect(screen.getByText('Mostrando 3 videos')).toBeTruthy();
    expect(screen.getByLabelText(/^URL del video/).value).toBe('');
  });

  it('rechaza una URL vacía sin llamar al back', async () => {
    await renderPage();
    click('Cargar video');
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^URL del video/));
    expect(createVideo).not.toHaveBeenCalled();
  });

  it('muestra el error del back cuando rechaza la URL', async () => {
    createVideo.mockRejectedValue(apiError(412, 'Video url is not valid'));
    await renderPage();
    typeUrl(NEW_URL);
    click('Cargar video');
    expect(await screen.findByText('La URL del video no es válida.')).toBeTruthy();
    expect(screen.getByLabelText(/^URL del video/).value).toBe(NEW_URL);
    expect(screen.getByText('Mostrando 2 videos')).toBeTruthy();
  });

  it('informa cuando el refugio ya no existe al cargar', async () => {
    createVideo.mockRejectedValue(
      apiError(404, 'The shelter with the given id was not found'),
    );
    await renderPage();
    typeUrl(NEW_URL);
    click('Cargar video');
    expect((await screen.findByRole('alert')).textContent).toContain('Refugio no encontrado.');
  });

  it('edita la URL de un video y conserva su refugio', async () => {
    updateVideo.mockResolvedValue({ id: 1 });
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar el video 1' }));
    expect(screen.getByRole('heading', { name: 'Editar video' })).toBeTruthy();
    expect(screen.getByLabelText(/^URL del video/).value).toBe(videos[0].url);
    expect(screen.getByLabelText('Refugio').disabled).toBe(true);
    typeUrl(NEW_URL);
    click('Guardar cambios');
    expect(await screen.findByText('Video actualizado correctamente.')).toBeTruthy();
    expect(updateVideo).toHaveBeenCalledWith('7', 1, { url: NEW_URL });
    expect(screen.getByRole('link', { name: NEW_URL })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Cargar video' })).toBeTruthy();
  });

  it('rechaza editar con una URL vacía', async () => {
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar el video 1' }));
    typeUrl('');
    click('Guardar cambios');
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(updateVideo).not.toHaveBeenCalled();
  });

  it('cancela la edición y vuelve al formulario de carga', async () => {
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar el video 2' }));
    click('Cancelar');
    expect(screen.getByRole('heading', { name: 'Cargar video' })).toBeTruthy();
    expect(updateVideo).not.toHaveBeenCalled();
  });

  it('cambia a la lista de otro refugio al elegirlo en el select', async () => {
    await renderPage();
    fireEvent.change(screen.getByLabelText('Refugio'), { target: { value: '8' } });
    await waitFor(() => expect(getVideos).toHaveBeenCalledWith('8'));
  });

  it('usa solo el refugio actual si no se pueden cargar los refugios', async () => {
    getShelters.mockRejectedValue({ request: {} });
    await renderPage();
    expect(await screen.findByRole('option', { name: 'Huellitas' })).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
});