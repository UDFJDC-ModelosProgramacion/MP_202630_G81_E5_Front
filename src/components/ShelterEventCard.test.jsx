// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShelterEventCard from './ShelterEventCard';

afterEach(cleanup);

const pastEvent = { id: 3, title: 'Jornada de adopción', date: '2020-01-10T05:00:00.000+00:00', type: 'Jornada' };
const futureEvent = { id: 4, title: 'Feria canina', date: '2099-01-10T05:00:00.000+00:00', type: null };

const renderCard = (event, props = {}) =>
  render(
    <MemoryRouter>
      <ShelterEventCard
        event={event}
        shelterId={7}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );

describe('ShelterEventCard', () => {
  it('muestra el nombre, la fecha, el tipo y el enlace al detalle', () => {
    renderCard(pastEvent);
    expect(screen.getByRole('heading', { name: 'Jornada de adopción' })).toBeTruthy();
    expect(screen.getByText('10 ene 2020')).toBeTruthy();
    expect(screen.getByText('Jornada')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Ver detalle del evento 3' }).getAttribute('href'),
    ).toBe('/refugios/7/eventos/3');
  });

  it('marca como Realizado un evento que ya pasó y como Próximo uno futuro', () => {
    renderCard(pastEvent);
    expect(screen.getByText('Realizado')).toBeTruthy();
    cleanup();
    renderCard(futureEvent);
    expect(screen.getByText('Próximo')).toBeTruthy();
  });

  it('indica cuando el evento no tiene tipo', () => {
    renderCard(futureEvent);
    expect(screen.getByText('Sin tipo.')).toBeTruthy();
  });

  it('avisa al editar o eliminar', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderCard(futureEvent, { onEdit, onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Editar el evento 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el evento 4' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('bloquea las acciones mientras se elimina y resalta el evento en edición', () => {
    renderCard(futureEvent, { deleting: true, editing: true });
    const remove = screen.getByRole('button', { name: 'Eliminar el evento 4' });
    expect(remove.textContent).toBe('Eliminando...');
    expect(remove.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Editar el evento 4' }).disabled).toBe(true);
    expect(document.querySelector('.event-card--editing')).toBeTruthy();
  });
});