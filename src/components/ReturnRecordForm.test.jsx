// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReturnRecordForm from './ReturnRecordForm';

afterEach(cleanup);

const initialValues = { date: '2026-10-05', reason: '' };

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <ReturnRecordForm
      initialValues={initialValues}
      submitLabel="Registrar devolución"
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return onSubmit;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar devolución' }));
const apiError = (status, message) =>
  vi.fn().mockRejectedValue({ response: { status, data: { apierror: { message } } } });

describe('ReturnRecordForm', () => {
  it('empieza con la fecha dada y el motivo vacío', () => {
    renderForm();
    expect(screen.getByLabelText('Fecha de devolución').value).toBe('2026-10-05');
    expect(screen.getByLabelText('Motivo').value).toBe('');
    expect(screen.getByPlaceholderText('Cuéntanos por qué se devuelve la mascota')).toBeTruthy();
  });

  it('muestra la ayuda y la acción de cancelar cuando se indican', () => {
    renderForm({ hint: 'Ayuda de prueba', cancel: <button type="button">Cancelar</button> });
    expect(screen.getByText('Ayuda de prueba')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
  });

  it('no muestra ayuda cuando no se indica', () => {
    renderForm();
    expect(document.querySelector('.return-form__hint')).toBeNull();
  });

  it('envía la fecha y el motivo cuando son válidos', async () => {
    const onSubmit = renderForm();
    type('Motivo', 'Cambió de ciudad');
    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ date: '2026-10-05', reason: 'Cambió de ciudad' }),
    );
  });

  it('rechaza el envío sin motivo y enfoca el campo', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('El motivo es obligatorio.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Motivo'));
    expect(screen.getByLabelText('Motivo').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza el envío sin fecha y enfoca primero la fecha', () => {
    const onSubmit = renderForm();
    type('Fecha de devolución', '');
    submit();
    expect(screen.getByText('La fecha de devolución es obligatoria.')).toBeTruthy();
    expect(screen.getByText('El motivo es obligatorio.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Fecha de devolución'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error de un campo al corregirlo', () => {
    renderForm();
    submit();
    type('Motivo', 'Ya escribí algo');
    expect(screen.queryByText('El motivo es obligatorio.')).toBeNull();
  });

  it('rechaza un motivo demasiado largo', () => {
    const onSubmit = renderForm();
    type('Motivo', 'a'.repeat(256));
    submit();
    expect(screen.getByText('El motivo no puede superar los 255 caracteres.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra el rechazo del servidor y deja volver a intentar', async () => {
    renderForm({ onSubmit: apiError(412, 'Return record data is not valid') });
    type('Motivo', 'Cambió de ciudad');
    submit();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Los datos de la devolución no son válidos.',
    );
    expect(screen.getByRole('button', { name: 'Registrar devolución' }).disabled).toBe(false);
  });

  it('deshabilita el botón mientras guarda', async () => {
    let finish;
    renderForm({ onSubmit: vi.fn(() => new Promise((resolve) => { finish = resolve; })) });
    type('Motivo', 'Cambió de ciudad');
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
    finish();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Registrar devolución' }).disabled).toBe(false),
    );
  });
});
