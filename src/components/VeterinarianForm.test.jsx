// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VeterinarianForm from './VeterinarianForm';
import { EMPTY_VETERINARIAN_FORM } from '../services/veterinarianMapper';

const shelters = [{ id: 1, name: 'Refugio Adopciones' }];

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MemoryRouter>
      <VeterinarianForm
        initialValues={EMPTY_VETERINARIAN_FORM}
        shelters={shelters}
        submitLabel="Registrar veterinario"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return onSubmit;
}

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Registrar veterinario' }));

function fillValid() {
  type('Nombre', 'Laura Martínez');
  type('Correo', 'laura@refugio.org');
  type('Especialidad', 'Medicina interna');
}

describe('VeterinarianForm', () => {
  it('envía los valores cuando los datos obligatorios son válidos', async () => {
    const onSubmit = renderForm();
    fillValid();
    type(/^Refugio/, '1');
    type(/Teléfono/, '3105551234');
    type(/Disponibilidad/, 'Lun–Vie');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      shelterId: '1',
      name: 'Laura Martínez',
      email: 'laura@refugio.org',
      phone: '3105551234',
      specialty: 'Medicina interna',
      availability: 'Lun–Vie',
    });
  });

  it('permite enviar sin refugio, teléfono ni disponibilidad', async () => {
    const onSubmit = renderForm();
    fillValid();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].shelterId).toBe('');
  });

  it('rechaza un nombre vacío', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Nombre', '  ');
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza un correo vacío', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Correo', '');
    submit();
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una especialidad vacía', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Especialidad', '');
    submit();
    expect(screen.getByText('La especialidad es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra todos los errores y enfoca el primer campo inválido', () => {
    renderForm();
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La especialidad es obligatoria.')).toBeTruthy();
    expect(document.activeElement.id).toBe('name');
    expect(screen.getByLabelText('Nombre').getAttribute('aria-invalid')).toBe('true');
  });

  it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    type('Nombre', 'Laura');
    expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
  });

  it('muestra el error del servidor y vuelve a habilitar el botón', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } },
    });
    renderForm({ onSubmit });
    fillValid();
    submit();
    expect(await screen.findByText('Shelter is not valid')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar veterinario' }).disabled).toBe(false);
  });

  it('deshabilita el botón y muestra "Guardando..." mientras envía', async () => {
    renderForm({ onSubmit: vi.fn().mockReturnValue(new Promise(() => {})) });
    fillValid();
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('bloquea el refugio cuando shelterLocked es true', () => {
    renderForm({
      shelterLocked: true,
      initialValues: { ...EMPTY_VETERINARIAN_FORM, shelterId: '1' },
    });
    expect(screen.getByLabelText(/^Refugio/).disabled).toBe(true);
  });

  it('enlaza Cancelar al listado', () => {
    renderForm();
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe(
      '/veterinarios',
    );
  });
});