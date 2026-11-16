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

const messagesLink = () => screen.getByRole('link', { name: 'Mis mensajes' });

describe('Header: sección Mis mensajes', () => {
  it('enlaza a /mis-mensajes', () => {
    renderHeader('/mascotas');
    expect(messagesLink().getAttribute('href')).toBe('/mis-mensajes');
    expect(messagesLink().className).not.toContain('app-nav__link--active');
  });

  it('se resalta en el listado y en el detalle de mensajes de un adoptante', () => {
    renderHeader('/adoptantes/7/mensajes');
    expect(messagesLink().className).toContain('app-nav__link--active');
    cleanup();
    renderHeader('/adoptantes/7/mensajes/2');
    expect(messagesLink().className).toContain('app-nav__link--active');
  });

  it('no resalta otras secciones mientras se consultan mensajes', () => {
    renderHeader('/adoptantes/7/mensajes');
    expect(screen.getByRole('link', { name: 'Mis reseñas' }).className).not.toContain(
      'app-nav__link--active',
    );
  });
});

