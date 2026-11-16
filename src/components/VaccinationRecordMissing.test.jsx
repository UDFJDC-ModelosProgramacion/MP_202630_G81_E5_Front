// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VaccinationRecordMissing from './VaccinationRecordMissing';

afterEach(cleanup);

const renderMissing = (props = {}) =>
  render(
    <MemoryRouter>
      <VaccinationRecordMissing pet={{ id: 3 }} {...props} />
    </MemoryRouter>,
  );

describe('VaccinationRecordMissing', () => {
  it('muestra el aviso y el enlace para registrar el carnet', () => {
    renderMissing();
    expect(screen.getByRole('alert').textContent).toBe('Carnet de vacunación no encontrado.');
    expect(screen.getByRole('link', { name: 'Registrar carnet' }).getAttribute('href')).toBe(
      '/mascotas/3/carnet/nuevo',
    );
  });

  it('muestra solo el enlace cuando se oculta el aviso', () => {
    renderMissing({ showAlert: false });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('link', { name: 'Registrar carnet' })).toBeTruthy();
  });
});