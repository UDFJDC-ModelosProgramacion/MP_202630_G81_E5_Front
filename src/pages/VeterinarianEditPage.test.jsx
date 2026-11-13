// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getVeterinarian, updateVeterinarian } from '../services/veterinarianService';
import VeterinarianEditPage from './VeterinarianEditPage';

vi.mock('../services/veterinarianService', () => ({
  getVeterinarian: vi.fn(),
  updateVeterinarian: vi.fn(),
}));

const veterinarian = {
  id: 1,
  name: 'Laura Martínez',
  email: 'laura@refugio.org',
  phone: '3105551234',
  specialty: 'Medicina interna',
  availability: 'Lun–Vie',
  shelter: { id: 1, name: 'Refugio Adopciones' },
  registeredEvents: [],
};

function ListStub() {
  const { state } = useLocation();
  return <p>{`LISTADO ${state?.message ?? ''}`}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/veterinarios/1/editar']}>
      <Routes>
        <Route path="/veterinarios/:id/editar" element={<VeterinarianEditPage />} />
        <Route path="/veterinarios" element={<ListStub />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('VeterinarianEditPage', () => {
  it('muestra el estado de carga', () => {
    getVeterinarian.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Cargando veterinario/);
  });

  it('precarga los datos y bloquea el refugio', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    renderPage();
    await screen.findByDisplayValue('Laura Martínez');
    expect(getVeterinarian).toHaveBeenCalledWith('1');
    expect(screen.getByLabelText('Correo').value).toBe('laura@refugio.org');
    expect(screen.getByLabelText('Especialidad').value).toBe('Medicina interna');
    expect(screen.getByLabelText(/^Refugio/).value).toBe('1');
    expect(screen.getByLabelText(/^Refugio/).disabled).toBe(true);
  });

  it('guarda los cambios conservando refugio e id, y vuelve al listado', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    updateVeterinarian.mockResolvedValue({ id: 1 });
    renderPage();
    await screen.findByDisplayValue('Laura Martínez');
    type('Especialidad', 'Cirugía');
    submit();
    expect(await screen.findByText('LISTADO Cambios guardados correctamente.')).toBeTruthy();
    expect(updateVeterinarian).toHaveBeenCalledWith(1, {
      id: 1,
      name: 'Laura Martínez',
      email: 'laura@refugio.org',
      phone: '3105551234',
      specialty: 'Cirugía',
      availability: 'Lun–Vie',
      shelter: { id: 1 },
    });
  });

  it('rechaza datos inválidos sin llamar al servicio', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    renderPage();
    await screen.findByDisplayValue('Laura Martínez');
    type('Nombre', '');
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(updateVeterinarian).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del back cuando guardar falla', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    updateVeterinarian.mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Veterinarian data is not valid' } } },
    });
    renderPage();
    await screen.findByDisplayValue('Laura Martínez');
    submit();
    expect(await screen.findByText('Veterinarian data is not valid')).toBeTruthy();
  });

  it('informa cuando el veterinario no existe al cargar', async () => {
    getVeterinarian.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toBe('Veterinario no encontrado.');
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });

  it('informa cuando el veterinario no existe al guardar', async () => {
    getVeterinarian.mockResolvedValue(veterinarian);
    updateVeterinarian.mockRejectedValue({
      response: {
        status: 404,
        data: { apierror: { message: 'The veterinarian with the given id was not found' } },
      },
    });
    renderPage();
    await screen.findByDisplayValue('Laura Martínez');
    submit();
    expect(
      await screen.findByText('The veterinarian with the given id was not found'),
    ).toBeTruthy();
  });

  it('muestra el error de conexión al cargar', async () => {
    getVeterinarian.mockRejectedValue({ request: {} });
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});