// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewCard from './ReviewCard';

afterEach(cleanup);

const renderCard = (review) =>
  render(
    <MemoryRouter>
      <ReviewCard review={review} adopterId={7} />
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
});
