// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetSectionBreadcrumb from './PetSectionBreadcrumb';

afterEach(cleanup);

const pet = { id: 1, name: 'Luna' };

const renderCrumb = (props = {}) =>
  render(
    <MemoryRouter>
      <PetSectionBreadcrumb section="Eventos de vida" sectionPath="/eventos-de-vida" {...props} />
    </MemoryRouter>,
  );

const crumbText = () => screen.getByRole('navigation', { name: 'Ruta de navegación' }).textContent;

describe('PetSectionBreadcrumb', () => {
  it('muestra solo Mascotas y la sección mientras no se conoce la mascota', () => {
    renderCrumb();
    expect(crumbText()).toBe('Mascotas / Eventos de vida');
    expect(screen.getAllByRole('link').length).toBe(1);
  });

  it('incluye la mascota y deja la sección como texto cuando no hay página actual', () => {
    renderCrumb({ pet });
    expect(crumbText()).toBe('Mascotas / Luna / Eventos de vida');
    expect(screen.getByRole('link', { name: 'Luna' }).getAttribute('href')).toBe('/mascotas/1');
    expect(screen.queryByRole('link', { name: 'Eventos de vida' })).toBeNull();
  });

  it('enlaza la sección y muestra la página actual', () => {
    renderCrumb({ pet, current: 'Detalle' });
    expect(crumbText()).toBe('Mascotas / Luna / Eventos de vida / Detalle');
    expect(screen.getByRole('link', { name: 'Eventos de vida' }).getAttribute('href')).toBe(
      '/mascotas/1/eventos-de-vida',
    );
    expect(screen.getByRole('link', { name: 'Mascotas' }).getAttribute('href')).toBe('/mascotas');
  });

  it('ignora la página actual si la mascota aún no se conoce', () => {
    renderCrumb({ current: 'Detalle' });
    expect(crumbText()).toBe('Mascotas / Eventos de vida');
  });
});