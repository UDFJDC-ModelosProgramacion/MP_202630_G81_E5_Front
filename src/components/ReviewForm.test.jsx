// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReviewForm from './ReviewForm';
import { EMPTY_REVIEW_FORM } from '../services/reviewMapper';

afterEach(cleanup);

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue();
  render(
    <ReviewForm
      initialValues={EMPTY_REVIEW_FORM}
      submitLabel="Publicar reseña"
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return onSubmit;
}

const stars = (count) =>
  fireEvent.click(screen.getByRole('radio', { name: `${count} ${count === 1 ? 'estrella' : 'estrellas'}` }));
const comment = (value) =>
  fireEvent.change(screen.getByLabelText(/^Comentario/), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));
const apiError = (status, message) =>
  vi.fn().mockRejectedValue({ response: { status, data: { apierror: { message } } } });

describe('ReviewForm', () => {
  it('marca el comentario como opcional y explica la escala', () => {
    renderForm();
    expect(screen.getByText('(opcional)')).toBeTruthy();
    expect(screen.getByText('Elige de 1 (muy mala) a 5 (excelente).')).toBeTruthy();
  });

  it('envía la calificación sin comentario cuando el comentario es opcional', async () => {
    const onSubmit = renderForm();
    stars(4);
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ rating: 4, comment: '' }));
  });

  it('envía la calificación junto con el comentario', async () => {
    const onSubmit = renderForm();
    stars(5);
    comment('Todo salió muy bien');
    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ rating: 5, comment: 'Todo salió muy bien' }),
    );
  });

  it('rechaza el envío sin calificación y enfoca la primera estrella', () => {
    const onSubmit = renderForm();
    submit();
    expect(screen.getByText('Elige una calificación de 1 a 5.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '1 estrella' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('quita el error de la calificación al elegir una', () => {
    renderForm();
    submit();
    stars(2);
    expect(screen.queryByText('Elige una calificación de 1 a 5.')).toBeNull();
  });

  it('rechaza un comentario demasiado largo y enfoca el campo', () => {
    const onSubmit = renderForm();
    stars(3);
    comment('a'.repeat(256));
    submit();
    expect(screen.getByText('El comentario no puede superar los 255 caracteres.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Comentario/));
    expect(screen.getByLabelText(/^Comentario/).getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
    comment('corto');
    expect(screen.queryByText('El comentario no puede superar los 255 caracteres.')).toBeNull();
  });

  it('muestra el error del servidor cuando el adoptante no existe', async () => {
    renderForm({ onSubmit: apiError(404, 'The adopter with the given id was not found') });
    stars(4);
    submit();
    expect((await screen.findByRole('alert')).textContent).toContain('Adoptante no encontrado.');
    expect(screen.getByRole('button', { name: 'Publicar reseña' }).disabled).toBe(false);
  });

  it('deshabilita el botón mientras guarda', async () => {
    let finish;
    renderForm({ onSubmit: vi.fn(() => new Promise((resolve) => { finish = resolve; })) });
    stars(4);
    submit();
    const button = await screen.findByRole('button', { name: 'Guardando...' });
    expect(button.disabled).toBe(true);
    finish();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Publicar reseña' }).disabled).toBe(false),
    );
  });
});
