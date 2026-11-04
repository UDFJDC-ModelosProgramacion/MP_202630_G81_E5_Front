// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ReviewSummary from './ReviewSummary';

afterEach(cleanup);

describe('ReviewSummary', () => {
  it('muestra el promedio y el total de reseñas publicadas', () => {
    render(<ReviewSummary reviews={[{ rating: 5 }, { rating: 4 }, { rating: 4 }]} />);
    expect(screen.getByText('4,3')).toBeTruthy();
    expect(screen.getByText('Basado en 3 reseñas publicadas')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Promedio: 4,3 de 5' })).toBeTruthy();
  });

  it('avisa cuando todavía no hay reseñas', () => {
    render(<ReviewSummary reviews={[]} />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Aún no hay reseñas publicadas')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Sin calificaciones' })).toBeTruthy();
  });
});
