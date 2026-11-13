// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

afterEach(cleanup);

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );

describe('Header - sección de veterinarios', () => {
  it.each([
    '/veterinarios',
    '/veterinarios/nuevo',
    '/veterinarios/3',
    '/veterinarios/3/editar',
  ])('resalta Refugios en %s', (path) => {
    renderAt(path);
    expect(screen.getByRole('link', { name: 'Refugios' }).className).toContain(
      'app-nav__link--active',
    );
    expect(screen.getByRole('link', { name: 'Mascotas' }).className).not.toContain(
      'app-nav__link--active',
    );
  });

  it('no resalta Refugios fuera de refugios y veterinarios', () => {
    renderAt('/mascotas');
    expect(screen.getByRole('link', { name: 'Refugios' }).className).not.toContain(
      'app-nav__link--active',
    );
  });
});