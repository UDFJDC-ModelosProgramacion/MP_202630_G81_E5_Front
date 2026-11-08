import { describe, expect, it } from 'vitest';
import { validateVideo } from './videoValidation';

describe('validateVideo', () => {
  it('acepta una URL no vacía', () => {
    expect(validateVideo({ url: 'https://v.co/a.mp4' })).toEqual({});
  });

  it.each([[''], ['   '], [undefined], [null]])('rechaza la URL %j', (url) => {
    expect(validateVideo({ url })).toEqual({ url: 'La URL es obligatoria.' });
  });
});