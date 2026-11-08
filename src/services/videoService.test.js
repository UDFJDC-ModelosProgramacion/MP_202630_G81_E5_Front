import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import { createVideo, deleteVideo, getVideo, getVideos, updateVideo } from './videoService';

vi.mock('./apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('videoService', () => {
  it('getVideos consulta los videos del refugio', async () => {
    const videos = [{ id: 1, url: 'https://v.co/a.mp4' }];
    apiClient.get.mockResolvedValue({ data: videos });
    expect(await getVideos(7)).toEqual(videos);
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/7/videos');
  });

  it('getVideo consulta un video del refugio', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2 } });
    expect(await getVideo(7, 2)).toEqual({ id: 2 });
    expect(apiClient.get).toHaveBeenCalledWith('/shelters/7/videos/2');
  });

  it('createVideo envía el video al refugio', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 3 } });
    expect(await createVideo(7, { url: 'https://v.co/b.mp4' })).toEqual({ id: 3 });
    expect(apiClient.post).toHaveBeenCalledWith('/shelters/7/videos', { url: 'https://v.co/b.mp4' });
  });

  it('updateVideo reemplaza la URL del video', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 2 } });
    expect(await updateVideo(7, 2, { url: 'https://v.co/c.mp4' })).toEqual({ id: 2 });
    expect(apiClient.put).toHaveBeenCalledWith('/shelters/7/videos/2', { url: 'https://v.co/c.mp4' });
  });

  it('deleteVideo elimina el video del refugio', async () => {
    apiClient.delete.mockResolvedValue({});
    expect(await deleteVideo(7, 2)).toBeUndefined();
    expect(apiClient.delete).toHaveBeenCalledWith('/shelters/7/videos/2');
  });
});