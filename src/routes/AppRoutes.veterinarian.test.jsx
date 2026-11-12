// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

vi.mock('../layouts/MainLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return { default: Outlet };
});
vi.mock('../pages/VeterinarianListPage', () => ({ default: () => 'PAGINA LISTADO' }));
vi.mock('../pages/VeterinarianCreatePage', () => ({ default: () => 'PAGINA CREAR' }));
vi.mock('../pages/VeterinarianDetailPage', () => ({ default: () => 'PAGINA DETALLE' }));
vi.mock('../pages/VeterinarianEditPage', () => ({ default: () => 'PAGINA EDITAR' }));

afterEach(cleanup);

describe('AppRoutes - veterinarios', () => {
  it.each([
    ['/veterinarios', 'PAGINA LISTADO'],
    ['/veterinarios/nuevo', 'PAGINA CREAR'],
    ['/veterinarios/7', 'PAGINA DETALLE'],
    ['/veterinarios/7/editar', 'PAGINA EDITAR'],
  ])('%s muestra la página correcta', (path, text) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText(text)).toBeTruthy();
  });
});