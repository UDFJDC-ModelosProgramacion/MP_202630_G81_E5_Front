// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ReviewRatingInput from './ReviewRatingInput';

afterEach(cleanup);

describe('ReviewRatingInput', () => {
  it('ofrece cinco opciones de estrellas bajo el grupo "Calificación"', () => {
    render(<ReviewRatingInput value={0} onChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Calificación' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: '1 estrella' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '5 estrellas' })).toBeTruthy();
  });

  it('avisa la calificación elegida y la explica en la ayuda', () => {
    render(<ReviewRatingInput value={4} onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: '4 estrellas' }).checked).toBe(true);
    expect(screen.getByRole('radio', { name: '5 estrellas' }).checked).toBe(false);
    expect(
      screen.getByText('Elige de 1 (muy mala) a 5 (excelente). Seleccionada: 4 de 5.'),
    ).toBeTruthy();
    expect(document.querySelectorAll('.review-rating__star--filled')).toHaveLength(4);
  });

  it('avisa cuando el usuario elige una calificación', () => {
    const onChange = vi.fn();
    render(<ReviewRatingInput value={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '3 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('muestra el error y lo asocia al grupo', () => {
    render(<ReviewRatingInput value={0} error="Elige una calificación de 1 a 5." onChange={vi.fn()} />);
    expect(screen.getByText('Elige una calificación de 1 a 5.')).toBeTruthy();
    expect(screen.getByRole('group').getAttribute('aria-describedby')).toContain('rating-error');
    expect(screen.getByRole('radio', { name: '1 estrella' }).getAttribute('aria-invalid')).toBe('true');
  });
});
