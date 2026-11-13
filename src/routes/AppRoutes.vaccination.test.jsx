// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

vi.mock('../layouts/MainLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return { default: Outlet };
});
vi.mock('../pages/VaccinationRecordPage', () => ({ default: () => 'PAGINA CARNET' }));
vi.mock('../pages/VaccinationRecordCreatePage', () => ({ default: () => 'PAGINA REGISTRAR' }));
vi.mock('../pages/VaccinationRecordEditPage', () => ({ default: () => 'PAGINA EDITAR CARNET' }));

afterEach(cleanup);

describe('AppRoutes - carnet de vacunación', () => {
  it.each([
    ['/mascotas/7/carnet', 'PAGINA CARNET'],
    ['/mascotas/7/carnet/nuevo', 'PAGINA REGISTRAR'],
    ['/mascotas/7/carnet/editar', 'PAGINA EDITAR CARNET'],
  ])('%s muestra la página correcta', (path, text) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText(text)).toBeTruthy();
  });
});