// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getReview } from '../services/reviewService';
import ReviewDetailPage from './ReviewDetailPage';

vi.mock('../services/reviewService', () => ({ getReview: vi.fn() }));

const review = { id: 2, rating: 4, comment: 'Buen acompañamiento', adopter: { id: 7, name: 'Laura Gómez' } };
const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adoptantes/7/resenas/2']}>
      <Routes>
        <Route path="/adoptantes/:adopterId/resenas/:reviewId" element={<ReviewDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ReviewDetailPage', () => {
  it('muestra el adoptante, la calificación y el comentario', async () => {
    getReview.mockResolvedValue(review);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Detalle de la reseña' })).toBeTruthy();
    expect(getReview).toHaveBeenCalledWith('7', '2');
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('4 de 5')).toBeTruthy();
    expect(screen.getByText('Buen acompañamiento')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Volver a mis reseñas' }).getAttribute('href'),
    ).toBe('/adoptantes/7/resenas');
  });

  it('muestra un guion cuando la reseña no tiene comentario', async () => {
    getReview.mockResolvedValue({ ...review, comment: null });
    renderPage();
    expect(await screen.findByText('—')).toBeTruthy();
  });

  it('rechaza la consulta de una reseña de otro adoptante', async () => {
    getReview.mockRejectedValue(apiError(412, 'The review is not associated to the adopter'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Esta reseña pertenece a otro adoptante.',
    );
    expect(screen.queryByRole('heading', { name: 'Detalle de la reseña' })).toBeNull();
  });

  it('informa cuando la reseña no existe', async () => {
    getReview.mockRejectedValue(apiError(404, 'The review with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Reseña no encontrada.');
  });
});
