// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ShelterEventPanel from './ShelterEventPanel';

afterEach(cleanup);

describe('ShelterEventPanel', () => {
  it('ofrece un formulario vacío para programar un evento nuevo', () => {
    render(<ShelterEventPanel editing={null} formKey="new-0" onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Nuevo evento' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Programar evento' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.getByLabelText(/^Nombre/).value).toBe('');
  });

  it('carga el evento elegido para editarlo y permite cancelar', () => {
    const onCancel = vi.fn();
    render(
      <ShelterEventPanel
        editing={{ id: 2, title: 'Feria canina', date: '2026-11-05T05:00:00.000+00:00', type: 'Feria' }}
        formKey="edit-2"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Editar evento' })).toBeTruthy();
    expect(screen.getByLabelText(/^Nombre/).value).toBe('Feria canina');
    expect(screen.getByLabelText(/^Fecha/).value).toBe('2026-11-05');
    expect(screen.getByLabelText(/^Tipo/).value).toBe('Feria');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('lleva el foco al nombre cuando se empieza a editar', () => {
    render(
      <ShelterEventPanel
        editing={{ id: 2, title: 'Feria', date: '2026-11-05T05:00:00.000+00:00', type: null }}
        formKey="edit-2"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(document.activeElement).toBe(screen.getByLabelText(/^Nombre/));
  });
});