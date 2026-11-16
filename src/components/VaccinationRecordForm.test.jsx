// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VaccinationRecordForm from './VaccinationRecordForm';
import { EMPTY_VACCINATION_RECORD_FORM } from '../services/vaccinationRecordMapper';

const pet = { id: 1, name: 'Michi', species: 'Gato' };

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <MemoryRouter>
      <VaccinationRecordForm
        pet={pet}
        initialValues={EMPTY_VACCINATION_RECORD_FORM}
        submitLabel="Guardar carnet"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return onSubmit;
}

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar carnet' }));
const precondition = (message) => ({
  response: { status: 412, data: { apierror: { message } } },
});

describe('VaccinationRecordForm', () => {
  it('envía las vacunas y la próxima fecha', async () => {
    const onSubmit = renderForm();
    type('Vacunas aplicadas', 'Rabia, Parvovirus');
    type(/Próxima fecha de vacunación/, '2027-08-01');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      vaccinesApplied: 'Rabia, Parvovirus',
      nextDueDate: '2027-08-01',
    });
  });

  it('permite enviar sin próxima fecha (es opcional)', async () => {
    const onSubmit = renderForm();
    type('Vacunas aplicadas', 'Rabia');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].nextDueDate).toBe('');
  });

  it('rechaza las vacunas vacías, muestra el error y enfoca el campo', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('Indica al menos una vacuna aplicada.')).toBeTruthy();
    expect(document.activeElement.id).toBe('vaccinesApplied');
    expect(screen.getByLabelText('Vacunas aplicadas').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza vacunas con solo espacios y comas', () => {
    const onSubmit = renderForm();
    type('Vacunas aplicadas', ' , , ');
    submit();
    expect(screen.getByText('Indica al menos una vacuna aplicada.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error al corregir el campo', () => {
    renderForm();
    submit();
    type('Vacunas aplicadas', 'Rabia');
    expect(screen.queryByText('Indica al menos una vacuna aplicada.')).toBeNull();
  });

  it('explica que la mascota ya tiene carnet y vuelve a habilitar el botón', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(precondition('The pet already has an associated vaccination record'));
    renderForm({ onSubmit });
    type('Vacunas aplicadas', 'Rabia');
    submit();
    expect(await screen.findByText('Esta mascota ya tiene un carnet de vacunación.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar carnet' }).disabled).toBe(false);
  });

  it('muestra el mensaje del back en otros rechazos', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(precondition('Vaccination record data is not valid'));
    renderForm({ onSubmit });
    type('Vacunas aplicadas', 'Rabia');
    submit();
    expect(await screen.findByText('Vaccination record data is not valid')).toBeTruthy();
  });

  it('deshabilita el botón y muestra "Guardando..." mientras envía', async () => {
    renderForm({ onSubmit: vi.fn().mockReturnValue(new Promise(() => {})) });
    type('Vacunas aplicadas', 'Rabia');
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('muestra la mascota bloqueada', () => {
    renderForm();
    const select = screen.getByLabelText('Mascota');
    expect(select.disabled).toBe(true);
    expect(select.value).toBe('1');
    expect(screen.getByRole('option', { name: 'Michi · Gato' })).toBeTruthy();
  });

  it('carga los valores iniciales al editar', () => {
    renderForm({
      initialValues: { vaccinesApplied: 'Rabia, Moquillo', nextDueDate: '2027-08-01' },
    });
    expect(screen.getByLabelText('Vacunas aplicadas').value).toBe('Rabia, Moquillo');
    expect(screen.getByLabelText(/Próxima fecha de vacunación/).value).toBe('2027-08-01');
  });

  it('enlaza Cancelar a la consulta del carnet', () => {
    renderForm();
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe(
      '/mascotas/1/carnet',
    );
  });
});