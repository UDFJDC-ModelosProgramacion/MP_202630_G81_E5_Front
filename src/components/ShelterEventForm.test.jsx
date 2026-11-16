// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ShelterEventForm from './ShelterEventForm';
import { EMPTY_EVENT_FORM } from '../services/shelterEventMapper';

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <ShelterEventForm
      initialValues={EMPTY_EVENT_FORM}
      submitLabel="Programar evento"
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return onSubmit;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Programar evento' }));
const apiError = (status, message) =>
  vi.fn().mockRejectedValue({ response: { status, data: { apierror: { message } } } });

describe('ShelterEventForm', () => {
  it('marca el tipo como opcional', () => {
    renderForm();
    expect(screen.getByText('(opcional)')).toBeTruthy();
  });

  it('rechaza el envío sin nombre ni fecha y enfoca el nombre', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Nombre/));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía los valores cuando el formulario es válido', async () => {
    const onSubmit = renderForm();
    type(/^Nombre/, 'Jornada');
    type(/^Fecha/, '2026-11-20');
    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'Jornada', date: '2026-11-20', type: '' }),
    );
  });

  it('quita el error de un campo al escribir en él', () => {
    renderForm();
    submit();
    type(/^Nombre/, 'Jornada');
    expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
    expect(screen.getByText('La fecha es obligatoria.')).toBeTruthy();
  });

  it('muestra el mensaje del back y conserva lo escrito', async () => {
    renderForm({
      onSubmit: apiError(412, 'The shelter event is not associated to the shelter'),
    });
    type(/^Nombre/, 'Jornada');
    type(/^Fecha/, '2026-11-20');
    submit();
    expect(await screen.findByText('Este evento pertenece a otro refugio.')).toBeTruthy();
    expect(screen.getByLabelText(/^Nombre/).value).toBe('Jornada');
  });

  it('lleva el foco al nombre cuando se empieza a editar', () => {
    renderForm({ focusOnMount: true });
    expect(document.activeElement).toBe(screen.getByLabelText(/^Nombre/));
  });

  it('muestra el botón Cancelar solo cuando se puede cancelar', () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    cleanup();
    renderForm();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
  });
});