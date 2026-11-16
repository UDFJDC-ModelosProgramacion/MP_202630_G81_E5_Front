// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import VaccinationRecordCard from './VaccinationRecordCard';

afterEach(cleanup);

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const record = {
  id: 5,
  vaccinesApplied: 'Rabia, Parvovirus, Moquillo',
  nextDueDate: '2027-08-01',
};

describe('VaccinationRecordCard', () => {
  it('muestra el carnet con las vacunas, la próxima fecha y la mascota', () => {
    render(<VaccinationRecordCard pet={pet} record={record} />);
    expect(screen.getByRole('heading', { name: 'Carnet de Luna' })).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBe(3);
    expect(screen.getByText('1 de agosto de 2027')).toBeTruthy();
    expect(screen.getByText('Luna · Perro')).toBeTruthy();
  });

  it('muestra un guion cuando no hay próxima fecha', () => {
    render(<VaccinationRecordCard pet={pet} record={{ ...record, nextDueDate: null }} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('no muestra Eliminar carnet si no se pasa onDelete', () => {
    render(<VaccinationRecordCard pet={pet} record={record} />);
    expect(screen.queryByRole('button', { name: 'Eliminar carnet' })).toBeNull();
  });

  it('llama a onDelete al pulsar Eliminar carnet', () => {
    const onDelete = vi.fn();
    render(<VaccinationRecordCard pet={pet} record={record} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar carnet' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('deshabilita Eliminar carnet mientras se elimina', () => {
    render(<VaccinationRecordCard pet={pet} record={record} onDelete={vi.fn()} deleting />);
    expect(screen.getByRole('button', { name: 'Eliminar carnet' }).disabled).toBe(true);
  });
});