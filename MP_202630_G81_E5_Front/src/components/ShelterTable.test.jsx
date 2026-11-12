// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShelterTable from './ShelterTable';

const shelters = [
  { id: 1, name: 'Huellitas', city: 'Bogotá', petsCount: 4, eventsCount: 3 },
  { id: 2, name: 'Patitas', city: 'Cali', petsCount: 0, eventsCount: 1 },
];

const renderTable = (props = {}) =>
  render(
    <MemoryRouter>
      <ShelterTable shelters={shelters} {...props} />
    </MemoryRouter>,
  );

afterEach(cleanup);

describe('ShelterTable', () => {
  it('muestra los datos de cada refugio y el total', () => {
    renderTable();
    expect(screen.getByText('Huellitas')).toBeTruthy();
    expect(screen.getByText('Cali')).toBeTruthy();
    expect(screen.getByText('Mostrando 2 refugios')).toBeTruthy();
  });

  it('usa el singular cuando hay un solo refugio', () => {
    renderTable({ shelters: [shelters[0]] });
    expect(screen.getByText('Mostrando 1 refugio')).toBeTruthy();
  });

  it('enlaza al detalle y a la edición', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Ver detalle de Huellitas' }).getAttribute('href')).toBe('/refugios/1');
    expect(screen.getByRole('link', { name: 'Editar Huellitas' }).getAttribute('href')).toBe('/refugios/1/editar');
  });

  it('solo muestra Eliminar cuando recibe onDelete', () => {
    renderTable();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });

  it('llama a onDelete con el refugio seleccionado', () => {
    const onDelete = vi.fn();
    renderTable({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Huellitas' }));
    expect(onDelete).toHaveBeenCalledWith(shelters[0]);
  });

  it('deshabilita Eliminar solo en el refugio que se está eliminando', () => {
    renderTable({ onDelete: vi.fn(), deletingId: 1 });
    expect(screen.getByRole('button', { name: 'Eliminar Huellitas' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Eliminar Patitas' }).disabled).toBe(false);
  });
});