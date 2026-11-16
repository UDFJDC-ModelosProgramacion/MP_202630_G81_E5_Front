// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ReturnAdoptionSummary from './ReturnAdoptionSummary';

afterEach(cleanup);

const adoption = {
  id: 1,
  date: '2026-09-20T00:00:00.000+00:00',
  status: 'APPROVED',
  pet: { id: 1, name: 'Firulais', species: 'Perro', breed: 'Criollo', age: 3, available: false },
  adopter: { id: 1, name: 'Laura Gómez' },
  responsibleVeterinarian: { id: 1, name: 'Dr. Andrés Ríos' },
};

describe('ReturnAdoptionSummary', () => {
  it('muestra la mascota, el adoptante, el veterinario y la fecha de adopción', () => {
    render(<ReturnAdoptionSummary adoption={adoption} hasReturnRecord={false} />);
    expect(screen.getByRole('heading', { name: 'Resumen de la adopción' })).toBeTruthy();
    expect(screen.getByText('Firulais')).toBeTruthy();
    expect(screen.getByText('Perro · Criollo · 3 años')).toBeTruthy();
    expect(screen.getByText('Laura Gómez')).toBeTruthy();
    expect(screen.getByText('Dr. Andrés Ríos')).toBeTruthy();
    expect(screen.getByText('20 sep 2026')).toBeTruthy();
  });

  it('avisa que todavía no hay devolución cuando no existe', () => {
    render(<ReturnAdoptionSummary adoption={adoption} hasReturnRecord={false} />);
    expect(screen.getByText('Esta adopción todavía no tiene una devolución registrada.')).toBeTruthy();
    expect(screen.queryByText('Disponible')).toBeNull();
  });

  it('no muestra el aviso y marca la mascota como disponible tras la devolución', () => {
    const returned = { ...adoption, pet: { ...adoption.pet, available: true } };
    render(<ReturnAdoptionSummary adoption={returned} hasReturnRecord />);
    expect(screen.queryByText(/todavía no tiene una devolución/)).toBeNull();
    expect(screen.getByText('Disponible')).toBeTruthy();
  });

  it('muestra guiones cuando faltan datos', () => {
    render(<ReturnAdoptionSummary adoption={{ id: 2, date: null }} hasReturnRecord />);
    expect(screen.getAllByText('—')).toHaveLength(4);
  });
});
