import { describe, it, expect } from 'vitest';
import { CONTENT_MAX_LENGTH, validateMessage } from './messageValidation';

describe('validateMessage', () => {
  it('acepta un mensaje con contenido', () => {
    expect(validateMessage({ content: 'Hola, quiero adoptar' })).toEqual({});
  });

  it('exige el contenido cuando está vacío, con espacios o falta', () => {
    const message = 'El mensaje es obligatorio.';
    expect(validateMessage({ content: '' }).content).toBe(message);
    expect(validateMessage({ content: '   ' }).content).toBe(message);
    expect(validateMessage({ content: null }).content).toBe(message);
    expect(validateMessage({}).content).toBe(message);
  });

  it('acepta un mensaje del largo máximo y rechaza uno más largo', () => {
    expect(validateMessage({ content: 'a'.repeat(CONTENT_MAX_LENGTH) })).toEqual({});
    expect(validateMessage({ content: 'a'.repeat(CONTENT_MAX_LENGTH + 1) }).content).toBe(
      'El mensaje no puede superar los 255 caracteres.',
    );
  });

  it('no cuenta los espacios de los extremos', () => {
    expect(validateMessage({ content: ` ${'a'.repeat(CONTENT_MAX_LENGTH)} ` })).toEqual({});
  });
});