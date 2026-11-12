// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPhotoOwner } from '../services/photoOwnerService';
import { getPhoto } from '../services/photoService';
import PhotoDetailPage from './PhotoDetailPage';

vi.mock('../services/photoOwnerService', () => ({ getPhotoOwner: vi.fn() }));
vi.mock('../services/photoService', () => ({ getPhoto: vi.fn() }));

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const shelter = { id: 2, name: 'Refugio Adopciones' };
const photo = { id: 10, url: 'https://x.co/a.jpg' };

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/mascotas/:id/fotos/:photoId" element={<PhotoDetailPage owner="pets" />} />
        <Route path="/refugios/:id/fotos/:photoId" element={<PhotoDetailPage owner="shelters" />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('PhotoDetailPage', () => {
  it('muestra el detalle de la foto de una mascota', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhoto.mockResolvedValue(photo);
    renderPage('/mascotas/1/fotos/10');
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Foto' })).toBeTruthy();
    expect(screen.getByText('Luna · Perro')).toBeTruthy();
    expect(screen.getByText('https://x.co/a.jpg')).toBeTruthy();
    expect(screen.getByAltText('Foto de Luna')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver a las fotos' }).getAttribute('href')).toBe(
      '/mascotas/1/fotos',
    );
    expect(getPhoto).toHaveBeenCalledWith('pets', '1', '10');
  });

  it('muestra el detalle de la foto de un refugio', async () => {
    getPhotoOwner.mockResolvedValue(shelter);
    getPhoto.mockResolvedValue(photo);
    renderPage('/refugios/2/fotos/10');
    expect(await screen.findByText('Refugio Adopciones · Refugio')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver a las fotos' }).getAttribute('href')).toBe(
      '/refugios/2/fotos',
    );
  });

  it('informa cuando la foto no existe', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhoto.mockRejectedValue(apiError(404, 'The photo with the given id was not found'));
    renderPage('/mascotas/1/fotos/99');
    expect(await screen.findByText('Foto no encontrada.')).toBeTruthy();
  });

  it('rechaza una foto que pertenece a otro destino', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhoto.mockRejectedValue(apiError(412, 'The photo is not associated to the pet'));
    renderPage('/mascotas/1/fotos/10');
    expect(await screen.findByText('La foto no pertenece a esta mascota.')).toBeTruthy();
  });

  it('muestra el error de conexión', async () => {
    getPhotoOwner.mockResolvedValue(pet);
    getPhoto.mockRejectedValue({ request: {} });
    renderPage('/mascotas/1/fotos/10');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});