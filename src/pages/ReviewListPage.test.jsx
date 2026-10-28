// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createReview, deleteReview, getReviews, updateReview } from '../services/reviewService';
import ReviewListPage from './ReviewListPage';

vi.mock('../services/reviewService', () => ({
  getReviews: vi.fn(),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

const reviews = [
  { id: 1, rating: 5, comment: 'Todo salió muy bien', adopter: { id: 7, name: 'Laura Gómez' } },
  { id: 2, rating: 4, comment: 'Buen acompañamiento', adopter: { id: 7, name: 'Laura Gómez' } },
  { id: 3, rating: 4, comment: null, adopter: { id: 7, name: 'Laura Gómez' } },
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adoptantes/7/resenas']}>
      <Routes>
        <Route path="/adoptantes/:adopterId/resenas" element={<ReviewListPage />} />
      </Routes>
    </MemoryRouter>,
  );

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

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

  describe('editar', () => {
    const startEditing = async (id = 2) => {
      getReviews.mockResolvedValue(reviews);
      renderPage();
      await screen.findByText('Todo salió muy bien');
      fireEvent.click(screen.getByRole('button', { name: `Editar la reseña ${id}` }));
    };
    const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    it('carga la reseña en el panel y guarda los cambios válidos', async () => {
      updateReview.mockResolvedValue({});
      await startEditing();
      expect(screen.getByRole('heading', { name: 'Editar reseña' })).toBeTruthy();
      expect(screen.getByRole('radio', { name: '4 estrellas' }).checked).toBe(true);
      expect(screen.getByLabelText(/^Comentario/).value).toBe('Buen acompañamiento');

      fireEvent.click(screen.getByRole('radio', { name: '2 estrellas' }));
      fireEvent.change(screen.getByLabelText(/^Comentario/), { target: { value: 'Demoró mucho' } });
      save();

      expect(await screen.findByText('Reseña actualizada correctamente.')).toBeTruthy();
      expect(updateReview).toHaveBeenCalledWith('7', 2, { rating: 2, comment: 'Demoró mucho' });
      expect(screen.getByText('Demoró mucho')).toBeTruthy();
      expect(screen.queryByText('Buen acompañamiento')).toBeNull();
      expect(screen.getByText('3,7')).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Nueva reseña' })).toBeTruthy();
    });

    it('permite cancelar la edición sin guardar', async () => {
      await startEditing();
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.getByRole('heading', { name: 'Nueva reseña' })).toBeTruthy();
      expect(updateReview).not.toHaveBeenCalled();
    });

    it('rechaza una calificación inválida que devuelve el servidor', async () => {
      updateReview.mockRejectedValue(apiError(412, 'Review rating must be between 1 and 5'));
      await startEditing();
      save();
      expect((await screen.findByRole('alert')).textContent).toContain('entre 1 y 5');
      expect(screen.getByText('Buen acompañamiento', { selector: 'p' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Editar reseña' })).toBeTruthy();
    });

    it('rechaza editar la reseña de otro adoptante', async () => {
      updateReview.mockRejectedValue(apiError(412, 'The review is not associated to the adopter'));
      await startEditing();
      save();
      expect((await screen.findByRole('alert')).textContent).toContain(
        'Esta reseña pertenece a otro adoptante.',
      );
    });
  });

  describe('eliminar', () => {
    const clickDelete = (id) =>
      fireEvent.click(screen.getByRole('button', { name: `Eliminar la reseña ${id}` }));
    const loadReviews = async () => {
      getReviews.mockResolvedValue(reviews);
      renderPage();
      await screen.findByText('Todo salió muy bien');
    };

    it('elimina la reseña tras confirmar y desaparece de la lista', async () => {
      deleteReview.mockResolvedValue();
      await loadReviews();
      clickDelete(1);
      expect(await screen.findByText('Reseña eliminada correctamente.')).toBeTruthy();
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(deleteReview).toHaveBeenCalledWith('7', 1);
      expect(screen.queryByText('Todo salió muy bien')).toBeNull();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      expect(screen.getByText('4,0')).toBeTruthy();
    });

    it('no elimina nada si se cancela la confirmación', async () => {
      confirmSpy.mockReturnValue(false);
      await loadReviews();
      clickDelete(1);
      expect(deleteReview).not.toHaveBeenCalled();
      expect(screen.getByText('Todo salió muy bien')).toBeTruthy();
    });

    it('bloquea el botón mientras se elimina', async () => {
      let finish;
      deleteReview.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
      await loadReviews();
      clickDelete(1);
      expect((await screen.findByRole('button', { name: 'Eliminar la reseña 1' })).textContent).toBe(
        'Eliminando...',
      );
      finish();
      expect(await screen.findByText('Reseña eliminada correctamente.')).toBeTruthy();
    });

    it('rechaza eliminar la reseña de otro adoptante y la conserva', async () => {
      deleteReview.mockRejectedValue(apiError(412, 'The review is not associated to the adopter'));
      await loadReviews();
      clickDelete(1);
      expect((await screen.findByRole('alert')).textContent).toContain(
        'Esta reseña pertenece a otro adoptante.',
      );
      expect(screen.getByText('Todo salió muy bien')).toBeTruthy();
    });

    it('quita de la lista una reseña que ya no existe y avisa', async () => {
      deleteReview.mockRejectedValue(apiError(404, 'The review with the given id was not found'));
      await loadReviews();
      clickDelete(1);
      expect((await screen.findByRole('alert')).textContent).toContain('Reseña no encontrada.');
      expect(screen.queryByText('Todo salió muy bien')).toBeNull();
    });

    it('cierra la edición si se elimina la reseña que se editaba', async () => {
      deleteReview.mockResolvedValue();
      await loadReviews();
      fireEvent.click(screen.getByRole('button', { name: 'Editar la reseña 1' }));
      expect(screen.getByRole('heading', { name: 'Editar reseña' })).toBeTruthy();
      clickDelete(1);
      expect(await screen.findByRole('heading', { name: 'Nueva reseña' })).toBeTruthy();
    });
  });
});
