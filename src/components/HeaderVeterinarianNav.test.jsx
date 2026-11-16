// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

afterEach(cleanup);

const ACTIVE = 'app-nav__link--active';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );

const link = (name) => screen.getByRole('link', { name });

describe('Header - sección de veterinarios', () => {
  it('enlaza Veterinarios al listado de veterinarios', () => {
    renderAt('/mascotas');
    expect(link('Veterinarios').getAttribute('href')).toBe('/veterinarios');
  });

  it.each([
    '/veterinarios',
    '/veterinarios/nuevo',
    '/veterinarios/3',
    '/veterinarios/3/editar',
  ])('resalta Veterinarios, y no Refugios ni Mascotas, en %s', (path) => {
    renderAt(path);
    expect(link('Veterinarios').className).toContain(ACTIVE);
    expect(link('Refugios').className).not.toContain(ACTIVE);
    expect(link('Mascotas').className).not.toContain(ACTIVE);
  });

  it('resalta Refugios y no Veterinarios en /refugios', () => {
    renderAt('/refugios');
    expect(link('Refugios').className).toContain(ACTIVE);
    expect(link('Veterinarios').className).not.toContain(ACTIVE);
  });

  it('no resalta Veterinarios en otras secciones', () => {
    renderAt('/mascotas');
    expect(link('Veterinarios').className).not.toContain(ACTIVE);
  });
});