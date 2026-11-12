// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getPet, updatePet } from '../services/petService';
import PetEditPage from './PetEditPage';

vi.mock('../services/petService', () => ({ getPet: vi.fn(), updatePet: vi.fn() }));

const pet = {
  id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador', age: 2,
  sex: 'Hembra', available: true, shelter: { id: 1, name: 'Refugio Adopciones' },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/1/editar']}>
      <Routes>
        <Route path="/mascotas/:id/editar" element={<PetEditPage />} />
        <Route path="/mascotas" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
  getPet.mockResolvedValue(pet);
});
afterEach(cleanup);

describe('PetEditPage', () => {
  it('carga los datos de la mascota y bloquea el refugio', async () => {
    renderPage();
    expect((await screen.findByLabelText('Nombre')).value).toBe('Luna');
    expect(screen.getByLabelText('Refugio').disabled).toBe(true);
    expect(screen.getByLabelText('Refugio').value).toBe('1');
  });

  it('guarda los cambios conservando el refugio y los demás campos', async () => {
    updatePet.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', 'Nube');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Listado')).toBeTruthy();
    expect(updatePet).toHaveBeenCalledWith(1, {
      id: 1, sex: 'Hembra', name: 'Nube', species: 'Perro', breed: 'Labrador',
      age: 2, available: true, shelter: { id: 1 },
    });
  });

  it('rechaza el cambio si el nombre queda vacío', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    type('Nombre', '');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(updatePet).not.toHaveBeenCalled();
  });

  it('rechaza el cambio si la edad es negativa', async () => {
    renderPage();
    await screen.findByLabelText('Nombre');
    type(/Edad/, '-3');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('La edad no puede ser negativa. Usa 0 o más.')).toBeTruthy();
    expect(updatePet).not.toHaveBeenCalled();
  });

  it('informa cuando la mascota no existe', async () => {
    getPet.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Mascota no encontrada.')).toBeTruthy();
  });
});