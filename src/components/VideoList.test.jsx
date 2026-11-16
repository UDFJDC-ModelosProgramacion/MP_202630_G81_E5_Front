// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VideoList from './VideoList';

afterEach(cleanup);

const videos = [
  { id: 1, url: 'https://videos.adoptaya.co/recorrido-patio.mp4' },
  { id: 2, url: 'https://videos.adoptaya.co/zona-de-cuidados.mp4' },
];

const renderList = (props = {}) =>
  render(
    <MemoryRouter>
      <VideoList videos={videos} shelterId="7" {...props} />
    </MemoryRouter>,
  );

describe('VideoList', () => {
  it('lista los videos con enlace al detalle y el contador', () => {
    renderList();
    expect(screen.getByRole('heading', { name: 'Videos publicados' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: 'https://videos.adoptaya.co/recorrido-patio.mp4' }).getAttribute('href'),
    ).toBe('/refugios/7/videos/1');
    expect(screen.getByText('Mostrando 2 videos')).toBeTruthy();
  });

  it('usa el singular cuando hay un solo video', () => {
    renderList({ videos: [videos[0]] });
    expect(screen.getByText('Mostrando 1 video')).toBeTruthy();
  });

  it('muestra un mensaje cuando no hay videos y oculta el contador', () => {
    renderList({ videos: [] });
    expect(screen.getByText('Este refugio aún no tiene videos.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByText(/Mostrando/)).toBeNull();
  });

  it('no muestra acciones si no se reciben manejadores', () => {
    renderList();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('llama a onEdit y onDelete con el video de la fila', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderList({ onEdit, onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Editar el video 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el video 1' }));
    expect(onEdit).toHaveBeenCalledWith(videos[1]);
    expect(onDelete).toHaveBeenCalledWith(videos[0]);
  });

  it('deshabilita las acciones del video que se está eliminando', () => {
    renderList({ onEdit: vi.fn(), onDelete: vi.fn(), deletingId: 1 });
    expect(screen.getByRole('button', { name: 'Eliminar el video 1' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Editar el video 1' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar el video 2' }).disabled).toBe(false);
    expect(screen.getByText('Eliminando...')).toBeTruthy();
  });

  it('marca la fila que se está editando', () => {
    renderList({ onEdit: vi.fn(), editingId: 2 });
    expect(screen.getAllByRole('listitem')[1].className).toContain('video-list__item--editing');
    expect(screen.getAllByRole('listitem')[0].className).not.toContain('video-list__item--editing');
  });
});