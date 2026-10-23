// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetTable from './PetTable';

const pets = [
  { id: 1, name: 'Luna', species: 'Perro', breed: 'Labrador', age: 2, available: true, shelter: { name: 'Refugio Adopciones' } },
  { id: 2, name: 'Rocky', species: 'Perro', breed: 'Pitbull', age: 5, available: false, shelter: { name: 'Refugio Adopciones' } },
];

const renderTable = (props = {}) =>
  render(
    <MemoryRouter>
      <PetTable pets={pets} {...props} />
    </MemoryRouter>,
  );

afterEach(cleanup);

describe('PetTable', () => {
  it('muestra los datos de cada mascota y el total', () => {
    renderTable();
    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getByText('Perro · Labrador')).toBeTruthy();
    expect(screen.getByText('2 años')).toBeTruthy();
    expect(screen.getByText('Disponible')).toBeTruthy();
    expect(screen.getByText('Adoptada')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 mascotas')).toBeTruthy();
  });

  it('enlaza al detalle y a la edición', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Luna' }).getAttribute('href')).toBe('/mascotas/1');
    expect(screen.getByRole('link', { name: 'Editar Luna' }).getAttribute('href')).toBe('/mascotas/1/editar');
  });

  it('solo muestra Eliminar cuando recibe onDelete', () => {
    renderTable();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });

  it('llama a onDelete con la mascota seleccionada', () => {
    const onDelete = vi.fn();
    renderTable({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Luna' }));
    expect(onDelete).toHaveBeenCalledWith(pets[0]);
  });
  
  it('deshabilita Eliminar solo en la mascota que se está eliminando', () => {
    renderTable({ onDelete: vi.fn(), deletingId: 1 });
    expect(screen.getByRole('button', { name: 'Eliminar Luna' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar Rocky' }).disabled).toBe(false);
  });
});