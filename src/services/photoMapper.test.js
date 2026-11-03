import { describe, expect, it } from 'vitest';
import {
  buildPhotoPayload,
  buildPhotoTargets,
  buildPhotoUpdatePayload,
  parseTargetValue,
  photoToFormValues,
  toTargetValue,
} from './photoMapper';

describe('photoMapper', () => {
  it('codifica y decodifica el destino', () => {
    expect(toTargetValue('pets', 7)).toBe('pets:7');
    expect(parseTargetValue('shelters:2')).toEqual({ owner: 'shelters', ownerId: 2 });
  });

  it('rechaza destinos inválidos', () => {
    expect(parseTargetValue('')).toBeNull();
    expect(parseTargetValue(undefined)).toBeNull();
    expect(parseTargetValue('cats:1')).toBeNull();
    expect(parseTargetValue('pets:')).toBeNull();
    expect(parseTargetValue('pets:abc')).toBeNull();
  });

  it('arma los destinos de una mascota y su refugio', () => {
    const pet = { id: 1, name: 'Luna', species: 'Perro' };
    const shelter = { id: 2, name: 'Refugio Adopciones' };
    expect(buildPhotoTargets({ pet, shelter })).toEqual([
      { value: 'pets:1', label: 'Luna · Perro' },
      { value: 'shelters:2', label: 'Refugio Adopciones · Refugio' },
    ]);
  });

  it('arma solo el destino disponible', () => {
    expect(buildPhotoTargets({ shelter: { id: 2, name: 'R' } })).toEqual([
      { value: 'shelters:2', label: 'R · Refugio' },
    ]);
    expect(buildPhotoTargets()).toEqual([]);
  });

  it('construye el payload de una foto de mascota', () => {
    expect(buildPhotoPayload({ target: 'pets:1', url: ' https://x.co/a.jpg ' })).toEqual({
      url: 'https://x.co/a.jpg',
      pet: { id: 1 },
    });
  });

  it('construye el payload de una foto de refugio', () => {
    expect(buildPhotoPayload({ target: 'shelters:2', url: 'https://x.co/a.jpg' })).toEqual({
      url: 'https://x.co/a.jpg',
      shelter: { id: 2 },
    });
  });

  it('no incluye destino si no hay uno válido', () => {
    expect(buildPhotoPayload({ target: '', url: 'https://x.co/a.jpg' })).toEqual({
      url: 'https://x.co/a.jpg',
    });
  });

  it('el payload de edición solo lleva la URL', () => {
    expect(buildPhotoUpdatePayload({ target: 'pets:1', url: ' https://x.co/b.jpg ' })).toEqual({
      url: 'https://x.co/b.jpg',
    });
  });

  it('convierte una foto en valores de formulario', () => {
    expect(photoToFormValues({ id: 3, url: 'https://x.co/a.jpg' }, 'pets:1')).toEqual({
      target: 'pets:1',
      url: 'https://x.co/a.jpg',
    });
    expect(photoToFormValues({ id: 3 }, 'pets:1').url).toBe('');
  });
});