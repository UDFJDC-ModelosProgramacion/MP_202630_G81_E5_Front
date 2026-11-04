import { describe, expect, it } from 'vitest';
import { validatePhoto } from './photoValidation';

describe('validatePhoto', () => {
  it('acepta una foto con destino y URL', () => {
    expect(validatePhoto({ target: 'pets:1', url: 'https://x.co/a.jpg' })).toEqual({});
  });

  it('rechaza una URL vacía', () => {
    expect(validatePhoto({ target: 'pets:1', url: '' }).url).toBe('La URL es obligatoria.');
  });

  it('rechaza una URL con solo espacios', () => {
    expect(validatePhoto({ target: 'pets:1', url: '   ' }).url).toBe('La URL es obligatoria.');
  });

  it('rechaza una URL nula', () => {
    expect(validatePhoto({ target: 'pets:1', url: null }).url).toBe('La URL es obligatoria.');
  });

  it('rechaza una foto sin destino', () => {
    expect(validatePhoto({ target: '', url: 'https://x.co/a.jpg' }).target).toBe(
      'La foto debe asociarse a una mascota o a un refugio.',
    );
  });

  it('reporta ambos errores, destino primero', () => {
    expect(Object.keys(validatePhoto({ target: '', url: '' }))).toEqual(['target', 'url']);
  });
});