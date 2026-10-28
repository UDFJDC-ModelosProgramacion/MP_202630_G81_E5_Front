// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createReview, getReviews } from '../services/reviewService';
import ReviewListPage from './ReviewListPage';

vi.mock('../services/reviewService', () => ({ getReviews: vi.fn(), createReview: vi.fn() }));

const reviews = [
  { id: 1, rating: 5, comment: 'Todo salió muy bien', adopter: { id: 7, name: 'Laura Gómez' } },
  { id: 2, rating: 4, comment: 'Buen acompañamiento', adopter: { id: 7, name: 'Laura Gómez' } },
  { id: 3, rating: 4, comment: null, adopter: { id: 7, name: 'Laura Gómez' } },
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = (state) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/adoptantes/7/resenas', state }]}>
      <Routes>
        <Route path="/adoptantes/:adopterId/resenas" element={<ReviewListPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ReviewListPage', () => {
  it('lista todas las reseñas del adoptante con su promedio', async () => {
    getReviews.mockResolvedValue(reviews);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Todo salió muy bien')).toBeTruthy();
    expect(getReviews).toHaveBeenCalledWith('7');
    expect(screen.getByRole('heading', { name: 'Mis reseñas' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('4,3')).toBeTruthy();
    expect(screen.getByText('Basado en 3 reseñas publicadas')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver detalle de la reseña 2' })).toBeTruthy();
  });

  it('muestra un mensaje cuando el adoptante aún no tiene reseñas', async () => {
    getReviews.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no has publicado ninguna reseña.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('informa que el adoptante no fue encontrado', async () => {
    getReviews.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Adoptante no encontrado.');
    expect(screen.queryByText('Aún no has publicado ninguna reseña.')).toBeNull();
  });

  it('permite reintentar cuando falla la conexión', async () => {
    getReviews.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce(reviews);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Todo salió muy bien')).toBeTruthy();
    expect(getReviews).toHaveBeenCalledTimes(2);
  });

  it('muestra el mensaje de éxito recibido al volver de otra pantalla', async () => {
    getReviews.mockResolvedValue(reviews);
    renderPage({ message: 'Reseña publicada correctamente.' });
    expect((await screen.findByText('Reseña publicada correctamente.')).closest('[role="status"]')).toBeTruthy();
  });

  it('publica una reseña válida y la agrega a la lista con el promedio actualizado', async () => {
    getReviews.mockResolvedValue([reviews[0]]);
    createReview.mockResolvedValue({ id: 9, rating: 3, comment: 'Regular', adopter: reviews[0].adopter });
    renderPage();
    await screen.findByText('Todo salió muy bien');
    expect(screen.getByText('5,0')).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: '3 estrellas' }));
    fireEvent.change(screen.getByLabelText(/^Comentario/), { target: { value: ' Regular ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));

    expect(await screen.findByText('Regular', { selector: 'p' })).toBeTruthy();
    expect(createReview).toHaveBeenCalledWith('7', { rating: 3, comment: 'Regular' });
    expect(screen.getByText('Reseña publicada correctamente.')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('4,0')).toBeTruthy();
    expect(screen.getByRole('radio', { name: '3 estrellas' }).checked).toBe(false);
    expect(screen.getByLabelText(/^Comentario/).value).toBe('');
  });

  it('no envía la reseña cuando falta la calificación', async () => {
    getReviews.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aún no has publicado ninguna reseña.');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));
    expect(screen.getByText('Elige una calificación de 1 a 5.')).toBeTruthy();
    expect(createReview).not.toHaveBeenCalled();
  });

  it('muestra el rechazo del servidor sin agregar la reseña', async () => {
    getReviews.mockResolvedValue([]);
    createReview.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    await screen.findByText('Aún no has publicado ninguna reseña.');
    fireEvent.click(screen.getByRole('radio', { name: '4 estrellas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Adoptante no encontrado.');
    expect(screen.getByText('Aún no has publicado ninguna reseña.')).toBeTruthy();
  });

  it('no muestra el formulario cuando el adoptante no existe', async () => {
    getReviews.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    await screen.findByRole('alert');
    expect(screen.queryByRole('heading', { name: 'Nueva reseña' })).toBeNull();
  });
});
