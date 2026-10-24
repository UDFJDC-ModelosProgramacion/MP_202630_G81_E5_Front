// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdoptionTable from './AdoptionTable';

const adoptions = [
  {
    id: 1,
    date: '2026-09-20T00:00:00.000+00:00',
    status: 'IN_PROGRESS',
    pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo' },
    adopter: { id: 1, name: 'Laura Gómez' },
    responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
  },
  {
    id: 2,
    date: '2026-09-14T00:00:00.000+00:00',
    status: 'APPROVED',
    pet: { id: 2, name: 'Michi', species: 'Gato', breed: 'Siamés' },
    adopter: { id: 2, name: 'Carlos Pérez' },
    responsibleVeterinarian: { id: 2, name: 'Dra. Marta Silva' },
  },
  {
    id: 3,
    date: '2026-09-02T00:00:00.000+00:00',
    status: 'RETURNED',
    pet: { id: 3, name: 'Luna', species: 'Perro', breed: 'Labrador' },
    adopter: { id: 3, name: 'Ana Torres' },
    responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
  },
];

const renderTable = (list = adoptions) =>
  render(
    <MemoryRouter>
      <AdoptionTable adoptions={list} />
    </MemoryRouter>,
  );

afterEach(cleanup);

describe('AdoptionTable', () => {
  it('muestra mascota, adoptante, veterinario, fecha y estado de cada adopción', () => {
    renderTable();
    expect(screen.getByText('Firulais')).toBeTruthy();
    expect(screen.getByText('Perro · Criollo')).toBeTruthy();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getAllByText('Dr. Andrés Ríos')).toHaveLength(2);
    expect(screen.getByText('20 sep 2026')).toBeTruthy();
    expect(screen.getByText('02 sep 2026')).toBeTruthy();
  });

  it('traduce el estado a su etiqueta', () => {
    renderTable();
    expect(screen.getByText('En curso')).toBeTruthy();
    expect(screen.getByText('Aprobada')).toBeTruthy();
    expect(screen.getByText('Devuelta')).toBeTruthy();
  });

  it('enlaza cada fila con el detalle de su adopción', () => {
    renderTable();
    const link = screen.getByRole('link', { name: 'Ver detalle de la adopción de Michi' });
    expect(link.getAttribute('href')).toBe('/adopciones/2');
  });

  it('muestra el total en plural y en singular', () => {
    renderTable();
    expect(screen.getByText('Mostrando 3 adopciones')).toBeTruthy();
    cleanup();
    renderTable([adoptions[0]]);
    expect(screen.getByText('Mostrando 1 adopción')).toBeTruthy();
  });

  it('muestra un guion cuando faltan datos relacionados', () => {
    renderTable([{ id: 7, date: null, status: 'IN_PROGRESS', pet: null, adopter: null, responsibleVeterinarian: null }]);
    expect(screen.getAllByText('—')).toHaveLength(4);
    expect(
      screen.getByRole('link', { name: 'Ver detalle de la adopción de la mascota' }),
    ).toBeTruthy();
  });
});
