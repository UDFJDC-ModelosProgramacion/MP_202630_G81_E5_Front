// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import LifeEventTypeBadge from './LifeEventTypeBadge';

afterEach(cleanup);

describe('LifeEventTypeBadge', () => {
  it.each([
    ['Vacunación', 'vaccination'],
    ['Control', 'checkup'],
    ['Cirugía', 'surgery'],
    ['Adopción', 'other'],
  ])('muestra %s con la variante %s', (type, variant) => {
    render(<LifeEventTypeBadge type={type} />);
    expect(screen.getByText(type).className).toContain(`life-event-badge--${variant}`);
  });
});