// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

afterEach(cleanup);

describe('Header', () => {
  it('resalta la sección Mascotas cuando está activa', () => {
    render(
      <MemoryRouter initialEntries={['/mascotas']}>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText('AdoptaYa')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Mascotas' }).className).toContain('app-nav__link--active');
  });

  it('habilita el enlace Refugios y lo resalta en /refugios', () => {
    render(
      <MemoryRouter initialEntries={['/refugios']}>
        <Header />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Refugios' });
    expect(link.getAttribute('href')).toBe('/refugios');
    expect(link.className).toContain('app-nav__link--active');
  });
  
  it('resalta Inicio solo en la página principal', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Inicio' }).className).toContain('app-nav__link--active');
    expect(screen.getByRole('link', { name: 'Mascotas' }).className).not.toContain('app-nav__link--active');
  });

  it('no resalta Inicio en otras secciones', () => {
    render(
      <MemoryRouter initialEntries={['/mascotas']}>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Inicio' }).className).not.toContain('app-nav__link--active');
  });
});

