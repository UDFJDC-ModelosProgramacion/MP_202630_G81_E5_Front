// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LifeEventForm from './LifeEventForm';
import { EMPTY_LIFE_EVENT_FORM } from '../services/lifeEventMapper';

const pet = { id: 1, name: 'Luna', species: 'Perro' };
const veterinarians = [
  { id: 1, name: 'Laura Martínez', specialty: 'Medicina interna' },
  { id: 2, name: 'Carlos Gómez', specialty: 'Cirugía' },
];

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MemoryRouter>
      <LifeEventForm
        pet={pet}
        initialValues={EMPTY_LIFE_EVENT_FORM}
        veterinarians={veterinarians}
        submitLabel="Registrar evento"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return onSubmit;
}

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar evento' }));

function fillValid() {
  type('Tipo', 'Vacunación');
  type('Fecha', '2026-05-10');
}

describe('LifeEventForm', () => {
  it('envía todos los valores del evento', async () => {
    const onSubmit = renderForm();
    fillValid();
    type(/^Descripción/, 'Refuerzo anual');
    type(/^Veterinario/, '1');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      type: 'Vacunación',
      date: '2026-05-10',
      description: 'Refuerzo anual',
      veterinarianId: '1',
    });
  });

  it('permite enviar sin descripción ni veterinario (son opcionales)', async () => {
    const onSubmit = renderForm();
    fillValid();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].description).toBe('');
    expect(onSubmit.mock.calls[0][0].veterinarianId).toBe('');
  });

  it('rechaza un tipo vacío', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Tipo', '');
    submit();
    expect(screen.getByText('El tipo es obligatorio.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una fecha vacía', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Fecha', '');
    submit();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra ambos errores y enfoca el tipo', () => {
    renderForm();
    submit();
    expect(screen.getByText('El tipo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
    expect(document.activeElement.id).toBe('type');
    expect(screen.getByLabelText('Tipo').getAttribute('aria-invalid')).toBe('true');
  });

  it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    type('Tipo', 'Control');
    expect(screen.queryByText('El tipo es obligatorio.')).toBeNull();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
  });

  it('muestra el error cuando el veterinario no existe y vuelve a habilitar el botón', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: {
        status: 404,
        data: { apierror: { message: 'The veterinarian with the given id was not found' } },
      },
    });
    renderForm({ onSubmit });
    fillValid();
    submit();
    expect(await screen.findByText('Veterinario no encontrado.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar evento' }).disabled).toBe(false);
  });

  it('deshabilita el botón y muestra "Guardando..." mientras envía', async () => {
    renderForm({ onSubmit: vi.fn().mockReturnValue(new Promise(() => {})) });
    fillValid();
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('muestra la mascota bloqueada', () => {
    renderForm();
    const select = screen.getByLabelText('Mascota');
    expect(select.disabled).toBe(true);
    expect(screen.getByRole('option', { name: 'Luna · Perro' })).toBeTruthy();
  });

  it('ofrece los tipos y los veterinarios con su especialidad', () => {
    renderForm();
    expect(screen.getByRole('option', { name: 'Selecciona un tipo' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Vacunación' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Control' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Cirugía' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Sin veterinario' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Laura Martínez · Medicina interna' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Carlos Gómez · Cirugía' })).toBeTruthy();
  });

  it('carga los valores iniciales y conserva un tipo que no está entre los conocidos', () => {
    renderForm({
      initialValues: {
        type: 'Adopción',
        date: '2026-05-10',
        description: 'Entregada a su familia',
        veterinarianId: '2',
      },
    });
    expect(screen.getByLabelText('Tipo').value).toBe('Adopción');
    expect(screen.getByRole('option', { name: 'Adopción' })).toBeTruthy();
    expect(screen.getByLabelText('Fecha').value).toBe('2026-05-10');
    expect(screen.getByLabelText(/^Descripción/).value).toBe('Entregada a su familia');
    expect(screen.getByLabelText(/^Veterinario/).value).toBe('2');
  });

  it('enlaza Cancelar al listado de eventos de la mascota', () => {
    renderForm();
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe(
      '/mascotas/1/eventos-de-vida',
    );
  });
});