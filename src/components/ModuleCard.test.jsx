// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ModuleCard from './ModuleCard';

afterEach(cleanup);

describe('ModuleCard', () => {
  it('muestra título, descripción y enlace', () => {
    render(
      <MemoryRouter>
        <ul>
          <ModuleCard title="Refugios" description="Gestiona refugios." to="/refugios" />
        </ul>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Refugios' }).getAttribute('href')).toBe('/refugios');
    expect(screen.getByText('Gestiona refugios.')).toBeTruthy();
  });
});