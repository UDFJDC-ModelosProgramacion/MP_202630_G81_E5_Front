// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrialCohabitationForm from './TrialCohabitationForm';

const initialValues = { startDate: '2026-11-01', endDate: '' };

const renderForm = (onSubmit = vi.fn(), values = initialValues) =>
    render(
        <MemoryRouter>
        <TrialCohabitationForm
            adoptionId="5"
            initialValues={values}
            title="Registrar convivencia de prueba"
            submitLabel="Registrar convivencia"
            onSubmit={onSubmit}
        />
        </MemoryRouter>,
    );

    const startField = () => screen.getByLabelText('Fecha de inicio');
    const endField = () => screen.getByLabelText(/Fecha de fin/);
    const clickSubmit = () =>
    fireEvent.click(screen.getByRole('button', { name: 'Registrar convivencia' }));

    beforeEach(() => {
    vi.clearAllMocks();
    });

    afterEach(() => {
    cleanup();
    });

    describe('TrialCohabitationForm', () => {
    it('muestra el título, las fechas y el botón de registro', () => {
        renderForm();
        expect(screen.getByRole('heading', { name: 'Registrar convivencia de prueba' })).toBeTruthy();
        expect(startField().value).toBe('2026-11-01');
        expect(endField().value).toBe('');
        expect(screen.getByText('(opcional)')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Registrar convivencia' })).toBeTruthy();
    });

    it('envía los datos cuando las fechas son válidas', async () => {
        const onSubmit = vi.fn().mockResolvedValue({});
        renderForm(onSubmit);
        fireEvent.change(endField(), { target: { value: '2026-11-15' } });
        clickSubmit();
        await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ startDate: '2026-11-01', endDate: '2026-11-15' });
        });
    });

    it('permite registrar sin fecha de fin', async () => {
        const onSubmit = vi.fn().mockResolvedValue({});
        renderForm(onSubmit);
        clickSubmit();
        await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ startDate: '2026-11-01', endDate: '' });
        });
    });

    it('rechaza la operación cuando falta la fecha de inicio y enfoca el campo', () => {
        const onSubmit = vi.fn();
        renderForm(onSubmit);
        fireEvent.change(startField(), { target: { value: '' } });
        clickSubmit();
        expect(screen.getByText('La fecha de inicio es obligatoria.')).toBeTruthy();
        expect(startField().getAttribute('aria-invalid')).toBe('true');
        expect(document.activeElement).toBe(startField());
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it.each([
        ['anterior', '2026-10-30'],
        ['igual', '2026-11-01'],
    ])('rechaza la operación cuando la fecha de fin es %s a la de inicio', (_case, endDate) => {
        const onSubmit = vi.fn();
        renderForm(onSubmit);
        fireEvent.change(endField(), { target: { value: endDate } });
        clickSubmit();
        expect(
        screen.getByText('La fecha de fin debe ser posterior a la fecha de inicio.'),
        ).toBeTruthy();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('quita el error de un campo cuando se corrige', () => {
        renderForm();
        fireEvent.change(endField(), { target: { value: '2026-10-30' } });
        clickSubmit();
        fireEvent.change(endField(), { target: { value: '2026-11-20' } });
        expect(screen.queryByText('La fecha de fin debe ser posterior a la fecha de inicio.')).toBeNull();
    });

    it('muestra el error del servidor cuando ya existe una convivencia (412)', async () => {
        const onSubmit = vi.fn().mockRejectedValue({
        response: {
            status: 412,
            data: { apierror: { message: 'The adoption already has an associated trial cohabitation' } },
        },
        });
        renderForm(onSubmit);
        clickSubmit();
        expect((await screen.findByRole('alert')).textContent).toBe(
        'Esta adopción ya tiene una convivencia de prueba registrada.',
        );
    });

    it('muestra el error de conexión', async () => {
        renderForm(vi.fn().mockRejectedValue({ request: {} }));
        clickSubmit();
        expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    });

    it('deshabilita el botón y muestra "Guardando..." mientras guarda', async () => {
        let resolveSubmit;
        const onSubmit = vi.fn(
        () =>
            new Promise((resolve) => {
            resolveSubmit = resolve;
            }),
        );
        renderForm(onSubmit);
        clickSubmit();
        const savingButton = await screen.findByRole('button', { name: 'Guardando...' });
        expect(savingButton.disabled).toBe(true);
        resolveSubmit({});
        await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Registrar convivencia' }).disabled).toBe(false);
        });
    });

    it('permite cancelar y volver al detalle de la adopción', () => {
        renderForm();
        expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/adopciones/5');
    });
});