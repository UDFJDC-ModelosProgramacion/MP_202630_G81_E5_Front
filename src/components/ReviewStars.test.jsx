// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ReviewStars from './ReviewStars';

afterEach(cleanup);

const filledCount = () => document.querySelectorAll('.review-stars__star--filled').length;

describe('ReviewStars', () => {
  it('pinta las estrellas de la calificación y describe el valor', () => {
    render(<ReviewStars rating={4} />);
    expect(screen.getByRole('img', { name: 'Calificación: 4 de 5' })).toBeTruthy();
    expect(document.querySelectorAll('.review-stars__star')).toHaveLength(5);
    expect(filledCount()).toBe(4);
  });

  it('redondea promedios con decimales', () => {
    render(<ReviewStars rating={4.33} label="Promedio: 4,3 de 5" />);
    expect(screen.getByRole('img', { name: 'Promedio: 4,3 de 5' })).toBeTruthy();
    expect(filledCount()).toBe(4);
  });

  it('no pinta estrellas cuando no hay calificación', () => {
    render(<ReviewStars rating={null} label="Sin calificaciones" />);
    expect(filledCount()).toBe(0);
  });
});
