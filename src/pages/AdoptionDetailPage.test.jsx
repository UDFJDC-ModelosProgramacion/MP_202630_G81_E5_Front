// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { deleteAdoption, getAdoption, updateAdoption } from '../services/adoptionService';
import AdoptionDetailPage from './AdoptionDetailPage';

vi.mock('../services/adoptionService', () => ({
  getAdoption: vi.fn(),
  updateAdoption: vi.fn(),
  deleteAdoption: vi.fn(),
}));

const adoption = {
  id: 1,
  date: '2026-09-20T00:00:00.000+00:00',
  status: 'IN_PROGRESS',
  pet: { id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador' },
  adopter: {
    id: 1,
    name: 'Laura Gómez',
    email: 'laura@example.com',
    phone: '3001234567',
    address: 'Calle 45 # 12-30',
  },
  responsibleVeterinarian: {
    id: 1,
    name: 'Dr. Andrés Ríos',
    specialty: 'Medicina general',
    email: 'andres@example.com',
  },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adopciones/1']}>
      <Routes>
        <Route path="/adopciones/:id" element={<AdoptionDetailPage />} />
        <Route path="/adopciones" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

const badgeText = () => document.querySelector('.adoption-status').textContent;
const clickDelete = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar la adopción de Luna' }));

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('AdoptionDetailPage: consulta', () => {
  it('muestra la mascota, el adoptante y el veterinario de la adopción', async () => {
    getAdoption.mockResolvedValue(adoption);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Adopción de Luna' })).toBeTruthy();
    expect(screen.getByText('Perro · Labrador')).toBeTruthy();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('laura@example.com')).toBeTruthy();
    expect(screen.getByText('Dr. Andrés Ríos')).toBeTruthy();
    expect(screen.getByText('Medicina general')).toBeTruthy();
    expect(screen.getByText('20 sep 2026')).toBeTruthy();
    expect(badgeText()).toBe('En curso');
    expect(getAdoption).toHaveBeenCalledWith('1');
  });

  it('muestra un guion en los datos que no existen', async () => {
    getAdoption.mockResolvedValue({ ...adoption, adopter: { id: 1, name: 'Laura Gómez' } });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
  });

  it('permite volver al listado', async () => {
    getAdoption.mockResolvedValue(adoption);
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    expect(
      screen.getByRole('link', { name: 'Volver al listado' }).getAttribute('href'),
    ).toBe('/adopciones');
  });

  it('informa cuando la adopción no existe y no ofrece acciones', async () => {
    getAdoption.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect(await screen.findByText('Adopción no encontrada.')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /Adopción de/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });

  it('muestra el mensaje del servidor ante otros errores', async () => {
    getAdoption.mockRejectedValue({
      response: { status: 500, data: { apierror: { message: 'Falla interna' } } },
    });
    renderPage();
    expect(await screen.findByText('Falla interna')).toBeTruthy();
  });
});

describe('AdoptionDetailPage: actualizar estado', () => {
  it('guarda el nuevo estado reenviando la fecha y sin tocar la mascota', async () => {
    getAdoption.mockResolvedValue(adoption);
    updateAdoption.mockResolvedValue({ id: 1, status: 'APPROVED' });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    fireEvent.change(screen.getByLabelText('Cambiar estado'), { target: { value: 'APPROVED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar estado' }));
    expect(await screen.findByText('Estado actualizado a «Aprobada».')).toBeTruthy();
    expect(updateAdoption).toHaveBeenCalledWith(1, {
      date: '2026-09-20T12:00:00.000Z',
      status: 'APPROVED',
    });
    expect(badgeText()).toBe('Aprobada');
  });

  it('muestra el error del back cuando rechaza el estado y conserva el anterior', async () => {
    getAdoption.mockResolvedValue(adoption);
    updateAdoption.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Adoption status is not valid' } } },
    });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    fireEvent.change(screen.getByLabelText('Cambiar estado'), { target: { value: 'RETURNED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar estado' }));
    expect(await screen.findByText('Adoption status is not valid')).toBeTruthy();
    expect(badgeText()).toBe('En curso');
  });
});

describe('AdoptionDetailPage: eliminar', () => {
  it('elimina la adopción y vuelve al listado', async () => {
    getAdoption.mockResolvedValue(adoption);
    deleteAdoption.mockResolvedValue();
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    clickDelete();
    expect(await screen.findByText('Listado')).toBeTruthy();
    expect(deleteAdoption).toHaveBeenCalledWith(1);
    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Eliminar la adopción de Luna? Esta acción no se puede deshacer.',
    );
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    getAdoption.mockResolvedValue(adoption);
    confirmSpy.mockReturnValue(false);
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    clickDelete();
    expect(deleteAdoption).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Adopción de Luna' })).toBeTruthy();
  });

  it('muestra el error del back si no se puede eliminar (412) y conserva la adopción', async () => {
    getAdoption.mockResolvedValue(adoption);
    deleteAdoption.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Regla de negocio' } } },
    });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    clickDelete();
    expect(
      await screen.findByText('No se puede eliminar la adopción de Luna: Regla de negocio'),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Adopción de Luna' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eliminar la adopción de Luna' }).disabled).toBe(false);
  });

  it('informa que no fue encontrada (404) y oculta la adopción', async () => {
    getAdoption.mockResolvedValue(adoption);
    deleteAdoption.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    clickDelete();
    expect(await screen.findByText('Adopción no encontrada.')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Adopción de Luna' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });

  it('muestra el error de conexión si falla el borrado', async () => {
    getAdoption.mockResolvedValue(adoption);
    deleteAdoption.mockRejectedValue({ request: {} });
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    clickDelete();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    expect(screen.getByRole('heading', { name: 'Adopción de Luna' })).toBeTruthy();
  });

  it('deshabilita el botón y muestra "Eliminando..." mientras borra', async () => {
    getAdoption.mockResolvedValue(adoption);
    deleteAdoption.mockReturnValue(new Promise(() => {}));
    renderPage();
    await screen.findByRole('heading', { name: 'Adopción de Luna' });
    clickDelete();
    const button = await screen.findByRole('button', { name: 'Eliminar la adopción de Luna' });
    expect(button.textContent).toBe('Eliminando...');
    expect(button.disabled).toBe(true);
  });
});
