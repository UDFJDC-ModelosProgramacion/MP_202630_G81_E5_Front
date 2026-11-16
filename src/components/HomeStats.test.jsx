// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import HomeStats from './HomeStats';

afterEach(cleanup);

describe('HomeStats', () => {
  it('muestra las cifras recibidas', () => {
    render(<HomeStats availablePets={5} totalPets={8} shelters={2} />);
    expect(screen.getByText('Mascotas disponibles')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('muestra 0 como valor válido', () => {
    render(<HomeStats availablePets={0} totalPets={0} shelters={0} />);
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('muestra un guion cuando el dato no está disponible', () => {
    render(<HomeStats availablePets={null} totalPets={null} shelters={3} />);
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByText('3')).toBeTruthy();
  });
});