// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdopters, getVeterinarians } from '../services/adoptionLookupService';
import { createAdoption } from '../services/adoptionService';
import { getPets } from '../services/petService';
import AdoptionCreatePage from './AdoptionCreatePage';

vi.mock('../services/petService', () => ({ getPets: vi.fn() }));
vi.mock('../services/adoptionLookupService', () => ({
  getAdopters: vi.fn(),
  getVeterinarians: vi.fn(),
}));
vi.mock('../services/adoptionService', () => ({ createAdoption: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adopciones/nueva']}>
      <Routes>
        <Route path="/adopciones/nueva" element={<AdoptionCreatePage />} />
        <Route path="/adopciones" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

const choose = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

async function fillAndSubmit() {
  await screen.findByLabelText('Mascota');
  choose('Mascota', '1');
  choose('Adoptante', '1');
  choose('Veterinario responsable', '1');
  choose('Fecha de adopción', '2026-09-20');
  fireEvent.click(screen.getByRole('button', { name: 'Registrar adopción' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  getPets.mockResolvedValue([
    { id: 1, name: 'Nube', species: 'Gato', breed: 'Criollo', available: true },
  ]);
  getAdopters.mockResolvedValue([{ id: 1, name: 'Laura Gómez' }]);
  getVeterinarians.mockResolvedValue([{ id: 1, name: 'Dr. Andrés Ríos' }]);
});
afterEach(cleanup);

describe('AdoptionCreatePage', () => {
  it('muestra el título, la ruta de navegación y el aviso de campos obligatorios', async () => {
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Registrar adopción' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Adopciones' }).getAttribute('href')).toBe('/adopciones');
    expect(screen.getByText('Todos los campos son obligatorios, excepto el estado.')).toBeTruthy();
  });

  it('registra la adopción y vuelve al listado', async () => {
    createAdoption.mockResolvedValue({ id: 10 });
    renderPage();
    await fillAndSubmit();
    expect(await screen.findByText('Listado')).toBeTruthy();
    expect(createAdoption).toHaveBeenCalledWith({
      date: '2026-09-20T12:00:00.000Z',
      status: 'IN_PROGRESS',
      pet: { id: 1 },
      adopter: { id: 1 },
      responsibleVeterinarian: { id: 1 },
    });
  });

  it('muestra el error cuando el back rechaza una mascota no disponible', async () => {
    createAdoption.mockRejectedValue({
      response: {
        status: 412,
        data: { apierror: { message: 'The pet is not available for adoption' } },
      },
    });
    renderPage();
    await fillAndSubmit();
    expect(
      await screen.findByText('Esta mascota ya no está disponible para adopción. Elige otra.'),
    ).toBeTruthy();
    expect(screen.queryByText('Listado')).toBeNull();
  });

  it('muestra un mensaje cuando el veterinario no se encuentra', async () => {
    createAdoption.mockRejectedValue({
      response: {
        status: 404,
        data: { apierror: { message: 'The veterinarian with the given id was not found' } },
      },
    });
    renderPage();
    await fillAndSubmit();
    expect(await screen.findByText('El veterinario seleccionado no fue encontrado.')).toBeTruthy();
  });

  it('avisa cuando faltan adoptantes', async () => {
    getAdopters.mockResolvedValue([]);
    renderPage();
    expect(
      await screen.findByText('Faltan datos para registrar una adopción: no hay adoptantes.'),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Mascota')).toBeNull();
  });

  it('muestra el error si no se pueden cargar los datos', async () => {
    getVeterinarians.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.queryByLabelText('Mascota')).toBeNull();
  });
});
