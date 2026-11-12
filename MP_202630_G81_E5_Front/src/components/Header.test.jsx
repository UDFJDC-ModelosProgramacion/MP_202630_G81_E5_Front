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
});