// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PhotoGrid from './PhotoGrid';

const photos = [
  { id: 10, url: 'https://x.co/a.jpg' },
  { id: 11, url: 'https://x.co/b.jpg' },
];

const renderGrid = (props = {}) =>
  render(
    <MemoryRouter>
      <PhotoGrid photos={photos} ownerName="Luna" basePath="/mascotas/1/fotos" {...props} />
    </MemoryRouter>,
  );

afterEach(cleanup);

describe('PhotoGrid', () => {
  it('muestra cada foto y enlaza a su detalle', () => {
    renderGrid();
    expect(screen.getByAltText('Foto 1 de Luna')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver Foto 2' }).getAttribute('href')).toBe(
      '/mascotas/1/fotos/11',
    );
  });

  it('no muestra acciones cuando no recibe callbacks', () => {
    renderGrid();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('llama a onEdit con la foto seleccionada', () => {
    const onEdit = vi.fn();
    renderGrid({ onEdit });
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 1' }));
    expect(onEdit).toHaveBeenCalledWith(photos[0]);
  });

  it('llama a onDelete con la foto y su etiqueta', () => {
    const onDelete = vi.fn();
    renderGrid({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Foto 2' }));
    expect(onDelete).toHaveBeenCalledWith(photos[1], 'Foto 2');
  });

  it('deshabilita Eliminar solo en la foto que se está eliminando', () => {
    renderGrid({ onDelete: vi.fn(), deletingId: 10 });
    expect(screen.getByRole('button', { name: 'Eliminar Foto 1' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar Foto 2' }).disabled).toBe(false);
  });
});