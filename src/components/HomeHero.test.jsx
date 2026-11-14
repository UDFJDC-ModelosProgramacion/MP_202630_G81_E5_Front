// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeHero from './HomeHero';

afterEach(cleanup);

describe('HomeHero', () => {
  it('muestra el título y los accesos principales', () => {
    render(
      <MemoryRouter>
        <HomeHero />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('nuevo hogar');
    expect(screen.getByRole('link', { name: 'Ver mascotas disponibles' }).getAttribute('href')).toBe('/mascotas');
    expect(screen.getByRole('link', { name: 'Registrar adopción' }).getAttribute('href')).toBe('/adopciones/nueva');
  });
});