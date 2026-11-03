// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShelterForm from './ShelterForm';
import { EMPTY_SHELTER_FORM } from '../services/shelterMapper';

const shelters = [{ id: 1, name: 'Huellitas', city: 'Bogotá' }];

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MemoryRouter>
      <ShelterForm
        initialValues={EMPTY_SHELTER_FORM}
        shelters={shelters}
        submitLabel="Registrar refugio"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return onSubmit;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));

describe('ShelterForm', () => {
  it('envía los valores cuando el formulario es válido', async () => {
    const onSubmit = renderForm();
    type('Nombre', 'Patitas');
    type('Ciudad', 'Cali');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Patitas', city: 'Cali' });
  });

  it('rechaza un nombre vacío', () => {
    const onSubmit = renderForm();
    type('Ciudad', 'Cali');
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una ciudad vacía', () => {
    const onSubmit = renderForm();
    type('Nombre', 'Patitas');
    submit();
    expect(screen.getByText('La ciudad es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza un refugio con el mismo nombre en la misma ciudad', () => {
    const onSubmit = renderForm();
    type('Nombre', 'huellitas');
    type('Ciudad', 'Bogotá');
    submit();
    expect(screen.getByText('Ya existe un refugio con este nombre en esta ciudad.')).toBeTruthy();
    expect(screen.getByLabelText('Nombre').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Ciudad').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('acepta el mismo nombre en otra ciudad', async () => {
    const onSubmit = renderForm();
    type('Nombre', 'Huellitas');
    type('Ciudad', 'Cali');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('permite conservar el propio nombre y ciudad al editar', async () => {
    const onSubmit = renderForm({
      initialValues: { name: 'Huellitas', city: 'Bogotá' },
      ignoreId: 1,
      submitLabel: 'Guardar cambios',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    type('Nombre', 'Patitas');
    expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
  });

  it('muestra el error del servidor y vuelve a habilitar el botón', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } },
    });
    renderForm({ onSubmit });
    type('Nombre', 'Patitas');
    type('Ciudad', 'Cali');
    submit();
    expect(await screen.findByText('Shelter is not valid')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar refugio' }).disabled).toBe(false);
  });
});