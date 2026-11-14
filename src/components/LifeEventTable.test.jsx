// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LifeEventTable from './LifeEventTable';

afterEach(cleanup);

const events = [
  {
    id: 1,
    type: 'Vacunación',
    date: '2026-05-10T00:00:00.000+00:00',
    description: 'Aplicación de la vacuna antirrábica',
    veterinarian: { id: 1, name: 'Laura Martínez' },
  },
  {
    id: 2,
    type: 'Control',
    date: '2026-03-02T00:00:00.000+00:00',
    description: null,
    veterinarian: null,
  },
];

const renderTable = (props = {}) =>
  render(
    <MemoryRouter>
      <LifeEventTable petId={5} events={events} {...props} />
    </MemoryRouter>,
  );

describe('LifeEventTable', () => {
  it('muestra los datos de cada evento y el conteo', () => {
    renderTable();
    expect(screen.getByText('10 may 2026')).toBeTruthy();
    expect(screen.getByText('Vacunación').className).toContain('life-event-badge--vaccination');
    expect(screen.getByText('Aplicación de la vacuna antirrábica')).toBeTruthy();
    expect(screen.getByText('Laura Martínez')).toBeTruthy();
    expect(screen.getByText('Control').className).toContain('life-event-badge--checkup');
    expect(screen.getByText('Mostrando 2 eventos')).toBeTruthy();
  });

  it('usa el singular cuando hay un solo evento', () => {
    renderTable({ events: [events[0]] });
    expect(screen.getByText('Mostrando 1 evento')).toBeTruthy();
  });

  it('muestra un guion cuando faltan la descripción o el veterinario', () => {
    renderTable();
    expect(screen.getAllByText('—').length).toBe(2);
  });

  it('enlaza la fecha al detalle y la acción Editar a la edición', () => {
    renderTable();
    expect(screen.getByRole('link', { name: '10 may 2026' }).getAttribute('href')).toBe(
      '/mascotas/5/eventos-de-vida/1',
    );
    expect(
      screen.getByRole('link', { name: 'Editar Control del 02 mar 2026' }).getAttribute('href'),
    ).toBe('/mascotas/5/eventos-de-vida/2/editar');
  });

  it('no muestra Eliminar si no se pasa onDelete', () => {
    renderTable();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });

  it('llama a onDelete con el evento y deshabilita el que se está eliminando', () => {
    const onDelete = vi.fn();
    renderTable({ onDelete, deletingId: 2 });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Vacunación del 10 may 2026' }));
    expect(onDelete).toHaveBeenCalledWith(events[0]);
    expect(screen.getByRole('button', { name: 'Eliminar Control del 02 mar 2026' }).disabled).toBe(
      true,
    );
  });
});