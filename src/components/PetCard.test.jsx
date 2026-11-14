// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetCard from './PetCard';

afterEach(cleanup);

function renderCard(pet) {
  return render(
    <MemoryRouter>
      <ul>
        <PetCard pet={pet} />
      </ul>
    </MemoryRouter>,
  );
}

describe('PetCard', () => {
  it('muestra los datos de la mascota y enlaza a su detalle', () => {
    renderCard({
      id: 7,
      name: 'Luna',
      species: 'Perro',
      breed: 'Criollo',
      age: 3,
      available: true,
      shelter: { id: 1, name: 'Refugio Adopciones' },
    });
    expect(screen.getByRole('link', { name: 'Luna' }).getAttribute('href')).toBe('/mascotas/7');
    expect(screen.getByText('Perro · Criollo')).toBeTruthy();
    expect(screen.getByText('3 años')).toBeTruthy();
    expect(screen.getByText('Disponible')).toBeTruthy();
    expect(screen.getByText('Refugio Adopciones')).toBeTruthy();
  });

  it('usa singular para un año y acepta edad 0', () => {
    renderCard({ id: 1, name: 'Michi', species: 'Gato', age: 1, available: true });
    expect(screen.getByText('1 año')).toBeTruthy();
    cleanup();
    renderCard({ id: 2, name: 'Pelusa', species: 'Gato', age: 0, available: true });
    expect(screen.getByText('0 años')).toBeTruthy();
  });

  it('omite raza, edad y refugio cuando no existen', () => {
    renderCard({ id: 3, name: 'Toby', species: 'Perro', available: false });
    expect(screen.getByText('Perro')).toBeTruthy();
    expect(screen.getByText('Adoptada')).toBeTruthy();
    expect(screen.queryByText(/año/)).toBeNull();
  });
});