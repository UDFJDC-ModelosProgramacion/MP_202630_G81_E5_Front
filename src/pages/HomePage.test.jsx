// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import usePets from '../hooks/usePets';
import useShelters from '../hooks/useShelters';

vi.mock('../hooks/usePets', () => ({ default: vi.fn() }));
vi.mock('../hooks/useShelters', () => ({ default: vi.fn() }));

const pets = [
  { id: 1, name: 'Luna', species: 'Perro', age: 3, available: true },
  { id: 2, name: 'Michi', species: 'Gato', age: 1, available: true },
  { id: 3, name: 'Rocky', species: 'Perro', age: 5, available: true },
  { id: 4, name: 'Toby', species: 'Perro', age: 2, available: true },
  { id: 5, name: 'Mia', species: 'Gato', age: 4, available: true },
  { id: 6, name: 'Firulais', species: 'Perro', age: 6, available: false },
];
const shelters = [{ id: 1, name: 'Refugio Adopciones' }, { id: 2, name: 'Refugio Huellitas' }];

function mockHooks({ petsState = {}, sheltersState = {} } = {}) {
  usePets.mockReturnValue({ pets, loading: false, error: null, reload: vi.fn(), ...petsState });
  useShelters.mockReturnValue({ shelters, loading: false, error: null, ...sheltersState });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

describe('HomePage', () => {
  it('muestra el hero, las cifras y hasta 4 mascotas disponibles', () => {
    mockHooks();
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.getByText('Mascotas disponibles', { selector: 'dt' })).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    ['Luna', 'Michi', 'Rocky', 'Toby'].forEach((name) => {
      expect(screen.getByRole('link', { name })).toBeTruthy();
    });
    expect(screen.queryByRole('link', { name: 'Mia' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Firulais' })).toBeNull();
  });

  it('muestra un enlace a todas las mascotas y las tarjetas de módulos', () => {
    mockHooks();
    renderPage();
    expect(screen.getByRole('link', { name: 'Ver todas' }).getAttribute('href')).toBe('/mascotas');
    expect(screen.getByRole('link', { name: 'Adopciones' }).getAttribute('href')).toBe('/adopciones');
    expect(screen.getByRole('link', { name: 'Veterinarios' }).getAttribute('href')).toBe('/veterinarios');
  });

  it('muestra el loader mientras cargan las mascotas', () => {
    mockHooks({ petsState: { pets: [], loading: true } });
    renderPage();
    expect(screen.getByText('Cargando mascotas...')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Mascotas' })).toBeTruthy();
  });

  it('muestra el error y permite reintentar', () => {
    const reload = vi.fn();
    mockHooks({ petsState: { pets: [], error: 'No se pudo cargar.', reload } });
    renderPage();
    expect(screen.getByText('No se pudo cargar.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado vacío si no hay mascotas disponibles', () => {
    mockHooks({ petsState: { pets: [pets[5]] } });
    renderPage();
    expect(screen.getByText('No hay mascotas disponibles por ahora.')).toBeTruthy();
  });

  it('muestra un guion en refugios si falla su carga, sin ocultar las mascotas', () => {
    mockHooks({ sheltersState: { shelters: [], error: 'Error' } });
    renderPage();
    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Luna' })).toBeTruthy();
  });
});