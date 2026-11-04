// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPhotoOwner } from '../services/photoOwnerService';
import { getPhotos } from '../services/photoService';
import PhotoListPage from './PhotoListPage';

vi.mock('../services/photoOwnerService', () => ({ getPhotoOwner: vi.fn() }));
vi.mock('../services/photoService', () => ({ getPhotos: vi.fn() }));

const pet = {
  id: 1,
  name: 'Luna',
  species: 'Perro',
  shelter: { id: 2, name: 'Refugio Adopciones' },
};
const shelter = { id: 2, name: 'Refugio Adopciones', city: 'Bogotá' };
const photos = [
  { id: 10, url: 'https://x.co/a.jpg' },
  { id: 11, url: 'https://x.co/b.jpg' },
  { id: 12, url: 'https://x.co/c.jpg' },
];

const renderPage = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/mascotas/:id/fotos" element={<PhotoListPage owner="pets" />} />
        <Route path="/refugios/:id/fotos" element={<PhotoListPage owner="shelters" />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('PhotoListPage', () => {
  it('muestra las fotos de la mascota', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhotos.mockResolvedValue(photos);
    renderPage('/mascotas/1/fotos');
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Fotos de Luna' })).toBeTruthy();
    expect(screen.getByText('Muestra cómo luce Luna a los adoptantes.')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /^Ver Foto/ })).toHaveLength(3);
    expect(getPhotoOwner).toHaveBeenCalledWith('pets', '1');
    expect(getPhotos).toHaveBeenCalledWith('pets', '1');
  });

  it('muestra las pestañas de mascota y de su refugio', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhotos.mockResolvedValue(photos);
    renderPage('/mascotas/1/fotos');
    await screen.findByRole('heading', { name: 'Fotos de Luna' });
    expect(
      screen.getByRole('link', { name: 'Fotos de la mascota' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(screen.getByRole('link', { name: 'Fotos del refugio' }).getAttribute('href')).toBe(
      '/refugios/2/fotos',
    );
  });

  it('muestra un mensaje cuando no hay fotos', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhotos.mockResolvedValue([]);
    renderPage('/mascotas/1/fotos');
    expect(await screen.findByText('Aún no hay fotos de Luna.')).toBeTruthy();
  });

  it('informa cuando la mascota no existe', async () => {
    getPhotoOwner.mockRejectedValue({
      response: { status: 404, data: { apierror: { message: 'The pet with the given id was not found' } } },
    });
    getPhotos.mockResolvedValue([]);
    renderPage('/mascotas/99/fotos');
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull();
  });

  it('muestra el error de conexión y permite reintentar', async () => {
    getPhotoOwner.mockRejectedValueOnce({ request: {} }).mockResolvedValue(pet);
    getPhotos.mockResolvedValue(photos);
    renderPage('/mascotas/1/fotos');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Fotos de Luna' })).toBeTruthy();
    expect(getPhotoOwner).toHaveBeenCalledTimes(2);
  });

  it('muestra las fotos de un refugio con una sola pestaña', async () => {
    getPhotoOwner.mockResolvedValue(shelter);
    getPhotos.mockResolvedValue(photos);
    renderPage('/refugios/2/fotos');
    expect(await screen.findByRole('heading', { name: 'Fotos de Refugio Adopciones' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Fotos de la mascota' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Fotos del refugio' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Refugios' }).getAttribute('href')).toBe('/refugios');
    expect(getPhotos).toHaveBeenCalledWith('shelters', '2');
  });
});