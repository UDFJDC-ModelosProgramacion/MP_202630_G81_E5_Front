// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

afterEach(cleanup);

const renderHeader = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );

describe('Header: sección Adopciones', () => {
  it('enlaza a /adopciones y se resalta en el listado', () => {
    renderHeader('/adopciones');
    const link = screen.getByRole('link', { name: 'Adopciones' });
    expect(link.getAttribute('href')).toBe('/adopciones');
    expect(link.className).toContain('app-nav__link--active');
  });

  it('se mantiene resaltada en el detalle de una adopción', () => {
    renderHeader('/adopciones/3');
    expect(screen.getByRole('link', { name: 'Adopciones' }).className).toContain(
      'app-nav__link--active',
    );
  });

  it('no se resalta en otras secciones', () => {
    renderHeader('/mascotas');
    expect(screen.getByRole('link', { name: 'Adopciones' }).className).not.toContain(
      'app-nav__link--active',
    );
  });
});
