// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdopterForm from './AdopterForm';
import { EMPTY_ADOPTER_FORM } from '../services/adopterMapper';

afterEach(cleanup);

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

function renderForm(props = {}) {
const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
render(
    <MemoryRouter>
    <AdopterForm
        initialValues={EMPTY_ADOPTER_FORM}
        submitLabel="Registrar adoptante"
        cancelTo="/adoptantes"
        onSubmit={onSubmit}
        {...props}
    />
    </MemoryRouter>,
);
return onSubmit;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar adoptante' }));

describe('AdopterForm', () => {
it('envía los valores cuando nombre y correo son válidos', async () => {
    const onSubmit = renderForm();
    type('Nombre', 'Laura Gómez');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Laura Gómez', email: 'laura@correo.com', phone: '' });
});

it('el teléfono es opcional y se envía cuando se escribe', async () => {
    const onSubmit = renderForm();
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    type(/Teléfono/, '300 123 4567');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].phone).toBe('300 123 4567');
});

it('rechaza un nombre vacío y pone el foco en el campo', () => {
    const onSubmit = renderForm();
    type('Correo electrónico', 'laura@correo.com');
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre'));
    expect(onSubmit).not.toHaveBeenCalled();
});

it('rechaza un correo vacío', () => {
    const onSubmit = renderForm();
    type('Nombre', 'Laura');
    submit();
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
});

it('muestra los dos errores cuando ambos campos están vacíos', () => {
    renderForm();
    submit();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeTruthy();
});

it('quita el error del campo al corregirlo', () => {
    renderForm();
    submit();
    type('Nombre', 'Laura');
    expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeTruthy();
});

it('muestra el correo repetido bajo el campo de correo', async () => {
    const onSubmit = vi

    .fn()
    .mockRejectedValue(apiError(412, 'There is already an adopter registered with that email'));
    renderForm({ onSubmit });
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    expect(await screen.findByText('Ya existe un adoptante con este correo electrónico.')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('button', { name: 'Registrar adoptante' }).disabled).toBe(false);
});

it('muestra otros errores del servidor en un aviso y vuelve a habilitar el botón', async () => {
    const onSubmit = vi.fn().mockRejectedValue(apiError(412, 'Adopter data is not valid'));
    renderForm({ onSubmit });
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    expect((await screen.findByRole('alert')).textContent).toBe('Adopter data is not valid');
    expect(screen.getByRole('button', { name: 'Registrar adoptante' }).disabled).toBe(false);
});

it('muestra el error de conexión', async () => {
    renderForm({ onSubmit: vi.fn().mockRejectedValue({ request: {} }) });
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
});

it('deshabilita el botón con "Guardando..." mientras envía', async () => {
    let finish;
    const onSubmit = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    renderForm({ onSubmit });
    type('Nombre', 'Laura');
    type('Correo electrónico', 'laura@correo.com');
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
    finish();
});

it('carga los valores iniciales y enlaza Cancelar', () => {
    renderForm({
    initialValues: { name: 'Laura', email: 'laura@correo.com', phone: '300' },
    cancelTo: '/adoptantes/1',
    });
    expect(screen.getByLabelText('Nombre').value).toBe('Laura');
    expect(screen.getByLabelText(/Teléfono/).value).toBe('300');
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/adoptantes/1');
});
});
