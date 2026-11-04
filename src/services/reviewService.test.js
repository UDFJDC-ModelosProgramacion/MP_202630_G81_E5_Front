import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from './reviewService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('reviewService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista las reseñas de un adoptante', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await getReviews(7)).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/adopters/7/reviews');
  });

  it('consulta una reseña de un adoptante', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 3 } });
    expect(await getReview(7, 3)).toEqual({ id: 3 });
    expect(apiClient.get).toHaveBeenCalledWith('/adopters/7/reviews/3');
  });

  it('crea una reseña para un adoptante', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 4, rating: 5 } });
    expect(await createReview(7, { rating: 5, comment: null })).toEqual({ id: 4, rating: 5 });
    expect(apiClient.post).toHaveBeenCalledWith('/adopters/7/reviews', { rating: 5, comment: null });
  });

  it('actualiza una reseña', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 4, rating: 3 } });
    expect(await updateReview(7, 4, { rating: 3, comment: 'Bien' })).toEqual({ id: 4, rating: 3 });
    expect(apiClient.put).toHaveBeenCalledWith('/adopters/7/reviews/4', {
      rating: 3,
      comment: 'Bien',
    });
  });

  it('elimina una reseña', async () => {
    apiClient.delete.mockResolvedValue({});
    await deleteReview(7, 4);
    expect(apiClient.delete).toHaveBeenCalledWith('/adopters/7/reviews/4');
  });
});
