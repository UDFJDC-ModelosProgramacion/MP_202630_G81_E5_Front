import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import { getReviewAdopter } from './reviewAdopterService';

vi.mock('./apiClient', () => ({ default: { get: vi.fn() } }));

describe('reviewAdopterService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta el adoptante dueño de las reseñas', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7, name: 'Laura Gómez' } });
    expect(await getReviewAdopter(7)).toEqual({ id: 7, name: 'Laura Gómez' });
    expect(apiClient.get).toHaveBeenCalledWith('/adopters/7');
  });
});
