// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import PhotoImage from './PhotoImage';

afterEach(cleanup);

const props = { url: 'https://x.co/a.jpg', label: 'Foto 1', alt: 'Foto 1 de Luna' };

describe('PhotoImage', () => {
  it('muestra la imagen con su texto alternativo', () => {
    render(<PhotoImage {...props} />);
    expect(screen.getByAltText('Foto 1 de Luna').getAttribute('src')).toBe('https://x.co/a.jpg');
  });

  it('muestra el recuadro cuando la imagen no carga', () => {
    render(<PhotoImage {...props} />);
    fireEvent.error(screen.getByAltText('Foto 1 de Luna'));
    expect(screen.queryByAltText('Foto 1 de Luna')).toBeNull();
    expect(screen.getByText('Foto 1')).toBeTruthy();
  });

  it('muestra el recuadro cuando no hay URL', () => {
    render(<PhotoImage {...props} url="" />);
    expect(screen.getByText('Foto 1')).toBeTruthy();
  });

  it('aplica el tamaño grande', () => {
    const { container } = render(<PhotoImage {...props} large />);
    expect(container.querySelector('img').className).toContain('photo-large');
  });
});