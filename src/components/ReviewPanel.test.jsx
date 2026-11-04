// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ReviewPanel from './ReviewPanel';

afterEach(cleanup);

describe('ReviewPanel', () => {
  it('ofrece un formulario vacío para publicar una reseña nueva', () => {
    render(<ReviewPanel editing={null} formKey="new-0" onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Nueva reseña' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Publicar reseña' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.getAllByRole('radio').some((radio) => radio.checked)).toBe(false);
  });

  it('carga la reseña elegida para editarla y permite cancelar', () => {
    const onCancel = vi.fn();
    render(
      <ReviewPanel
        editing={{ id: 2, rating: 4, comment: 'Buen trato' }}
        formKey="edit-2"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Editar reseña' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '4 estrellas' }).checked).toBe(true);
    expect(screen.getByLabelText(/^Comentario/).value).toBe('Buen trato');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('lleva el foco al formulario cuando se empieza a editar', () => {
    render(
      <ReviewPanel
        editing={{ id: 2, rating: 4, comment: '' }}
        formKey="edit-2"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '1 estrella' }));
  });
});
