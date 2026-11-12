// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPhotoOwner } from '../services/photoOwnerService';
import { deletePhoto, getPhotos } from '../services/photoService';
import PhotoListPage from './PhotoListPage';

vi.mock('../services/photoOwnerService', () => ({ getPhotoOwner: vi.fn() }));
vi.mock('../services/photoService', () => ({ getPhotos: vi.fn(), deletePhoto: vi.fn() }));

const pet = {
  id: 1,
  name: 'Luna',
  species: 'Perro',
  shelter: { id: 2, name: 'Refugio Adopciones' },
};
const photos = [
  { id: 10, url: 'https://x.co/a.jpg' },
  { id: 11, url: 'https://x.co/b.jpg' },
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const loadPage = async () => {
  render(
    <MemoryRouter initialEntries={['/mascotas/1/fotos']}>
      <Routes>
        <Route path="/mascotas/:id/fotos" element={<PhotoListPage owner="pets" />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Fotos de Luna' });
};
const clickDelete = (label) =>
  fireEvent.click(screen.getByRole('button', { name: `Eliminar ${label}` }));
const photoLinks = () => screen.getAllByRole('link', { name: /^Ver Foto/ });

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  getPhotoOwner.mockResolvedValue(pet);
  getPhotos.mockResolvedValue(photos);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('PhotoListPage: eliminar foto', () => {
  it('elimina una foto propia y la quita de la lista', async () => {
    deletePhoto.mockResolvedValue();
    await loadPage();
    clickDelete('Foto 1');
    expect(await screen.findByText('Foto eliminada correctamente.')).toBeTruthy();
    expect(confirmSpy).toHaveBeenCalledWith('¿Eliminar Foto 1? Esta acción no se puede deshacer.');
    expect(deletePhoto).toHaveBeenCalledWith('pets', 1, 10);
    expect(photoLinks()).toHaveLength(1);
  });

  it('muestra el estado vacío al eliminar la última foto', async () => {
    getPhotos.mockResolvedValue([photos[0]]);
    deletePhoto.mockResolvedValue();
    await loadPage();
    clickDelete('Foto 1');
    expect(await screen.findByText('Aún no hay fotos de Luna.')).toBeTruthy();
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    confirmSpy.mockReturnValue(false);
    await loadPage();
    clickDelete('Foto 1');
    expect(deletePhoto).not.toHaveBeenCalled();
    expect(photoLinks()).toHaveLength(2);
  });

  it('deshabilita el botón de la foto que se está eliminando', async () => {
    deletePhoto.mockReturnValue(new Promise(() => {}));
    await loadPage();
    clickDelete('Foto 1');
    expect(screen.getByRole('button', { name: 'Eliminar Foto 1' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar Foto 2' }).disabled).toBe(false);
  });

  it('informa cuando la foto ya no existe y la quita de la lista', async () => {
    deletePhoto.mockRejectedValue(apiError(404, 'The photo with the given id was not found'));
    await loadPage();
    clickDelete('Foto 1');
    expect(await screen.findByText('Foto no encontrada.')).toBeTruthy();
    expect(photoLinks()).toHaveLength(1);
  });

  it('rechaza eliminar una foto de otro destino y la deja en la lista', async () => {
    deletePhoto.mockRejectedValue(apiError(412, 'The photo is not associated to the pet'));
    await loadPage();
    clickDelete('Foto 1');
    expect(
      await screen.findByText('No se puede eliminar Foto 1: La foto no pertenece a esta mascota.'),
    ).toBeTruthy();
    expect(photoLinks()).toHaveLength(2);
  });

  it('muestra el error de conexión y deja la foto en la lista', async () => {
    deletePhoto.mockRejectedValue({ request: {} });
    await loadPage();
    clickDelete('Foto 1');
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(photoLinks()).toHaveLength(2);
  });

  it('al eliminar la foto en edición vuelve al formulario de agregar', async () => {
    deletePhoto.mockResolvedValue();
    await loadPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 1' }));
    expect(screen.getByRole('heading', { name: 'Editar foto' })).toBeTruthy();
    clickDelete('Foto 1');
    expect(await screen.findByText('Foto eliminada correctamente.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Agregar foto' })).toBeTruthy();
  });
});