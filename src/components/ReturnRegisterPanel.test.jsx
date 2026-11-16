// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReturnRegisterPanel from './ReturnRegisterPanel';

afterEach(cleanup);

const renderPanel = (onSubmit = vi.fn().mockResolvedValue()) => {
  render(
    <MemoryRouter>
      <ReturnRegisterPanel adoptionId={4} onSubmit={onSubmit} />
    </MemoryRouter>,
  );
  return onSubmit;
};

describe('ReturnRegisterPanel', () => {
  it('explica qué pasa al registrar la devolución y permite cancelar', () => {
    renderPanel();
    expect(screen.getByRole('heading', { name: 'Registrar devolución' })).toBeTruthy();
    expect(
      screen.getByText(
        'Al registrar la devolución, la adopción pasa a «Devuelta» y la mascota vuelve a estar disponible para adopción.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/adopciones/4');
  });

  it('propone la fecha de hoy y envía el motivo escrito', async () => {
    const onSubmit = renderPanel();
    expect(screen.getByLabelText('Fecha de devolución').value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Alergia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar devolución' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        date: screen.getByLabelText('Fecha de devolución').value,
        reason: 'Alergia',
      }),
    );
  });
});
