// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdoptionForm from './AdoptionForm';
import { EMPTY_ADOPTION_FORM } from '../services/adoptionMapper';

const pets = [
  { id: 1, name: 'Nube', species: 'Gato', breed: 'Criollo', available: true },
  { id: 2, name: 'Luna', species: 'Perro', breed: 'Labrador', available: false },
];
const adopters = [{ id: 1, name: 'Laura Gómez' }];
const veterinarians = [{ id: 1, name: 'Dr. Andrés Ríos' }];

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MemoryRouter>
      <AdoptionForm
        initialValues={EMPTY_ADOPTION_FORM}
        pets={pets}
        adopters={adopters}
        veterinarians={veterinarians}
        submitLabel="Registrar adopción"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return onSubmit;
}

const choose = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar adopción' }));

function fillValid() {
  choose('Mascota', '1');
  choose('Adoptante', '1');
  choose('Veterinario responsable', '1');
  choose('Fecha de adopción', '2026-09-20');
}

const apiError = (status, message) =>
  vi.fn().mockRejectedValue({ response: { status, data: { apierror: { message } } } });

describe('AdoptionForm', () => {
  it('muestra las mascotas con su especie y raza', () => {
    renderForm();
    expect(screen.getByRole('option', { name: 'Nube · Gato · Criollo' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Luna · Perro · Labrador' })).toBeTruthy();
  });

  it('empieza con el estado "En curso" y explica el valor por defecto', () => {
    renderForm();
    expect(screen.getByLabelText(/^Estado/).value).toBe('IN_PROGRESS');
    expect(screen.getByText('Si no eliges un estado, se guarda como «En curso».')).toBeTruthy();
  });

  it('envía los valores cuando el formulario es válido', async () => {
    const onSubmit = renderForm();
    fillValid();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      petId: '1',
      adopterId: '1',
      veterinarianId: '1',
      date: '2026-09-20',
      status: 'IN_PROGRESS',
    });
  });

  it('rechaza cuando no se elige mascota', () => {
    const onSubmit = renderForm();
    fillValid();
    choose('Mascota', '');
    submit();
    expect(screen.getByText('Selecciona una mascota.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza cuando no se elige adoptante', () => {
    const onSubmit = renderForm();
    fillValid();
    choose('Adoptante', '');
    submit();
    expect(screen.getByText('Selecciona un adoptante.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza cuando no se elige veterinario', () => {
    const onSubmit = renderForm();
    fillValid();
    choose('Veterinario responsable', '');
    submit();
    expect(screen.getByText('Selecciona un veterinario responsable.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza cuando falta la fecha', () => {
    const onSubmit = renderForm();
    fillValid();
    choose('Fecha de adopción', '');
    submit();
    expect(screen.getByText('La fecha de adopción es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza una mascota que ya no está disponible', () => {
    const onSubmit = renderForm();
    fillValid();
    choose('Mascota', '2');
    submit();
    expect(
      screen.getByText('Esta mascota ya no está disponible para adopción. Elige otra.'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Mascota').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza un estado que no existe', () => {
    const onSubmit = renderForm({ initialValues: { ...EMPTY_ADOPTION_FORM, status: 'CANCELLED' } });
    fillValid();
    submit();
    expect(screen.getByText('El estado no es válido.')).toBeTruthy();
    expect(screen.getByLabelText(/^Estado/).getAttribute('aria-describedby')).toBe('status-error');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('lleva el foco al primer campo inválido', () => {
    renderForm();
    submit();
    expect(document.activeElement.id).toBe('petId');
  });

  it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    expect(screen.getByText('Selecciona una mascota.')).toBeTruthy();
    choose('Mascota', '1');
    expect(screen.queryByText('Selecciona una mascota.')).toBeNull();
  });

  it('muestra el error del campo mascota cuando el back dice que no está disponible', async () => {
    const onSubmit = apiError(412, 'The pet is not available for adoption');
    renderForm({ onSubmit });
    fillValid();
    submit();
    expect(
      await screen.findByText('Esta mascota ya no está disponible para adopción. Elige otra.'),
    ).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Registrar adopción' }).disabled).toBe(false);
  });

  it('informa cuando el adoptante o el veterinario no se encuentran (404)', async () => {
    const onSubmit = apiError(404, 'The adopter with the given id was not found');
    renderForm({ onSubmit });
    fillValid();
    submit();
    expect(await screen.findByText('El adoptante seleccionado no fue encontrado.')).toBeTruthy();
  });

  it('muestra el mensaje del servidor y vuelve a habilitar el botón', async () => {
    const onSubmit = apiError(412, 'Adoption data is not valid');
    renderForm({ onSubmit });
    fillValid();
    submit();
    expect(await screen.findByText('Adoption data is not valid')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar adopción' }).disabled).toBe(false);
  });

  it('deshabilita el botón y muestra "Guardando..." mientras envía', async () => {
    const onSubmit = vi.fn(() => new Promise(() => {}));
    renderForm({ onSubmit });
    fillValid();
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('permite cancelar y volver al listado', () => {
    renderForm();
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/adopciones');
  });
});
