// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdoptionStatusForm from './AdoptionStatusForm';

afterEach(cleanup);

const renderForm = (props = {}) => {
  const onSave = props.onSave ?? vi.fn().mockResolvedValue();
  render(<AdoptionStatusForm currentStatus="IN_PROGRESS" onSave={onSave} {...props} />);
  return onSave;
};

const choose = (value) =>
  fireEvent.change(screen.getByLabelText('Cambiar estado'), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar estado' }));

describe('AdoptionStatusForm', () => {
  it('muestra el estado actual y deshabilita el botón mientras no cambie', () => {
    renderForm();
    expect(screen.getByLabelText('Cambiar estado').value).toBe('IN_PROGRESS');
    expect(screen.getByRole('button', { name: 'Guardar estado' }).disabled).toBe(true);
  });

  it('ofrece solo los tres estados válidos', () => {
    renderForm();
    const labels = screen.getAllByRole('option').map((option) => option.textContent);
    expect(labels).toEqual(['En curso', 'Aprobada', 'Devuelta']);
  });

  it('guarda un estado válido y confirma el cambio', async () => {
    const onSave = renderForm();
    choose('APPROVED');
    save();
    expect(await screen.findByText('Estado actualizado a «Aprobada».')).toBeTruthy();
    expect(onSave).toHaveBeenCalledWith('APPROVED');
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('deshabilita el botón y muestra "Guardando..." mientras envía', async () => {
    renderForm({ onSave: vi.fn(() => new Promise(() => {})) });
    choose('RETURNED');
    save();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
  });

  it('rechaza un estado que no es válido y no llama al servicio', () => {
    const onSave = renderForm({ currentStatus: 'CANCELLED' });
    expect(screen.getByLabelText('Cambiar estado').value).toBe('');
    expect(screen.getByRole('option', { name: 'Selecciona un estado' })).toBeTruthy();
    save();
    expect(screen.getByText('El estado no es válido.')).toBeTruthy();
    expect(screen.getByLabelText('Cambiar estado').getAttribute('aria-invalid')).toBe('true');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('quita el error al elegir un estado válido', () => {
    renderForm({ currentStatus: 'CANCELLED' });
    save();
    expect(screen.getByText('El estado no es válido.')).toBeTruthy();
    choose('APPROVED');
    expect(screen.queryByText('El estado no es válido.')).toBeNull();
  });

  it('muestra el mensaje del back cuando rechaza el estado (412)', async () => {
    const onSave = vi.fn().mockRejectedValue({
      response: { status: 412, data: { apierror: { message: 'Adoption status is not valid' } } },
    });
    renderForm({ onSave });
    choose('APPROVED');
    save();
    expect(await screen.findByText('Adoption status is not valid')).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Guardar estado' }).disabled).toBe(false),
    );
  });

  it('informa cuando la adopción ya no existe (404)', async () => {
    const onSave = vi.fn().mockRejectedValue({ response: { status: 404, data: {} } });
    renderForm({ onSave });
    choose('APPROVED');
    save();
    expect(await screen.findByText('Adopción no encontrada.')).toBeTruthy();
  });

  it('muestra el error de conexión si falla el envío', async () => {
    renderForm({ onSave: vi.fn().mockRejectedValue({ request: {} }) });
    choose('RETURNED');
    save();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
  });
});
