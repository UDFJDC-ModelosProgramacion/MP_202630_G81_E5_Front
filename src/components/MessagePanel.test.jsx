// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MessagePanel from './MessagePanel';

afterEach(cleanup);

describe('MessagePanel', () => {
  it('ofrece un formulario vacío para enviar un mensaje nuevo', () => {
    render(<MessagePanel editing={null} formKey="new-0" onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Nuevo mensaje' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.getByLabelText('Mensaje').value).toBe('');
  });

  it('carga el mensaje elegido para editarlo y permite cancelar', () => {
    const onCancel = vi.fn();
    render(
      <MessagePanel
        editing={{ id: 2, content: 'Hola, quiero adoptar', sentDate: '2026-11-05' }}
        formKey="edit-2"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Editar mensaje' })).toBeTruthy();
    expect(screen.getByLabelText('Mensaje').value).toBe('Hola, quiero adoptar');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('lleva el foco al formulario cuando se empieza a editar', () => {
    render(
      <MessagePanel
        editing={{ id: 2, content: 'Hola', sentDate: '2026-11-05' }}
        formKey="edit-2"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(document.activeElement).toBe(screen.getByLabelText('Mensaje'));
  });
});