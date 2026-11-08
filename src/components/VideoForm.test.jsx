// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import VideoForm from './VideoForm';
import { EMPTY_VIDEO_FORM } from '../services/videoMapper';

afterEach(cleanup);

const options = [
  { value: '7', label: 'Huellitas' },
  { value: '8', label: 'Patitas' },
];

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <VideoForm
      initialValues={EMPTY_VIDEO_FORM}
      submitLabel="Cargar video"
      shelterId="7"
      shelterOptions={options}
      shelterLocked={false}
      onShelterChange={vi.fn()}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return onSubmit;
}

const typeUrl = (value) =>
  fireEvent.change(screen.getByLabelText(/^URL del video/), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Cargar video' }));
const apiError = (status, message) =>
  vi.fn().mockRejectedValue({ response: { status, data: { apierror: { message } } } });

describe('VideoForm', () => {
  it('muestra el refugio seleccionado y sus opciones', () => {
    renderForm();
    expect(screen.getByLabelText('Refugio').value).toBe('7');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('bloquea el select cuando se está editando', () => {
    renderForm({ shelterLocked: true });
    expect(screen.getByLabelText('Refugio').disabled).toBe(true);
  });

  it('avisa el cambio de refugio', () => {
    const onShelterChange = vi.fn();
    renderForm({ onShelterChange });
    fireEvent.change(screen.getByLabelText('Refugio'), { target: { value: '8' } });
    expect(onShelterChange).toHaveBeenCalledWith('8');
  });

  it('rechaza la URL vacía y enfoca el campo', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^URL del video/));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una URL de solo espacios', () => {
    const onSubmit = renderForm();
    typeUrl('   ');
    submit();
    expect(screen.getByText('La URL es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error al escribir en el campo', () => {
    renderForm();
    submit();
    typeUrl('https://v.co/a.mp4');
    expect(screen.queryByText('La URL es obligatoria.')).toBeNull();
  });

  it('envía los valores cuando el formulario es válido', async () => {
    const onSubmit = renderForm();
    typeUrl('https://v.co/a.mp4');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ url: 'https://v.co/a.mp4' }));
  });

  it('deshabilita el botón mientras se envía', async () => {
    renderForm({ onSubmit: vi.fn(() => new Promise(() => {})) });
    typeUrl('https://v.co/a.mp4');
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('muestra el mensaje del back y conserva lo escrito', async () => {
    renderForm({ onSubmit: apiError(412, 'Video url is not valid') });
    typeUrl('https://v.co/a.mp4');
    submit();
    expect(await screen.findByText('La URL del video no es válida.')).toBeTruthy();
    expect(screen.getByLabelText(/^URL del video/).value).toBe('https://v.co/a.mp4');
  });

  it('lleva el foco a la URL cuando se empieza a editar', () => {
    renderForm({ focusOnMount: true });
    expect(document.activeElement).toBe(screen.getByLabelText(/^URL del video/));
  });

  it('muestra Cancelar solo cuando se puede cancelar', () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    cleanup();
    renderForm();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
  });
});