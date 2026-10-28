// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewCard from './ReviewCard';

afterEach(cleanup);

const renderCard = (review, props = {}) =>
  render(
    <MemoryRouter>
      <ReviewCard
        review={review}
        adopterId={7}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );

describe('ReviewCard', () => {
  it('muestra la calificación, el comentario y el enlace al detalle', () => {
    renderCard({ id: 3, rating: 5, comment: 'Excelente proceso' });
    expect(screen.getByRole('img', { name: 'Calificación: 5 de 5' })).toBeTruthy();
    expect(screen.getByText('5 de 5')).toBeTruthy();
    expect(screen.getByText('Excelente proceso')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Ver detalle de la reseña 3' }).getAttribute('href'),
    ).toBe('/adoptantes/7/resenas/3');
  });

  it('indica que no hay comentario cuando es opcional y no se escribió', () => {
    renderCard({ id: 4, rating: 3, comment: null });
    expect(screen.getByText('Sin comentario.')).toBeTruthy();
  });

  it('avisa al editar o eliminar', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderCard({ id: 3, rating: 5, comment: 'Bien' }, { onEdit, onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Editar la reseña 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar la reseña 3' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('bloquea las acciones y avisa mientras se elimina', () => {
    renderCard({ id: 3, rating: 5, comment: 'Bien' }, { deleting: true });
    const remove = screen.getByRole('button', { name: 'Eliminar la reseña 3' });
    expect(remove.textContent).toBe('Eliminando...');
    expect(remove.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Editar la reseña 3' }).disabled).toBe(true);
  });

  it('resalta la reseña que se está editando', () => {
    renderCard({ id: 3, rating: 5, comment: 'Bien' }, { editing: true });
    expect(document.querySelector('.review-card--editing')).toBeTruthy();
  });
});
