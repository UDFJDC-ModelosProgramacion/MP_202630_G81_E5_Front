// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VeterinarianTable from './VeterinarianTable';

afterEach(cleanup);

const veterinarians = [
  {
    id: 1,
    name: 'Laura Martínez',
    email: 'laura.martinez@refugio.org',
    specialty: 'Medicina interna',
    availability: 'Lun–Vie · 8:00–14:00',
    shelter: { id: 1, name: 'Refugio Adopciones' },
  },
  {
    id: 2,
    name: 'Carlos Gómez',
    email: 'carlos.gomez@refugio.org',
    specialty: 'Cirugía',
    availability: null,
    shelter: null,
  },
];

const renderTable = (props = {}) =>
  render(
    <MemoryRouter>
      <VeterinarianTable veterinarians={veterinarians} {...props} />
    </MemoryRouter>,
  );

describe('VeterinarianTable', () => {
  it('muestra los datos de cada veterinario y el conteo', () => {
    renderTable();
    expect(screen.getByText('Laura Martínez')).toBeTruthy();
    expect(screen.getByText('laura.martinez@refugio.org')).toBeTruthy();
    expect(screen.getByText('Medicina interna')).toBeTruthy();
    expect(screen.getByText('Refugio Adopciones')).toBeTruthy();
    expect(screen.getByText('Lun–Vie · 8:00–14:00')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 veterinarios')).toBeTruthy();
  });

  it('usa el singular cuando hay un solo veterinario', () => {
    renderTable({ veterinarians: [veterinarians[0]] });
    expect(screen.getByText('Mostrando 1 veterinario')).toBeTruthy();
  });

  it('muestra un guion cuando faltan refugio o disponibilidad', () => {
    renderTable();
    expect(screen.getAllByText('—').length).toBe(2);
  });

  it('enlaza el nombre al detalle y la acción Editar a la edición', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Laura Martínez' }).getAttribute('href')).toBe(
      '/veterinarios/1',
    );
    expect(screen.getByRole('link', { name: 'Editar Carlos Gómez' }).getAttribute('href')).toBe(
      '/veterinarios/2/editar',
    );
  });

  it('no muestra Eliminar si no se pasa onDelete', () => {
    renderTable();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });

  it('llama a onDelete con el veterinario y deshabilita el que se está eliminando', () => {
    const onDelete = vi.fn();
    renderTable({ onDelete, deletingId: 2 });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Laura Martínez' }));
    expect(onDelete).toHaveBeenCalledWith(veterinarians[0]);
    expect(screen.getByRole('button', { name: 'Eliminar Carlos Gómez' }).disabled).toBe(true);
  });
});