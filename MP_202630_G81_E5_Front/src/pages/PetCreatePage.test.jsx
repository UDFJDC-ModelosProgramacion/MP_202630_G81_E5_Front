// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createPet } from '../services/petService';
import { getShelters } from '../services/shelterService';
import PetCreatePage from './PetCreatePage';

vi.mock('../services/petService', () => ({ createPet: vi.fn() }));
vi.mock('../services/shelterService', () => ({ getShelters: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/mascotas/nueva']}>
      <Routes>
        <Route path="/mascotas/nueva" element={<PetCreatePage />} />
        <Route path="/mascotas" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

async function fillAndSubmit() {
  await screen.findByLabelText('Refugio');
  type('Nombre', 'Luna');
  type('Especie', 'Perro');
  type(/Edad/, '0');
  fireEvent.click(screen.getByRole('button', { name: 'Registrar mascota' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  getShelters.mockResolvedValue([{ id: 1, name: 'Refugio Adopciones' }]);
});
afterEach(cleanup);

describe('PetCreatePage', () => {
  it('preselecciona el único refugio y registra la mascota', async () => {
    createPet.mockResolvedValue({ id: 10 });
    renderPage();
    await fillAndSubmit();
    expect(await screen.findByText('Listado')).toBeTruthy();
    expect(createPet).toHaveBeenCalledWith({
      name: 'Luna', species: 'Perro', breed: null, age: 0, available: true, shelter: { id: 1 },
    });
  });

  it('muestra el mensaje del back cuando rechaza la mascota', async () => {
    createPet.mockRejectedValue({
      response: { status: 404, data: { apierror: { message: 'Shelter not found' } } },
    });
    renderPage();
    await fillAndSubmit();
    expect(await screen.findByText('Shelter not found')).toBeTruthy();
  });

  it('avisa cuando no hay refugios registrados', async () => {
    getShelters.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/No hay refugios registrados/)).toBeTruthy();
  });

  it('muestra el error si no se pueden cargar los refugios', async () => {
    getShelters.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});