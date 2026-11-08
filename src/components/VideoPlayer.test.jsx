// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';

afterEach(cleanup);

describe('VideoPlayer', () => {
  it('reproduce un archivo de video con controles', () => {
    render(<VideoPlayer url="https://videos.adoptaya.co/a.mp4" />);
    const video = screen.getByLabelText('Reproductor del video');
    expect(video.tagName).toBe('VIDEO');
    expect(video.getAttribute('src')).toBe('https://videos.adoptaya.co/a.mp4');
    expect(video.hasAttribute('controls')).toBe(true);
  });

  it('incrusta los enlaces de YouTube', () => {
    render(<VideoPlayer url="https://youtu.be/dQw4w9WgXcQ" />);
    expect(screen.getByTitle('Reproductor del video').getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('no muestra nada si la URL no se puede reproducir', () => {
    const { container } = render(<VideoPlayer url="https://example.com/pagina" />);
    expect(container.firstChild).toBeNull();
  });

  it('avisa si el archivo no se puede reproducir', () => {
    render(<VideoPlayer url="https://videos.adoptaya.co/a.mp4" />);
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.error(screen.getByLabelText('Reproductor del video'));
    expect(screen.getByRole('status').textContent).toContain('No se pudo reproducir el video');
  });
});