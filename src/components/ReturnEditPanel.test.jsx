// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReturnEditPanel from './ReturnEditPanel';

afterEach(cleanup);

const returnRecord = { id: 1, date: '2026-10-05T00:00:00.000+00:00', reason: 'Se mudó' };

const renderPanel = (props = {}) => {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  const onCancel = props.onCancel ?? vi.fn();
  render(<ReturnEditPanel returnRecord={returnRecord} onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel };
};

describe('ReturnEditPanel', () => {
  it('carga la fecha y el motivo de la devolución para editarlos', () => {
    renderPanel();
    expect(screen.getByRole('heading', { name: 'Editar devolución' })).toBeTruthy();
    expect(screen.getByLabelText('Fecha de devolución').value).toBe('2026-10-05');
    expect(screen.getByLabelText('Motivo').value).toBe('Se mudó');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
  });

  it('envía los cambios válidos', async () => {
    const { onSubmit } = renderPanel();
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Alergia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ date: '2026-10-05', reason: 'Alergia' }),
    );
  });

  it('permite cancelar sin guardar', () => {
    const { onSubmit, onCancel } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
