// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetForm from './PetForm';
import { EMPTY_PET_FORM } from '../services/petMapper';

const shelters = [{ id: 1, name: 'Refugio Adopciones' }];

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MemoryRouter>
      <PetForm
        initialValues={EMPTY_PET_FORM}
        shelters={shelters}
        submitLabel="Registrar mascota"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return onSubmit;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar mascota' }));

function fillValid() {
  type('Refugio', '1');
  type('Nombre', ' Luna ');
  type('Especie', 'Perro');
  type(/Edad/, '0');
}

describe('PetForm', () => {
  it('envía los valores cuando el formulario es válido (edad 0 incluida)', async () => {
    const onSubmit = renderForm();
    fillValid();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      shelterId: '1', name: ' Luna ', species: 'Perro', breed: '', age: '0',
    });
  });

  it('rechaza un nombre vacío y muestra el error', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Nombre', '');
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una especie vacía', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Especie', '');
    submit();
    expect(screen.getByText('La especie es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una edad negativa', () => {
    const onSubmit = renderForm();
    fillValid();
    type(/Edad/, '-1');
    submit();
    expect(screen.getByText('La edad no puede ser negativa. Usa 0 o más.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza cuando no se selecciona refugio', () => {
    const onSubmit = renderForm();
    fillValid();
    type('Refugio', '');
    submit();
    expect(screen.getByText('Selecciona un refugio.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    type('Nombre', 'Luna');
    expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
  });

  it('muestra el error del servidor y vuelve a habilitar el botón', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Shelter is not valid' } } },
    });
    renderForm({ onSubmit });
    fillValid();
    submit();
    expect(await screen.findByText('Shelter is not valid')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar mascota' }).disabled).toBe(false);
  });

  it('bloquea el refugio cuando shelterLocked es true', () => {
    renderForm({ shelterLocked: true, initialValues: { ...EMPTY_PET_FORM, shelterId: '1' } });
    expect(screen.getByLabelText('Refugio').disabled).toBe(true);
  });
});