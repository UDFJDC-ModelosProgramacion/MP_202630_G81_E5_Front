// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MessageCard from './MessageCard';

afterEach(cleanup);

const renderCard = (message, props = {}) =>
  render(
    <MemoryRouter>
      <MessageCard
        message={message}
        adopterId={7}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );

describe('MessageCard', () => {
  it('muestra la insignia, la fecha, el contenido y el enlace al detalle', () => {
    renderCard({ id: 3, content: 'Hola, quiero adoptar', sentDate: '2026-11-05' });
    expect(screen.getByText('Enviado')).toBeTruthy();
    expect(screen.getByText('05 nov 2026')).toBeTruthy();
    expect(screen.getByText('Hola, quiero adoptar')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Ver detalle del mensaje 3' }).getAttribute('href'),
    ).toBe('/adoptantes/7/mensajes/3');
  });

  it('avisa al editar o eliminar', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderCard({ id: 3, content: 'Hola', sentDate: '2026-11-05' }, { onEdit, onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Editar el mensaje 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el mensaje 3' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('bloquea las acciones y avisa mientras se elimina', () => {
    renderCard({ id: 3, content: 'Hola', sentDate: '2026-11-05' }, { deleting: true });
    const remove = screen.getByRole('button', { name: 'Eliminar el mensaje 3' });
    expect(remove.textContent).toBe('Eliminando...');
    expect(remove.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Editar el mensaje 3' }).disabled).toBe(true);
  });

  it('resalta el mensaje que se está editando', () => {
    renderCard({ id: 3, content: 'Hola', sentDate: '2026-11-05' }, { editing: true });
    expect(document.querySelector('.message-card--editing')).toBeTruthy();
  });
});