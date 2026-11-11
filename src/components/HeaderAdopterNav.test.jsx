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

const adoptersLink = () => screen.getByRole('link', { name: 'Adoptantes' });
const ACTIVE = 'app-nav__link--active';

describe('Header: sección Adoptantes', () => {
it('enlaza a /adoptantes y no se resalta en otras secciones', () => {
    renderHeader('/mascotas');
    expect(adoptersLink().getAttribute('href')).toBe('/adoptantes');
    expect(adoptersLink().className).not.toContain(ACTIVE);
});

it('se resalta en el listado, el perfil y la edición', () => {
    for (const path of ['/adoptantes', '/adoptantes/7', '/adoptantes/7/editar', '/adoptantes/nuevo']) {
    renderHeader(path);
    expect(adoptersLink().className).toContain(ACTIVE);
    cleanup();
    }
});

it('no se resalta en las reseñas de un adoptante, solo Mis reseñas', () => {
    renderHeader('/adoptantes/7/resenas');
    expect(adoptersLink().className).not.toContain(ACTIVE);
    expect(screen.getByRole('link', { name: 'Mis reseñas' }).className).toContain(ACTIVE);
});
});