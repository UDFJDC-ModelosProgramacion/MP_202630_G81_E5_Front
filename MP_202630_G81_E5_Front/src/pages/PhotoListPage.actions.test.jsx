// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPhotoOwner } from '../services/photoOwnerService';
import { createPhoto, getPhotos, updatePhoto } from '../services/photoService';
import PhotoListPage from './PhotoListPage';

vi.mock('../services/photoOwnerService', () => ({ getPhotoOwner: vi.fn() }));
vi.mock('../services/photoService', () => ({
  getPhotos: vi.fn(),
  createPhoto: vi.fn(),
  updatePhoto: vi.fn(),
}));

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
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/fotos']}>
      <Routes>
        <Route path="/mascotas/:id/fotos" element={<PhotoListPage owner="pets" />} />
        <Route path="/refugios/:id/fotos" element={<PhotoListPage owner="shelters" />} />
      </Routes>
    </MemoryRouter>,
  );

const loadPage = async () => {
  renderPage();
  await screen.findByRole('heading', { name: 'Fotos de Luna' });
};
const typeUrl = (value) =>
  fireEvent.change(screen.getByLabelText('URL de la foto'), { target: { value } });
const submit = (name = 'Agregar foto') => fireEvent.click(screen.getByRole('button', { name }));

beforeEach(() => {
  vi.clearAllMocks();
  getPhotoOwner.mockImplementation((owner) => Promise.resolve(owner === 'pets' ? pet : shelter));
  getPhotos.mockResolvedValue(photos);
});
afterEach(cleanup);

describe('PhotoListPage: crear foto', () => {
  it('crea una foto válida y la agrega a la lista', async () => {
    createPhoto.mockResolvedValue({ id: 12, url: 'https://x.co/new.jpg' });
    await loadPage();
    expect(screen.getAllByRole('link', { name: /^Ver Foto/ })).toHaveLength(2);
    typeUrl(' https://x.co/new.jpg ');
    submit();
    expect(await screen.findByText('Foto agregada correctamente.')).toBeTruthy();
    expect(createPhoto).toHaveBeenCalledWith({ url: 'https://x.co/new.jpg', pet: { id: 1 } });
    expect(screen.getAllByRole('link', { name: /^Ver Foto/ })).toHaveLength(3);
    expect(screen.getByLabelText('URL de la foto').value).toBe('');
  });

  it('rechaza una URL vacía sin llamar al servicio', async () => {
    await loadPage();
    submit();
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(createPhoto).not.toHaveBeenCalled();
  });

  it('muestra el rechazo del back por URL inválida', async () => {
    createPhoto.mockRejectedValue(apiError(412, 'Photo url is not valid'));
    await loadPage();
    typeUrl('https://x.co/new.jpg');
    submit();
    expect(await screen.findByText('La URL de la foto no es válida.')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /^Ver Foto/ })).toHaveLength(2);
  });

  it('informa cuando la mascota ya no existe', async () => {
    createPhoto.mockRejectedValue(apiError(404, 'The pet with the given id was not found'));
    await loadPage();
    typeUrl('https://x.co/new.jpg');
    submit();
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
  });

  it('muestra el error de conexión al crear', async () => {
    createPhoto.mockRejectedValue({ request: {} });
    await loadPage();
    typeUrl('https://x.co/new.jpg');
    submit();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });

  it('al asociar la foto al refugio abre la lista de fotos del refugio', async () => {
    createPhoto.mockResolvedValue({ id: 12, url: 'https://x.co/new.jpg' });
    await loadPage();
    fireEvent.change(screen.getByLabelText('Asociar a'), { target: { value: 'shelters:2' } });
    typeUrl('https://x.co/new.jpg');
    submit();
    expect(await screen.findByRole('heading', { name: 'Fotos de Refugio Adopciones' })).toBeTruthy();
    expect(screen.getByText('Foto agregada correctamente.')).toBeTruthy();
    expect(createPhoto).toHaveBeenCalledWith({ url: 'https://x.co/new.jpg', shelter: { id: 2 } });
  });
});

describe('PhotoListPage: editar foto', () => {
  it('edita la URL y conserva la asociación', async () => {
    updatePhoto.mockResolvedValue({ id: 10, url: 'https://x.co/edited.jpg' });
    await loadPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 1' }));
    expect(screen.getByRole('heading', { name: 'Editar foto' })).toBeTruthy();
    expect(screen.getByLabelText('URL de la foto').value).toBe('https://x.co/a.jpg');
    expect(screen.getByLabelText('Asociar a').disabled).toBe(true);
    typeUrl('https://x.co/edited.jpg');
    submit('Guardar cambios');
    expect(await screen.findByText('Cambios guardados correctamente.')).toBeTruthy();
    expect(updatePhoto).toHaveBeenCalledWith('pets', 1, 10, { url: 'https://x.co/edited.jpg' });
    expect(screen.getByAltText('Foto 1 de Luna').getAttribute('src')).toBe('https://x.co/edited.jpg');
    expect(screen.getByRole('heading', { name: 'Agregar foto' })).toBeTruthy();
  });

  it('rechaza editar con la URL vacía', async () => {
    await loadPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 1' }));
    typeUrl('');
    submit('Guardar cambios');
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(updatePhoto).not.toHaveBeenCalled();
  });

  it('informa cuando la foto ya no existe', async () => {
    updatePhoto.mockRejectedValue(apiError(404, 'The photo with the given id was not found'));
    await loadPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 1' }));
    typeUrl('https://x.co/edited.jpg');
    submit('Guardar cambios');
    expect(await screen.findByText('Foto no encontrada.')).toBeTruthy();
  });

  it('rechaza editar una foto de otro destino', async () => {
    updatePhoto.mockRejectedValue(apiError(412, 'The photo is not associated to the pet'));
    await loadPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 2' }));
    typeUrl('https://x.co/edited.jpg');
    submit('Guardar cambios');
    expect(await screen.findByText('La foto no pertenece a esta mascota.')).toBeTruthy();
  });

  it('cancelar vuelve al formulario de agregar', async () => {
    await loadPage();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Foto 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('heading', { name: 'Agregar foto' })).toBeTruthy();
    expect(screen.getByLabelText('URL de la foto').value).toBe('');
    expect(updatePhoto).not.toHaveBeenCalled();
  });
});