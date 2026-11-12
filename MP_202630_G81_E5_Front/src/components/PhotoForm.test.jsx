// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PhotoForm from './PhotoForm';

const targets = [
  { value: 'pets:1', label: 'Luna · Perro' },
  { value: 'shelters:2', label: 'Refugio Adopciones · Refugio' },
];
const emptyValues = { target: 'pets:1', url: '' };

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <PhotoForm initialValues={emptyValues} targets={targets} onSubmit={onSubmit} {...props} />,
  );
  return onSubmit;
}

const typeUrl = (value) =>
  fireEvent.change(screen.getByLabelText('URL de la foto'), { target: { value } });
const submit = (name = 'Agregar foto') => fireEvent.click(screen.getByRole('button', { name }));

describe('PhotoForm', () => {
  it('envía los valores cuando el formulario es válido', async () => {
    const onSubmit = renderForm();
    typeUrl('https://x.co/a.jpg');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ target: 'pets:1', url: 'https://x.co/a.jpg' });
  });

  it('rechaza una URL vacía y enfoca el campo', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('URL de la foto'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una URL con solo espacios', () => {
    const onSubmit = renderForm();
    typeUrl('   ');
    submit();
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una foto sin destino y enfoca el select', () => {
    const onSubmit = renderForm({ initialValues: { target: '', url: 'https://x.co/a.jpg' } });
    submit();
    expect(screen.getByText('La foto debe asociarse a una mascota o a un refugio.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Asociar a'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    typeUrl('https://x.co/a.jpg');
    expect(screen.queryByText('La URL es obligatoria.')).toBeNull();
  });

  it('muestra el error del servidor traducido y vuelve a habilitar el botón', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Photo url is not valid' } } },
    });
    renderForm({ onSubmit });
    typeUrl('https://x.co/a.jpg');
    submit();
    expect(await screen.findByText('La URL de la foto no es válida.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Agregar foto' }).disabled).toBe(false);
  });

  it('deshabilita el botón mientras envía', async () => {
    renderForm({ onSubmit: vi.fn(() => new Promise(() => {})) });
    typeUrl('https://x.co/a.jpg');
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('en modo crear no muestra Cancelar y permite elegir destino', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Agregar foto' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.getByLabelText('Asociar a').disabled).toBe(false);
  });

  it('en modo editar bloquea el destino y permite cancelar', () => {
    const onCancel = vi.fn();
    renderForm({
      isEditing: true,
      onCancel,
      initialValues: { target: 'pets:1', url: 'https://x.co/a.jpg' },
    });
    expect(screen.getByRole('heading', { name: 'Editar foto' })).toBeTruthy();
    expect(screen.getByLabelText('Asociar a').disabled).toBe(true);
    expect(screen.getByLabelText('URL de la foto').value).toBe('https://x.co/a.jpg');
    expect(document.activeElement).toBe(screen.getByLabelText('URL de la foto'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});