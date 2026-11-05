// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ReturnRecordDetails from './ReturnRecordDetails';

afterEach(cleanup);

describe('ReturnRecordDetails', () => {
  it('muestra la fecha y el motivo registrados', () => {
    render(
      <ReturnRecordDetails
        returnRecord={{
          id: 1,
          date: '2026-10-05T00:00:00.000+00:00',
          reason: 'El adoptante cambió de ciudad.',
        }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Devolución registrada' })).toBeTruthy();
    expect(screen.getByText('05 oct 2026')).toBeTruthy();
    expect(screen.getByText('El adoptante cambió de ciudad.')).toBeTruthy();
  });

  it('muestra guiones si faltan la fecha o el motivo', () => {
    render(<ReturnRecordDetails returnRecord={{ id: 1, date: null, reason: '' }} />);
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
