// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import MessageForm from './MessageForm';
import { EMPTY_MESSAGE_FORM } from '../services/messageMapper';

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MessageForm
      initialValues={EMPTY_MESSAGE_FORM}
      submitLabel="Enviar mensaje"
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return onSubmit;
}

const content = (value) =>
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
const apiError = (status, message) =>
  vi.fn().mockRejectedValue({ response: { status, data: { apierror: { message } } } });

describe('MessageForm', () => {
  it('envía el contenido escrito', async () => {
    const onSubmit = renderForm();
    content('Hola, quiero adoptar');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ content: 'Hola, quiero adoptar' }));
  });

  it('rechaza el envío vacío y enfoca el campo', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('El mensaje es obligatorio.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Mensaje'));
    expect(screen.getByLabelText('Mensaje').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error al escribir', () => {
    renderForm();
    submit();
    content('Hola');
    expect(screen.queryByText('El mensaje es obligatorio.')).toBeNull();
  });

  it('rechaza un mensaje demasiado largo', () => {
    const onSubmit = renderForm();
    content('a'.repeat(256));
    submit();
    expect(screen.getByText('El mensaje no puede superar los 255 caracteres.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor y conserva el contenido', async () => {
    renderForm({
      onSubmit: apiError(412, 'The message was already sent and cannot be edited'),
    });
    content('Hola');
    submit();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'No se puede editar un mensaje que ya fue enviado.',
    );
    expect(screen.getByLabelText('Mensaje').value).toBe('Hola');
    expect(screen.getByRole('button', { name: 'Enviar mensaje' }).disabled).toBe(false);
  });

  it('deshabilita el botón mientras guarda', async () => {
    let finish;
    renderForm({ onSubmit: vi.fn(() => new Promise((resolve) => { finish = resolve; })) });
    content('Hola');
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
    finish();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Enviar mensaje' }).disabled).toBe(false),
    );
  });

  it('no ofrece cancelar si no se pasa la acción', () => {
    renderForm();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
  });

  it('ofrece cancelar cuando se pasa la acción', () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('carga el contenido inicial y lleva el foco al campo al editar', () => {
    renderForm({ initialValues: { content: 'Mensaje anterior' }, focusOnMount: true });
    expect(screen.getByLabelText('Mensaje').value).toBe('Mensaje anterior');
    expect(document.activeElement).toBe(screen.getByLabelText('Mensaje'));
  });
});