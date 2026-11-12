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

const reviewsLink = () => screen.getByRole('link', { name: 'Mis reseñas' });

describe('Header: sección Mis reseñas', () => {
  it('enlaza a /mis-resenas', () => {
    renderHeader('/mascotas');
    expect(reviewsLink().getAttribute('href')).toBe('/mis-resenas');
    expect(reviewsLink().className).not.toContain('app-nav__link--active');
  });

  it('se resalta en el listado y en el detalle de reseñas de un adoptante', () => {
    renderHeader('/adoptantes/7/resenas');
    expect(reviewsLink().className).toContain('app-nav__link--active');
    cleanup();
    renderHeader('/adoptantes/7/resenas/2');
    expect(reviewsLink().className).toContain('app-nav__link--active');
  });

  it('no resalta otras secciones mientras se consultan reseñas', () => {
    renderHeader('/adoptantes/7/resenas');
    expect(screen.getByRole('link', { name: 'Adopciones' }).className).not.toContain(
      'app-nav__link--active',
    );
  });
});
