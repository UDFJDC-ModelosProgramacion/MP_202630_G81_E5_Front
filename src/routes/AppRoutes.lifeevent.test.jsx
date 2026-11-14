// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

vi.mock('../layouts/MainLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return { default: Outlet };
});
vi.mock('../pages/LifeEventListPage', () => ({ default: () => 'PAGINA EVENTOS' }));
vi.mock('../pages/LifeEventCreatePage', () => ({ default: () => 'PAGINA REGISTRAR EVENTO' }));
vi.mock('../pages/LifeEventDetailPage', () => ({ default: () => 'PAGINA DETALLE EVENTO' }));
vi.mock('../pages/LifeEventEditPage', () => ({ default: () => 'PAGINA EDITAR EVENTO' }));

afterEach(cleanup);

describe('AppRoutes - eventos de vida', () => {
  it.each([
    ['/mascotas/7/eventos-de-vida', 'PAGINA EVENTOS'],
    ['/mascotas/7/eventos-de-vida/nuevo', 'PAGINA REGISTRAR EVENTO'],
    ['/mascotas/7/eventos-de-vida/3', 'PAGINA DETALLE EVENTO'],
    ['/mascotas/7/eventos-de-vida/3/editar', 'PAGINA EDITAR EVENTO'],
  ])('%s muestra la página correcta', (path, text) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText(text)).toBeTruthy();
  });
});