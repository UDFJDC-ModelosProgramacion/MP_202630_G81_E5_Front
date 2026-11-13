// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import VaccineChips from './VaccineChips';

afterEach(cleanup);

describe('VaccineChips', () => {
  it('muestra una etiqueta por cada vacuna', () => {
    render(<VaccineChips vaccines="Rabia, Parvovirus ,Moquillo" />);
    const items = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(items).toEqual(['Rabia', 'Parvovirus', 'Moquillo']);
    expect(screen.getByRole('list', { name: 'Vacunas aplicadas' })).toBeTruthy();
  });

  it('no repite vacunas duplicadas', () => {
    render(<VaccineChips vaccines="Rabia, Rabia" />);
    expect(screen.getAllByRole('listitem').length).toBe(1);
  });

  it('no muestra etiquetas cuando no hay vacunas', () => {
    render(<VaccineChips vaccines="" />);
    expect(screen.queryAllByRole('listitem').length).toBe(0);
  });
});